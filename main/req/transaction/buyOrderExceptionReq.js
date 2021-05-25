import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';
import util from 'util';

import {chains, userAccount, userAccountIndex, buyOrderContractAddrs, debugMode} from '../../../utils/info.js';
const MidIP = '39.102.93.47';// 中间层服务器IP
// const MidIP = 'localhost';// 本地IP
const msPerBuyOrder = 5000;
// const subBuyOrderListAmount = 3; 随机个数
const platformAddr = userAccount[userAccountIndex['买方平台2']].address; // 平台账号
const platformSecret = userAccount[userAccountIndex['买方平台2']].secret;
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

    setInterval(postBuyOrderReq, msPerBuyOrder);
    // postBuyOrderReq();
    // localUtils.sleep(5000)
    // exit();

});

async function postBuyOrderReq() {

    console.time('buyOrderReq');
    var IsError = false;
    // let buyOrder = generateBuyOrder();
    let [buyOrder,classErrorNum,ErrorNum] = generateBuyOrder_Invalid();

    try{
        let unsignedRes = await httpUtils.post(util.format('http://%s:9001/transaction/buy', MidIP), buyOrder);
        let unsignedResInfo = JSON.parse(Buffer.from(unsignedRes.body._readableState.buffer.head.data).toString());
        let txJson = unsignedResInfo.data.tx_json;
        let unsignedTx = {
            tx_json: txJson,
        };
        // if(debugMode) {
        //     console.log('unsigned buy order:', unsignedResInfo);
        // }
        if(unsignedResInfo.code == 1){
            IsError = true;
        }
        jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        let blob = unsignedTx.tx_json.blob;

        let signedRes = await httpUtils.post(util.format('http://%s:9001/transaction/signedBuy', MidIP), blob);
        if(debugMode&&!IsError) {
            let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
            console.log('signed buy order:', resInfo);
        }
    }
    catch{
        if(IsError){
        console.log("ExceptionRemind");
        }
    }

    if(!IsError){
        console.log([buyOrder, buyOrder.subBuyOrderList, buyOrder.authorizationInfo, classErrorNum, ErrorNum]);
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
        platformAddr: platformAddr, // 买方平台2
        contractAddr: buyOrderContractAddrs[0],  // 买方平台2 跨平台买单挂在买方合约上
    };
    buyOrder.buyOrderId = sha256(seq.toString()).toString();

    return buyOrder;

}
function generateBuyOrder_Invalid() {
    
    let subBuyOrderList = generateSubBuyOrder();
    let limitPrice = localUtils.randomNumber(1000, 10000);
    let tradeStrategy = localUtils.randomSelect([0,1]); // 0-性价比最高策略 1-价格最低策略
    let authorizationType = localUtils.randomNumber(0,9); // 十个授权方式
    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrderList: subBuyOrderList,
        limitPrice: limitPrice,
        tradeStrategy: null,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr[localUtils.randomNumber(0,5)],//6个用户
        contact: 'phoneNumber', // 联系方式
        platformAddr: platformAddr, // 买方平台2
        contractAddr: buyOrderContractAddrs[0],  // 买方平台2 跨平台买单挂在买方合约上
    };
    buyOrder.buyOrderId = sha256(seq.toString()).toString();
    let classErrorNum = localUtils.randomNumber(1,3);
    var ErrorNum;

    switch(classErrorNum){
        case 1:
                // 类型错误
            ErrorNum = localUtils.randomNumber(1,10);
            switch(ErrorNum){
                case 0:
                    break;
                case 1://空
                    buyOrder.subBuyOrderList = null;
                    break;
                case 2://空
                    buyOrder.limitPrice = null;
                    break;
                case 3://空
                    buyOrder.tradeStrategy = null;
                    break;
                case 4://空
                    buyOrder.authorizationInfo = null;
                    break;
                case 5://空
                    buyOrder.side = null;
                    break;
                case 6://空
                    buyOrder.buyerAddr = null;
                    break;
                case 7://空
                    buyOrder.contact = null;
                    break;
                case 8://空
                    buyOrder.platformAddr = null;
                    break;
                case 9://空
                    buyOrder.contractAddr = null;
                    break;
                case 10://[]SubBuyOrder
                    buyOrder.subBuyOrderList = localUtils.randomSelect([-1,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 11://Int64
                    buyOrder.limitPrice = localUtils.randomSelect(["一个字符串",{"错误":"的对象"}]);
                    break;
                case 12://Int8
                    buyOrder.tradeStrategy = localUtils.randomSelect([257,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 13://map[int]AuthorizationRange
                    buyOrder.authorizationInfo = localUtils.randomSelect([-1,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 14://Int8
                    buyOrder.side = localUtils.randomSelect([257,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 15://String
                    buyOrder.buyerAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);
                    break;
                case 16://String
                    buyOrder.contact = localUtils.randomSelect([-1,{"错误":"的对象"}]);
                    break;
                case 17://String
                    buyOrder.platformAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);
                    break;
                case 18://String
                    buyOrder.contractAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);
                    break;
                default:
                    break;
            }  
        break;
        case 2:
            // 范围非法
            ErrorNum = localUtils.randomNumber(1,12)
            var labelWeight;
            var labelDemand;
            var outrangeNum;
            switch(ErrorNum){
                case 0:
                    break;
                case 1:
                    buyOrder.limitPrice = localUtils.randomSelect([-1,0,99,10000000000]);// >=100
                    break;
                case 2:
                    buyOrder.tradeStrategy = localUtils.randomSelect([-1,2]); // 0-性价比最高策略 1-价格最低策略
                    break;
                case 3:
                    buyOrder.side = localUtils.randomSelect([-1,1,2]);// 买单为0
                    break;
                case 4:
                    buyOrder.subBuyOrderList.labelAmount = localUtils.randomSelect([-1,0,100000000000]);// >0
                    break;
                case 5:
                    labelWeight = {
                        0: {},1: {},2: {},3: {},4: {},5:{5:10}
                    }
                    buyOrder.subBuyOrderList.labelWeight = labelWeight;// 数组越界
                    break;
                case 6:
                    outrangeNum = localUtils.randomSelect([-1,11]);
                    labelWeight = {
                        0: {0:outrangeNum},1: {},2: {},3: {},4: {},
                    }
                    buyOrder.subBuyOrderList.labelWeight = labelWeight;// 0-10
                    break;
                case 7:
                    labelDemand = {
                        0: [],1: [],2: [],3: [],4: [],
                        5 : [1],
                    };
                    buyOrder.subBuyOrderList.labelDemand = labelDemand;// 数组越界
                    break;
                case 8:
                    outrangeNum = localUtils.randomSelect([-1,5]);
                    labelDemand = {
                        0: [outrangeNum],1: [],2: [],3: [],4: [],
                    };
                    buyOrder.subBuyOrderList.labelDemand = labelDemand;// 0-4
                    break;
                case 9:
                    buyOrder.authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([-1,5]);//0-Network;1-FullChannel;2-ProductLaunch;3-TV;4- NetworkMovie
                    break;
                case 10:
                    buyOrder.authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([-1,5]);//0-China;1-Asia;2-World
                    break;
                case 11:
                    buyOrder.authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([-1,5]);//0-HalfYear;1-OneYear;2-ThreeYear;3- Permanent
                    break;
                case 12:
                    buyOrder.authorizationInfo[authorizationType].AuthorizationPrice = localUtils.randomSelect([-1,0,99,10000000000]);//>=100
                    break;
                default:
                    break;
            }       
        break;
        // 标识符非法
        case 3:
            ErrorNum = localUtils.randomNumber(1,10)
            switch(ErrorNum){
                case 0:
                    break;
                case 1://错
                    buyOrder.platformAddr ="不存在的地址";
                    break;
                case 2://错
                    buyOrder.buyerAddr = "不存在的地址";
                    break;
                case 3://错
                    buyOrder.contractAddr = "不存在的地址";
                    break;
                case 4://假
                    buyOrder.platformAddr = "snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 5://假
                    buyOrder.buyerAddr = "snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 6://假
                    buyOrder.contractAddr ="snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 7://合约地址
                    buyOrder.platformAddr = "jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC";
                    break;
                case 8://合约地址
                    buyOrder.buyerAddr = "jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC";
                    break;
                case 9://平台地址
                    buyOrder.contractAddr ="jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan";
                    break;
                case 10://卖方合约
                    buyOrder.contractAddr ="jDamHMfeuENdNDzyQciGjojGLuMmRnhifU";
                    break;
                default:
                    break;
            } 
            break;
        default:
            break;
    }
    return [buyOrder, classErrorNum, ErrorNum];

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
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1]);//0-Network;1-FullChannel;2-ProductLaunch;3-TV;4- NetworkMovie
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);//0-China;1-Asia;2-World
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);//0-HalfYear;1-OneYear;2-ThreeYear;3- Permanent
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
    authorizationInfo[authorizationType].AuthorizationPrice = localUtils.randomNumber(100,10000);
    return authorizationInfo;

}
