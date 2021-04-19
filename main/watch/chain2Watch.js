import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as transactionValidate from '../../utils/validateUtils/transaction.js';
//kafka消费者
import * as getClient from '../../utils/KafkaUtils/getClient.js';

import {chains, ipfsConf, mysqlConf, debugMode, buyOrderContractAddrs, sellOrderContractAddrs} from '../../utils/info.js';
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
        // 结尾ss表示二维数组（多个合约，每个合约多个调用）
        let buyOrderTxss = [buyOrderContractAddrs.length];
        for(let i = buyOrderContractAddrs.length - 1; i >= 0; i--) {
            buyOrderTxss[i] = [];
        }
        let buyOrderConfirmTxss = [buyOrderContractAddrs.length];
        for(let i = buyOrderContractAddrs.length - 1; i >= 0; i--) {
            buyOrderConfirmTxss[i] = [];
        }
        let sellOrderTxss = [sellOrderContractAddrs.length];
        for(let i = sellOrderContractAddrs.length - 1; i >= 0; i--) {
            sellOrderTxss[i] = [];
        }
        let matchTxss = [buyOrderContractAddrs.length];
        for(let i = buyOrderContractAddrs.length - 1; i >= 0; i--) {
            matchTxss[i] = [];
        }
        let buyerConfirmTxss = [sellOrderContractAddrs.length];
        for(let i = sellOrderContractAddrs.length - 1; i >= 0; i--) {
            buyerConfirmTxss[i] = [];
        }
        let sellerConfirmTxss = [sellOrderContractAddrs.length];
        for(let i = sellOrderContractAddrs.length - 1; i >= 0; i--) {
            sellerConfirmTxss[i] = [];
        }

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
                    if(buyOrderContractAddrs.includes(dst)) {
                        let index = buyOrderContractAddrs.indexOf(dst);
                        switch(contractMethod) {
                            case 'makeOrder': 
                                buyOrderTxss[index].push(processedTx);
                                break;
                            case 'acceptOrder':
                                buyOrderConfirmTxss[index].push(processedTx);
                                break;
                            case 'updateMatches':
                                matchTxss[index].push(processedTx);
                                break;
                            default:
                                break;
                        }
                        break;
                    }
                    if(sellOrderContractAddrs.includes(dst)) {
                        let index = sellOrderContractAddrs.indexOf(dst);
                        switch(contractMethod) {
                            case 'makeOrder': 
                                sellOrderTxss[index].push(processedTx);
                                break;
                            case 'makeBuyIntention':
                                buyerConfirmTxss[index].push(processedTx);
                                break;
                            case 'commitOrder':
                                sellerConfirmTxss[index].push(processedTx);
                                break;
                            default:
                                break;
                        }
                        break;
                    }
                    break;
                default:
                    break;
            }
        }
        //根据队列中的对象依次执行 买单、卖单、匹配结果、买卖确认
        await processBuyOrder(buyOrderTxss, buyOrderTxss.length);
        await processBuyOrderConfirm(buyOrderConfirmTxss, buyOrderConfirmTxss.length);
        await processSellOrder(sellOrderTxss, sellOrderTxss.length);
        await processMatch(matchTxss, matchTxss.length);
        // await processBuyerConfirm(buyerConfirmTxss, buyerConfirmTxss.length);
        // await processSellerConfirm(sellerConfirmTxss, sellerConfirmTxss.length);

        // 结束计时
        console.timeEnd('chain2Watch');
        console.log('--------------------');

    });

});

async function processBuyOrder(buyOrderTxss, loopConter) {

    console.log('buyOrderTxss:', buyOrderTxss);

    buyOrderTxss.forEach(async(buyOrderTxs, index) => {

        buyOrderTxs.forEach(async(buyOrderTx) => {
    
            let buyOrderId = buyOrderTx.func_parms[0].replace(/\'/g,"");
            let contractAddr = buyOrderTx.destination;
            let platformAddr = buyOrderTx.account;
            
            let buyOrderInfoHash = buyOrderTx.func_parms[1].replace(/\'/g,"");
            let buyOrderInfoJson = await ipfsUtils.get(ipfs, buyOrderInfoHash);
            let buyOrderInfo = JSON.parse(buyOrderInfoJson);
            buyOrderInfo.buyOrderId = buyOrderId;

            let [validateInfoRes, validateInfo] = await transactionValidate.validateBuyOrderWatch(buyOrderInfo);
            if(!validateInfoRes) {
                console.log(validateInfo);
                return;
            }
            
            buyOrderInfo.contractAddr = contractAddr;
            buyOrderInfo.platformAddr = platformAddr;
            buyOrderInfo.buyOrderHash = '0';
            buyOrderInfo.timeStamp = 0;
    
            console.log(buyOrderInfo);
            // 推送买单信息
            KafkaClient_Watch2.ProducerSend(buyOrderContractAddrs[index] + '_BuyOrder', buyOrderInfo);
    
        });

    });
    
}

async function processBuyOrderConfirm(buyOrderConfirmTxss, loopConter) {

    console.log('buyOrderConfirmTxss:', buyOrderConfirmTxss);

    buyOrderConfirmTxss.forEach(async(buyOrderConfirmTxs, index) => {

        buyOrderConfirmTxs.forEach(async(buyOrderConfirmTx) => {

            let buyOrderId = buyOrderConfirmTx.func_parms[0].replace(/\'/g,"");
            let buyOrderHash = buyOrderConfirmTx.func_parms[2].replace(/\'/g,"");
    
            let buyOrderConfirmInfo = {
                buyOrderId: buyOrderId,
                buyOrderHash: buyOrderHash,
            };
    
            console.log(buyOrderConfirmInfo);
            // 推送买单信息
            // KafkaClient_Watch2.ProducerSend(buyOrderContractAddrs[0] + '_BuyOrder', buyOrderInfo);
            KafkaClient_Watch2.ProducerSend(buyOrderContractAddrs[index] + '_buyOrderConfirm', buyOrderConfirmInfo);
    
        });

    });
    
}

async function processSellOrder(sellOrderTxss, loopConter) {

    console.log('sellOrderTxss:', sellOrderTxss);

    sellOrderTxss.forEach(async(sellOrderTxs, index) => {

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
    
            console.log(sellOrderInfo);
            // 推送卖单信息
            KafkaClient_Watch2.ProducerSend(sellOrderContractAddrs[index] + '_SellOrder', sellOrderInfo);
    
        });

    });

}

async function processMatch(matchTxss, loopConter) {

    console.log('matchTxss:', matchTxss);

    matchTxss.forEach(async(matchTxs, index) => {

        matchTxs.forEach(async(matchTx) => {
        
            let matchInfoHash = matchTx.func_parms[2];
            let matchInfoJson = await ipfsUtils.get(ipfs, matchInfoHash);
            let matchInfo = JSON.parse(matchInfoJson);
    
            console.log(matchInfo);
            // 推送交易匹配信息
            KafkaClient_Watch2.ProducerSend(buyOrderContractAddrs[index] + '_Match', matchInfo);
    
        });

    });

}

// async function processBuyerConfirm(buyerConfirmTxss, loopConter) {

//     console.log('buyerConfirmTxss:', buyerConfirmTxss);

//     buyerConfirmTxss.forEach(async(buyerConfirmTxs) => {

//         let sellOrderId = buyerConfirmTx.func_parms[0];

//         let buyOrderInfoHash = matchTx.func_parms[2];
//         let buyOrderInfoJson = await ipfsUtils.get(ipfs, buyOrderInfoHash);
//         let buyerConfirmInfo = {};
//         buyerConfirmInfo.buyOrderInfo = JSON.parse(buyOrderInfoJson);

//         buyerConfirmInfo.sellOrderId = sellOrderId;

//         console.log(buyerConfirmInfo);
//         //推送买方确认信息
//         KafkaClient_Watch2.ProducerSend(sellOrderContractAddrs[0] + '_BuyerConfirmTxs', buyerConfirmInfo);

//     });

// }

// async function processSellerConfirm(sellerConfirmTxss, loopConter) {

//     console.log('sellerConfirmTxss:', sellerConfirmTxss);

//     sellerConfirmTxss.forEach(async(sellerConfirmTxs) => {

//         let sellOrderId = sellerConfirmTx.func_parms[0];
//         let buyerAddr = sellerConfirmTx.func_parms[3];

//         let sellConfirmInfo = {
//             sellOrderId: sellOrderId,
//             buyerAddr: buyerAddr,
//         }

//         console.log(sellConfirmInfo);
//         //推送卖方确认信息
//         KafkaClient_Watch2.ProducerSend(sellOrderContractAddrs[0] + '_SellerConfirmTxs', sellConfirmInfo);

//     });

// }