import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as validateUtils from '../../utils/validateUtils.js';
//kafka消费者
import * as getClient from '../../utils/KafkaUtils/getClient.js';

import {chains, ipfsConf, mysqlConf, debugMode, buyOrderContractAddr, sellOrderContractAddr} from '../../utils/info.js';
//kafka集群
/*----------消息队列----------*/
/*创建KafkaClient,且ConsumerQueue为所有消费者的接收队列，队列中存的是解析后的json结构对象*/
const KafkaClient_Watch2 = await getClient.getClient();
let ConsumerQueue = [];
KafkaClient_Watch2.Watch2WithKafkaInit(ConsumerQueue);

// /*----------------------------------------*/
const u = jlib.utils;

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const contractChain = chains[1]; // 权益链

/*----------创建链接(确权链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: contractChain.server[3], local_sign: true});

r.connect(async function(err, result) {

    /*---------确权链连接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

    /*----------监听交易，信息存入数据库----------*/

    r.on('ledger_closed', async function(msg) {

        // 开始计时
        console.log('on ledger_closed: ' + msg.ledger_index);
        console.time('chain2Watch');

        // 获取所有交易哈希
        let ledgerIndex = msg.ledger_index;
        let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
        let txHashs = ledger.transactions;
        const txLoopConter = txHashs.length - 1;

        // 获取所有交易信息
        let txPromises = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let txHash = txHashs[i];
            txPromises.push(requestInfo.requestTx(r, txHash, false));
        }
        let txs = await Promise.all(txPromises);

        // 筛选通证买单提交、卖单提交、匹配结果、买方确认、卖方确认5类交易
        let buyOrderTxs = [];
        let sellOrderTxs = [];
        let matchTxs = [];
        let buyerConfirmTxs = [];
        let sellerConfirmTxs = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            switch(txType) {
                case 'AlethContract':
                    let processedTx = u.processTx(tx, src);
                    processedTx.account = src;
                    let contractMethod = processedTx.func;
                    switch(dst) {
                        case buyOrderContractAddr:
                            switch(contractMethod) {
                                case 'makeOrder': 
                                    buyOrderTxs.push(processedTx);
                                    break;
                                case 'updateMatches':
                                    matchTxs.push(processedTx);
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case sellOrderContractAddr:
                            switch(contractMethod) {
                                case 'makeOrder': 
                                    sellOrderTxs.push(processedTx);
                                    break;
                                case 'makeBuyIntention':
                                    buyerConfirmTxs.push(processedTx);
                                    break;
                                case 'commitOrder':
                                    sellerConfirmTxs.push(processedTx);
                                    break;
                                default:
                                    break;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        //根据队列中的对象依次执行 买单、卖单、匹配结果、买卖确认
        await processBuyOrder(buyOrderTxs, buyOrderTxs.length);
        await processSellOrder(sellOrderTxs, sellOrderTxs.length);
        await processMatch(matchTxs, matchTxs.length);
        await processBuyerConfirmTxs(buyerConfirmTxs, buyerConfirmTxs.length);
        await processSellerConfirmTxs(sellerConfirmTxs, sellerConfirmTxs.length);

        // 结束计时
        console.timeEnd('chain2Watch');
        console.log('--------------------');

    });

});

async function processBuyOrder(buyOrderTxs, loopConter) {

    console.log('buyOrderTxs:', buyOrderTxs);

    buyOrderTxs.forEach(async(buyOrderTx) => {

        let buyOrderId = buyOrderTx.func_parms[0].replace(/\'/g,"");
        let contractAddr = buyOrderTx.destination;
        
        let buyOrderInfoHash = buyOrderTx.func_parms[1].replace(/\'/g,"");
        let buyOrderInfoJson = await ipfsUtils.get(ipfs, buyOrderInfoHash);
        let buyOrderInfo = JSON.parse(buyOrderInfoJson);
        buyOrderInfo.buyOrderId = buyOrderId;

        // 格式验证
        let [validateRes, validateInfo] = await validateUtils.validateBuyOrderWatch(buyOrderInfo);
        if(!validateRes) {
            return validateInfo;
        }

        buyOrderInfo.buyOrderHash = '0';
        buyOrderInfo.contractAddr = contractAddr;
        buyOrderInfo.timeStamp = 0;

        console.log(buyOrderInfo.buyOrderId);
        // 推送买单信息
        // KafkaClient_Watch2.ProducerSend(buyOrderContractAddr + '_BuyOrder', buyOrderInfo);
        KafkaClient_Watch2.ProducerSend('BuyOrder', buyOrderInfo.buyOrderId);


    });
    
}

async function processSellOrder(sellOrderTxs, loopConter) { // 如果京东平台层一定通过中间层上传卖单，则不需要数据格式验证

    console.log('sellOrderTxs:', sellOrderTxs);

    sellOrderTxs.forEach(async(sellOrderTx) => {

        let sellOrderId = sellOrderTx.func_parms[0].replace(/\'/g,"");
        let workId = sellOrderTx.func_parms.toString().match(/(.*)\[(.*)\](.*)/)[2].replace(/\'/g,"").split(',');
        let contractAddr = sellOrderTx.destination;
        
        let sellOrderInfoHash = sellOrderTx.func_parms.pop().replace(/\'/g,"");
        let sellOrderInfoJson = await ipfsUtils.get(ipfs, sellOrderInfoHash);
        let sellOrderInfo = JSON.parse(sellOrderInfoJson);
        delete sellOrderInfo.sellerAddr;
        delete sellOrderInfo.contact;

        sellOrderInfo.sellOrderId = sellOrderId;
        sellOrderInfo.sellOrderHash = '0';
        sellOrderInfo.timeStamp = 0;
        sellOrderInfo.workId = workId;
        sellOrderInfo.matchScore = 0;
        sellOrderInfo.contractAddr = contractAddr;

        console.log(sellOrderInfo.sellOrderId);
        // 推送卖单信息
        // KafkaClient_Watch2.ProducerSend(sellOrderContractAddr + '_SellOrder', sellOrderInfo);
        KafkaClient_Watch2.ProducerSend('SellOrder', sellOrderInfo);


    });

}

async function processMatch(matchTxs, loopConter) { // 如果智能交易系统一定通过中间层写入匹配结果，则不需要数据格式验证

    console.log('matchTxs:', matchTxs);

    matchTxs.forEach(async(matchTx) => {
        
        let matchInfoHash = matchTx.func_parms[2];
        let matchInfoJson = await ipfsUtils.get(ipfs, matchInfoHash);
        let matchInfo = JSON.parse(matchInfoJson);

        console.log(matchInfo);
        // 推送交易匹配信息
        KafkaClient_Watch2.ProducerSend(buyOrderContractAddr + '_Match',matchInfo);

    });

}

async function processBuyerConfirmTxs(buyerConfirmTxs, loopConter) {

    console.log('buyerConfirmTxs:', buyerConfirmTxs);

    buyerConfirmTxs.forEach(async(buyerConfirmTx) => {

        let sellOrderId = buyerConfirmTx.func_parms[0];

        let buyOrderInfoHash = matchTx.func_parms[2];
        let buyOrderInfoJson = await ipfsUtils.get(ipfs, buyOrderInfoHash);
        let buyerConfirmInfo = {};
        buyerConfirmInfo.buyOrderInfo = JSON.parse(buyOrderInfoJson);

        buyerConfirmInfo.sellOrderId = sellOrderId;

        console.log(buyerConfirmInfo);
        //推送买方确认信息
        KafkaClient_Watch2.ProducerSend(sellOrderContractAddr + '_BuyerConfirmTxs', buyerConfirmInfo);

    });

}

async function processSellerConfirmTxs(sellerConfirmTxs, loopConter) {

    console.log('sellerConfirmTxs:', sellerConfirmTxs);

    sellerConfirmTxs.forEach(async(sellerConfirmTx) => {

        let sellOrderId = sellerConfirmTx.func_parms[0];
        let buyerAddr = sellerConfirmTx.func_parms[3];

        let sellConfirmInfo = {
            sellOrderId: sellOrderId,
            buyerAddr: buyerAddr,
        }

        console.log(sellConfirmInfo);
        //推送卖方确认信息
        KafkaClient_Watch2.ProducerSend(sellOrderContractAddr + '_SellerConfirmTxs', sellConfirmInfo);

    });

}