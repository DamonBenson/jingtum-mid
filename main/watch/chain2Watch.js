import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {chains, ipfsConf, mysqlConf, debugMode, rightTokenName, buyOrderContractAddr, sellOrderContractAddr} from '../../utils/info.js';

const u = jlib.utils;

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const contractChain = chains[1]; // 确权链

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

    let tokenTx = {}; // 用以判断哪些通证发行交易中的确权信息已经存入数据库（对于确权信息，只需推送17个中的一个）

    /*----------监听交易，信息存入数据库----------*/

    r.on('ledger_closed', async function(msg) {

        // 开始计时
        console.log('on ledger_closed: ' + msg.ledger_index);
        let sTs = (new Date()).valueOf();

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

        console.log(txs);

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

        await processBuyOrder(buyOrderTxs, buyOrderTxs.length);
        await processSellOrder(sellOrderTxs, sellOrderTxs.length);
        await processMatch(matchTxs, matchTxs.length);
        await processBuyerConfirmTxs(buyerConfirmTxs, buyerConfirmTxs.length);
        await processSellerConfirmTxs(sellerConfirmTxs, sellerConfirmTxs.length);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});

async function processBuyOrder(buyOrderTxs, loopConter) {

    console.log('buyOrderTxs:', buyOrderTxs);

    buyOrderTxs.forEach(async(buyOrderTx) => {

        let orderId = buyOrderTx.func_parms[0];
        let platformAddr = buyOrderTx.account;
        let timeStamp = buyOrderTx.date;
        
        let orderInfoHash = buyOrderTx.func_parms[1];
        let orderInfoJson = await ipfsUtils.get(ipfs, orderInfoHash);
        let orderInfo = JSON.parse(orderInfoJson);

        orderInfo.orderId = orderId;
        orderInfo.platformAddr = platformAddr;
        orderInfo.timeStamp = timeStamp;

        console.log(orderInfo);
        // 推送买单信息

    });

}

async function processSellOrder(sellOrderTxs, loopConter) {

    console.log('sellOrderTxs:', sellOrderTxs);

    sellOrderTxs.forEach(async(sellOrderTx) => {

        let orderId = sellOrderTx.func_parms[0];
        let timeStamp = sellOrderTx.date;
        
        let orderInfoHash = sellOrderTx.func_parms[1];
        let orderInfoJson = await ipfsUtils.get(ipfs, orderInfoHash);
        let orderInfo = JSON.parse(orderInfoJson);
        delete orderInfo.sellerAddr;
        delete orderInfo.contact;

        orderInfo.orderId = orderId;
        orderInfo.timeStamp = timeStamp;

        console.log(orderInfo);
        // 推送卖单信息

    });

}

async function processMatch(matchTxs, loopConter) {

    console.log('matchTxs:', matchTxs);

    matchTxs.forEach(async(matchTx) => {
        
        let matchInfoHash = matchTx.func_parms[2];
        let matchInfoJson = await ipfsUtils.get(ipfs, matchInfoHash);
        let matchInfo = JSON.parse(matchInfoJson);

        console.log(matchInfo);
        // 推送交易匹配信息

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

    });

}

async function processSellerConfirmTxs(sellerConfirmTxs, loopConter) {

    console.log('sellerConfirmTxs:', sellerConfirmTxs);

    sellerConfirmTxs.forEach(async(sellerConfirmTx) => {

        let sellOrderId = sellerConfirmTx.func_parms[0];

        console.log(sellOrderId);
        //推送卖方确认信息

    });

}