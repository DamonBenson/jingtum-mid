import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';
import util from 'util';

import {chains, userAccount, buyOrderContractAddr, debugMode} from '../../utils/info.js';
import { exit, kill } from 'process';
// const MidIP = '39.102.93.47';// 中间层服务器IP
const MidIP = 'localhost';// 中间层服务器IP
const msPerBuyOrder = 10000;
const subBuyOrderListAmount = 3;
const platformAddr = userAccount[5].address;
const platformSecret = userAccount[5].secret;
const buyerAddr = userAccount[9].address;

// setInterval(postBuyOrderReq, msPerBuyOrder);

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

    // setInterval(postBuyOrderReq, msPerBuyOrder);
    postBuyOrderReq();
    // localUtils.sleep(5000)
    // exit();

});

async function postBuyOrderReq() {

    console.time('buyOrderReq');
    let buyOrder = generateBuyOrder();
    if(debugMode) console.log('buyOrder:', buyOrder);
    let buyOrderRes = await fetch.postData(util.format('http://%s:9001/transaction/buy', MidIP), buyOrder);
    let buf = Buffer.from(buyOrderRes.body._readableState.buffer.head.data);
    // if(debugMode) console.log('buf.toString():', buf.toString());
    let txJson = JSON.parse(buf.toString());
    let unsignedTx = {
        tx_json: txJson,
    };
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;
    await fetch.postData(util.format('http://%s:9001/transaction/signedBuy', MidIP), blob);
    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}

function generateBuyOrder() {
    
    let subBuyOrderList = [];
    for(let i = subBuyOrderListAmount; i > 0; i--) {
        subBuyOrderList.push({
            labelAmount: localUtils.randomNumber(1, 5),
            labelDemand: generateLabelDemand(),
            labelWeight: generateLabelWeight(),
        })
    }
    let limitPrice = localUtils.randomNumber(1000, 10000);
    let tradeStrategy = 1;
    let authorizationType = localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrderList: subBuyOrderList,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr,
        contact: 'phoneNumber', // 联系方式
        platformAddr: platformAddr,
        contractAddr: buyOrderContractAddr, // 待部署
    }
    buyOrder.buyOrderId = sha256(seq.toString()).toString();

    return buyOrder;

}

function generateLabelDemand() {

    let labelDemand = {};
    for(let i = 0; i < 5; i++) {
        // labelDemand[i] = [localUtils.randomSelect([0, 1, 2, 3, 4])];
        labelDemand[i] = [0];
    }
    return labelDemand;

}

function generateLabelWeight() {

    let labelWeight = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
    }
    for(let i = 0; i < 5; i++) {
        for(let j = 0; j < 5; j++) {
            labelWeight[i][j] = [localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];  //跟generateLabelDemand冲突？
        }
    }
    return labelWeight;

}

function generateAuthorizationInfo(authorizationType) {

    let authorizationInfo = {};
    authorizationInfo[authorizationType] = {};
    switch(authorizationType) {
        case 0:
        case 8:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 1:
        case 2:
        case 7:
        case 9:
            authorizationInfo[authorizationType].authorizationChannel = 0;
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 3:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 4:
        case 5:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = 0;
            break;
        case 6:
            authorizationInfo[authorizationType].authorizationChannel = 0;
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = 0;
            break;
        default:
            break;
    }
    return authorizationInfo;

}
