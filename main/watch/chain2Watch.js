import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as transactionValidate from '../../utils/validateUtils/transaction.js';
import * as getClient from '../../utils/KafkaUtils/getClient.js';

import {userAccount, chains, tokenName, contractAddr} from '../../utils/config/jingtum.js';
import {mysqlConf} from '../../utils/config/mysql.js';

/*创建KafkaClient,且ConsumerQueue为所有消费者的接收队列，队列中存的是解析后的json结构对象*/
const KafkaClient_Watch2 = await getClient.getClient();
let ConsumerQueue = [];
KafkaClient_Watch2.Watch2WithKafkaInit(ConsumerQueue);

const u = jlib.utils;

const contractChain = chains[2]; // 权益链

/*----------创建链接(确权链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: contractChain.server[2], local_sign: true});

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

        // 筛选通证买单提交、买单确认、卖单提交、匹配结果、买方确认、卖方确认5类交易
        // 结尾ss表示二维数组（多个合约，每个合约多个调用）
        let buyOrderTxss = [contractAddr.buyOrder.length];
        for(let i = contractAddr.buyOrder.length - 1; i >= 0; i--) {
            buyOrderTxss[i] = [];
        }
        let buyOrderAcceptTxss = [contractAddr.buyOrder.length];
        for(let i = contractAddr.buyOrder.length - 1; i >= 0; i--) {
            buyOrderAcceptTxss[i] = [];
        }
        let sellOrderTxss = [contractAddr.sellOrder.length];
        for(let i = contractAddr.sellOrder.length - 1; i >= 0; i--) {
            sellOrderTxss[i] = [];
        }
        let matchTxss = [contractAddr.buyOrder.length];
        for(let i = contractAddr.buyOrder.length - 1; i >= 0; i--) {
            matchTxss[i] = [];
        }
        let buyerConfirmTxss = [contractAddr.sellOrder.length];
        for(let i = contractAddr.sellOrder.length - 1; i >= 0; i--) {
            buyerConfirmTxss[i] = [];
        }
        let sellerConfirmTxss = [contractAddr.sellOrder.length];
        for(let i = contractAddr.sellOrder.length - 1; i >= 0; i--) {
            sellerConfirmTxss[i] = [];
        }

        // 筛选发送确权请求、写入确权结果2类交易
        // let authenticateReqTxss = [contractAddr.authenticate.length];
        // for(let i = contractAddr.authenticate.length - 1; i >= 0; i--) {
        //     authenticateReqTxss[i] = [];
        // }
        // let authenticateResTxss = [contractAddr.authenticate.length];
        // for(let i = contractAddr.authenticate.length - 1; i >= 0; i--) {
        //     authenticateResTxss[i] = [];
        // }

        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            let processedTx = u.processTx(tx, src);
            processedTx.account = src;
            switch(txType) {
                case 'AlethContract':
                    let contractMethod = processedTx.func;
                    if(contractAddr.buyOrder.includes(dst)) {
                        let index = contractAddr.buyOrder.indexOf(dst);
                        switch(contractMethod) {
                            case 'makeOrder': 
                                buyOrderTxss[index].push(processedTx);
                                break;
                            case 'acceptOrder':
                                buyOrderAcceptTxss[index].push(processedTx);
                                break;
                            case 'updateMatches':
                                matchTxss[index].push(processedTx);
                                break;
                            default:
                                break;
                        }
                    }
                    else if(contractAddr.sellOrder.includes(dst)) {
                        let index = contractAddr.sellOrder.indexOf(dst);
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
                    }
                    // else if(contractAddr.authenticate.includes(dst)) {
                    //     let index = contractAddr.sellOrder.indexOf(dst);
                    //     switch(contractMethod) {
                    //         case 'req': 
                    //             authenticateReqTxss[index].push(processedTx);
                    //             break;
                    //         case 'res':
                    //             authenticateResTxss[index].push(processedTx);
                    //             break;
                    //         default:
                    //             break;
                    //     }
                    // }
                    break;
                default:
                    break;
            }
        }
        //根据队列中的对象依次执行 买单、卖单、匹配结果、买卖确认
        await processBuyOrder(buyOrderTxss, buyOrderTxss.length);
        await processBuyOrderAccept(buyOrderAcceptTxss, buyOrderAcceptTxss.length);
        await processSellOrder(sellOrderTxss, sellOrderTxss.length);
        await processMatch(matchTxss, matchTxss.length);
        // await processBuyerConfirm(buyerConfirmTxss, buyerConfirmTxss.length);
        // await processSellerConfirm(sellerConfirmTxss, sellerConfirmTxss.length);
        // await processAuthenticateReq(authenticateReqTxss, authenticateReqTxss.length);
        // await processAuthenticateRes(authenticateResTxss, authenticateResTxss.length);

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
            let platformAddr = buyOrderTx.account;
            
            let buyOrderInfoHash = buyOrderTx.func_parms[1].replace(/\'/g,"");
            let buyOrderInfo = await ipfsUtils.get(buyOrderInfoHash);
            buyOrderInfo.buyOrderId = buyOrderId;
            
            buyOrderInfo.contractAddr = buyOrderTx.destination;
            buyOrderInfo.platformAddr = platformAddr;
            buyOrderInfo.buyOrderHash = '0';
            buyOrderInfo.timeStamp = 0;
    
            console.log(buyOrderInfo);
            // 推送买单信息
            KafkaClient_Watch2.ProducerSend(contractAddr.buyOrder[index] + '_BuyOrder', buyOrderInfo);
    
        });

    });
    
}

async function processBuyOrderAccept(buyOrderAcceptTxss, loopConter) {

    console.log('buyOrderAcceptTxss:', buyOrderAcceptTxss);

    buyOrderAcceptTxss.forEach(async(buyOrderAcceptTxs, index) => {

        buyOrderAcceptTxs.forEach(async(buyOrderAcceptTx) => {

            let buyOrderId = buyOrderAcceptTx.func_parms[0].replace(/\'/g,"");
            let buyOrderHash = buyOrderAcceptTx.func_parms[2].replace(/\'/g,"");
    
            let buyOrderAcceptInfo = {
                buyOrderId: buyOrderId,
                buyOrderHash: buyOrderHash,
            };
    
            console.log(buyOrderAcceptInfo);
            // 推送买单信息
            // KafkaClient_Watch2.ProducerSend(buyOrderContractAddrs[0] + '_BuyOrder', buyOrderInfo);
            KafkaClient_Watch2.ProducerSend(contractAddr.buyOrder[index] + '_buyOrderAccept', buyOrderAcceptInfo);
    
        });

    });
    
}

async function processSellOrder(sellOrderTxss, loopConter) {

    console.log('sellOrderTxss:', sellOrderTxss);

    sellOrderTxss.forEach(async(sellOrderTxs, index) => {

        sellOrderTxs.forEach(async(sellOrderTx) => {

            let sellOrderId = sellOrderTx.func_parms[0].replace(/\'/g,"").replace(/0x/g,"");
            let workId = sellOrderTx.func_parms.toString().match(/(.*)\[(.*)\](.*)/)[2].replace(/\'/g,"").split(',');
            workId = workId.map(id => {
                return id.replace(/0x/g,"");
            });
            
            let sellOrderInfoHash = sellOrderTx.func_parms.pop().replace(/\'/g,"");
            let sellOrderInfo = await ipfsUtils.get(sellOrderInfoHash);
            delete sellOrderInfo.sellerAddr;
            delete sellOrderInfo.contact;
    
            sellOrderInfo.sellOrderId = sellOrderId;
            sellOrderInfo.sellOrderHash = '0';
            sellOrderInfo.timeStamp = 0;
            sellOrderInfo.workId = workId;
            sellOrderInfo.matchScore = 0;
            sellOrderInfo.contractAddr = sellOrderTx.destination;
    
            console.log(sellOrderInfo);
            // 推送卖单信息
            KafkaClient_Watch2.ProducerSend(contractAddr.sellOrder[index] + '_SellOrder', sellOrderInfo);
    
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
            KafkaClient_Watch2.ProducerSend(contractAddr.buyOrder[index] + '_Match', matchInfo);
    
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

async function processAuthenticateReq(authenticateReqTxss, loopConter) {

    console.log('authenticateReqTxss:', authenticateReqTxss);

    authenticateReqTxss.forEach(async(authenticateReqTxs, index) => {

        authenticateReqTxs.forEach(async(authenticateReqTx) => {
    
            // 方法体

            // 推送买单信息
            KafkaClient_Watch2.ProducerSend(contractAddr.authenticate[index] + '_AuthenticateReq', authenticateReqInfo);
    
        });

    });
    
}

async function processAuthenticateRes(authenticateResTxss, loopConter) {

    console.log('authenticateResTxss:', authenticateResTxss);

    authenticateResTxss.forEach(async(authenticateResTxs, index) => {

        authenticateResTxs.forEach(async(authenticateResTx) => {
    
            // 方法体

            // 推送买单信息
            KafkaClient_Watch2.ProducerSend(contractAddr.authenticate[index] + '_AuthenticateRes', authenticateResssssInfo);
    
        });

    });
    
}