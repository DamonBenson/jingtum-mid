import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as fetch from '../../../utils/fetch.js';
import util from 'util';

import {chains, userAccount, userAccountIndex, buyOrderContractAddrs, debugMode} from '../../../utils/info.js';
const MidIP = '39.102.93.47';// 中间层服务器IP
// const MidIP = 'localhost';// 本地IP
const msPerBuyOrder = 5000;
// const subBuyOrderListAmount = 3; 随机个数
const platformAddr = userAccount[userAccountIndex['买方平台账号']].address; // 平台账号
const platformSecret = userAccount[userAccountIndex['买方平台账号']].secret;
const buyerAddr = [ userAccount[userAccountIndex['用户1']].address,
                    userAccount[userAccountIndex['用户2']].address,
                    userAccount[userAccountIndex['用户3']].address,
                    userAccount[userAccountIndex['用户4']].address,
                    userAccount[userAccountIndex['用户5']].address,
                    userAccount[userAccountIndex['用户6']].address,];


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
    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }

    let unsignedRes = await fetch.postData(util.format('http://%s:9001/transaction/buy', MidIP), buyOrder);
    let unsignedResInfo = JSON.parse(Buffer.from(unsignedRes.body._readableState.buffer.head.data).toString());
    let txJson = unsignedResInfo.data.tx_json;
    let unsignedTx = {
        tx_json: txJson,
    };
    if(debugMode) {
        console.log('unsigned buy order:', unsignedResInfo);
    }
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;

    let signedRes = await fetch.postData(util.format('http://%s:9001/transaction/signedBuy', MidIP), blob);
    if(debugMode) {
        let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
        console.log('signed buy order:', resInfo);
    }

    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}

function generateBuyOrder() {
    
    let subBuyOrderList = generateSubBuyOrder();
    let limitPrice = localUtils.randomNumber(1000, 10000);
    let tradeStrategy = localUtils.randomSelect([0,1]); // 0-性价比最高策略 1-价格最低策略
    let authorizationType = localUtils.randomNumber(0,9); // 十个授权方式
    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrderList: subBuyOrderList,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr[localUtils.randomNumber(0,5)],//6个用户
        contact: 'phoneNumber', // 联系方式
        platformAddr: platformAddr,
        contractAddr: "未部署的外部合约地址",//buyOrderContractAddrs[0], 
    };
    buyOrder.buyOrderId = sha256(seq.toString()).toString();

    return buyOrder;

}

function generateSubBuyOrder() {
    let subBuyOrderList = [];
    let subBuyOrderListAmount = localUtils.randomNumber(1, 4)
    
    for(let i = subBuyOrderListAmount; i > 0; i--) {
        let labelDemand = {};
        let labelWeight = {};
        [labelDemand,labelWeight] = generateLabelDemand_AND_LabeWeight();
        subBuyOrderList.push({
            labelAmount: localUtils.randomNumber(1, 5),
            labelDemand: labelDemand,
            labelWeight: labelWeight,
        })
    }
    

    return subBuyOrderList;

}
function generateLabelDemand_AND_LabeWeight() {

    let labelDemand = {};
    let labelWeight = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
        // 5: {},
        // 6: {},
    }
    for(let i = 0; i < 5; i++) {
        let Demand =[];
        for(let j = 0; j < 5; j++) {
            if(localUtils.randomSelect([0,1,2,3]) == 1){// 增加标签
                Demand.push(j);  
                labelWeight[i][j] = localUtils.randomNumber(5,10);  
            }
        }
        labelDemand[i] = Demand;
    }
    // //作品大类标签 5
    // if(localUtils.randomNumber(0,2) == 0){//作品风格 5
    //     labelDemand[0] = [localUtils.randomNumber(0,4)];
    //     labelWeight[0][labelDemand[0][0]] = [localUtils.randomNumber(5,10)];
    // }
    // if(localUtils.randomNumber(0,2) == 0){//作品语种 5
    //     labelDemand[1] = [localUtils.randomNumber(0,4)];
    //     labelWeight[1][labelDemand[1][0]] = localUtils.randomNumber(5,10);
    // }
    // if(localUtils.randomNumber(0,2) == 0){//作品情感 5
    //     labelDemand[2] = [localUtils.randomNumber(0,4)];
    //     labelWeight[2][labelDemand[2][0]] = localUtils.randomNumber(5,10);
    // }
    // if(localUtils.randomNumber(0,2) == 0){//作品声音特质 5
    //     labelDemand[3] = [localUtils.randomNumber(0,4)];
    //     labelWeight[3][labelDemand[3][0]] = localUtils.randomNumber(5,10);
    // }
    // if(localUtils.randomNumber(0,2) == 0){//作品配器 5
    //     labelDemand[4] = [localUtils.randomNumber(0,4)];
    //     labelWeight[4][labelDemand[4][0]] = localUtils.randomNumber(5,10);
    // }
    // // if(localUtils.randomNumber(0,2) == 0){//作品用途 5
    // //     labelDemand[5] = [localUtils.randomNumber(0,4)];
    // //     labelWeight[5][labelDemand[5][0]] = localUtils.randomNumber(5,10);
    // // }
    // // if(localUtils.randomNumber(0,2) == 0){//应用场景 10
    // //     labelDemand[6] = [localUtils.randomNumber(0,9)];;
    // //     labelWeight[6][labelDemand[6][0]] = localUtils.randomNumber(5,10);
    // // }

    for(let i = 0; i < 5; i++) {
        for(let j = 0; j < 5; j++) {
            if(labelWeight[i][j] == null){
                if(localUtils.randomSelect([0,1]) == 1)// 喜欢
                    labelWeight[i][j] = localUtils.randomNumber(5,10);
                else
                    labelWeight[i][j] = localUtils.randomNumber(0,5);
            }
        }
    }
    // for(let j = 0; j < 10; i++) {
    //     if(labelWeight[6][j] == null){
    //         if(localUtils.randomSelect([0,1]) == 1)// 喜欢
    //             labelWeight[6][j] = localUtils.randomNumber(5,10);  
    //         labelWeight[6][j] = localUtils.randomNumber(0,5);  
    //     }    
    // }

    return [labelDemand,labelWeight];

}
function generateLabelDemand() {

    let labelDemand = {};
    //作品大类标签 5
    if(localUtils.randomNumber(0,2) == 0){//作品风格 5
        labelDemand[0] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品语种 5
        labelDemand[1] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品情感 5
        labelDemand[2] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品声音特质 5
        labelDemand[3] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品配器 5
        labelDemand[4] = [localUtils.randomNumber(0,4)];
    }
    // if(localUtils.randomNumber(0,2) == 0){//作品用途 5
    //     labelDemand[5] = [localUtils.randomNumber(0,4)];
    // }
    // if(localUtils.randomNumber(0,2) == 0){//应用场景 10
    //     labelDemand[6] = [localUtils.randomNumber(0,9)];
    // }
    
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
            labelWeight[i][j] = localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);  //跟generateLabelDemand冲突？
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
