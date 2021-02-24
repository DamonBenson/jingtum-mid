import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {userAccount, debugMode} from '../../utils/info.js';

const msPerBuyOrder = 10000;
const subBuyOrderAmount = 3;
const platformAddress = userAccount[5].address;
const platformSecret = userAccount[5].secret;

// setInterval(postBuyOrderReq, msPerBuyOrder);

postBuyOrderReq();

async function postBuyOrderReq() {

    console.time('buyOrderReq');
    let buyOrder = generateBuyOrder();
    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }
    let unsignedTx = await fetch.postData('http://127.0.0.1:9001/transaction/buy', buyOrder);
    unsignedTx.setSecret(platformSecret);
    unsignedTx.sign();
    let blob = signedTx.blob;
    await fetch.postData('http://127.0.0.1:9001/transaction/signedBuy', blob);
    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}

function generateBuyOrder() {
    
    let subBuyOrder = [];
    for(let i = subBuyOrderAmount; i > 0; i--) {
        subBuyOrder.push({
            labelAmount: localUtils.randomNumber(1, 50),
            labelDemand: generateLabelDemand(),
            labelWeight: generateLabelWeight(),
        })
    }
    let limitPrice = localUtils.randomNumber(10000, 100000);
    let tradeStrategy = 1;
    let authorizationType = localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrder: subBuyOrder,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        contact: 'phoneNumber', // 联系方式
        addr: platformAddress,
        contractAddr: '', // 待部署
    }
    buyOrder.orderId = sha256(buyOrder).toString();
    return buyOrder;

}

function generateLabelDemand() {

    let labelDemand = {};
    for(let i = 0; i < 5; i++) {
        labelDemand[i] = [localUtils.randomSelect([0, 1, 2, 3, 4])];
    }
    return labelDemand;

}

function generateLabelWeight() {

    let labelWeight = {}
    for(let i = 0; i < 5; i++) {
        for(let j = 0; j < 5; j++) {
            labelDemand[i][j] = [localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];  //跟generateLabelDemand冲突？
        }
    }
    return labelWeight;

}

function generateAuthorizationInfo(authorizationType) {

    let authorizationInfo = {};
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