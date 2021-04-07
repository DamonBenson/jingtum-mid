import jlib from 'jingtum-lib';

import * as requestInfo from '../../../../utils/jingtum/requestInfo.js';
import * as fetch from '../../../../utils/fetch.js';
import {getConsumer} from '../../../../utils/kafkaUtils/getConsumer.js';

import {chains, userAccount, sellOrderContractAddr, debugMode} from '../../../../utils/info.js';

const platformAddr = userAccount[5].address;
const platformSecret = userAccount[5].secret;

const contractChain = chains[1];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    let mq = await getConsumer();
    mq.ConConsumer(undefined, [{'topic': 'BuyOrderContractAddr_Match'}], undefined, postBuyerConfirmReq);// 买单确认查收

});

async function postBuyerConfirmReq(msg) {

    console.time('buyerConfirmReq');
    //  处理消息队列的消息
    msg.value = JSON.parse(msg.value);
    let buyOrderInfo = msg.value.buyOrderInfo;
    let sellOrderInfo = msg.value.sellOrderInfo;
    let sellOrderAmount = sellOrderInfo.length;
    //  继续提取合约地址、卖单ID
    let contractAddrs = (new Array(sellOrderAmount)).fill(sellOrderContractAddr);
    let sellOrderIds = sellOrderInfo.map(order => {
        return order.sellOrderId;
    })
    let expireTime = 86400;
    //  再生数据结构
    let confirmMsg = {
        contractAddrs: contractAddrs, // 合约列表
        platformAddr: platformAddr,
        sellOrderId: sellOrderIds, // 订单列表
        expireTime: expireTime,
        buyOrderInfo: buyOrderInfo,
    }
    //  提交买单确认信息
    let buyerConfirmRes = await fetch.postData('http://127.0.0.1:9001/transaction/buyerConfirm', confirmMsg);
    //  解析出买单签名
    let buf = Buffer.from(buyerConfirmRes.body._readableState.buffer.head.data);
    let txsJson = JSON.parse(buf.toString());
    let signedTxPromises = txsJson.map(txJson => {
        let unsignedTx = {
            tx_json: txJson,
        };
        jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        let blob = unsignedTx.tx_json.blob;
        return fetch.postData('http://127.0.0.1:9001/transaction/signedBuyerConfirm/sellOrder', blob);
    })
    //  提交买单签名
    await Promise.all(signedTxPromises);

    console.timeEnd('buyerConfirmReq');
    console.log('--------------------');

}