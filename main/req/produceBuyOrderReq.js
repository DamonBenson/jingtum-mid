import sha256 from 'crypto-js/sha256.js';

import * as localUtils from '../../utils/localUtils.js';
import * as getClient from '../../utils/KafkaUtils/getClient.js';

import {userAccount, buyOrderContractAddr, debugMode} from '../../utils/info.js';
/*----------消息队列----------*/
/*创建KafkaClient,且ConsumerQueue为所有消费者的接收队列，队列中存的是解析后的json结构对象*/
const randonBuyorder_KafkaClient = await getClient.getClient();
let ConsumerQueue = [];
randonBuyorder_KafkaClient.SetupClient(ConsumerQueue);

const msPerBuyOrder = 10000;
const subBuyOrderAmount = 3;
const platformAddr = userAccount[5].address;
const buyerAddr = userAccount[9].address;

setInterval(produceBuyOrderReq, msPerBuyOrder);
// //例子：模拟处理队列的过程：30s内读取数据并进行操作



function produceBuyOrderReq() {

    console.time('buyOrderReq');
    let buyOrder = generateBuyOrder();
    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }

    //mashall
    //unmashall

    // 推送买单信息
    randonBuyorder_KafkaClient.ProducerSend('BuyOrder',buyOrder);

    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}

function generateBuyOrder() {
    
    let subBuyOrder = [];
    for(let i = subBuyOrderAmount; i > 0; i--) {
        subBuyOrder.push({
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
        subBuyOrder: subBuyOrder,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr,
        contact: 'phoneNumber', // 联系方式
        addr: platformAddr,
        contractAddr: buyOrderContractAddr, // 待部署
        orderId :  localUtils.randomNumber(100, 100000).toString(),//origin as sha256  
    }

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
