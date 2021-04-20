import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import sha256 from 'crypto-js/sha256.js';
import util from 'util';
import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {chains, userAccount, userAccountIndex, mysqlConf, sellOrderContractAddrs, debugMode, availableSellAddr} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const MidIP = '39.102.93.47';// 中间层服务器IP
// const MidIP = 'localhost';// 中间层服务器IP
const msPerSellOrder = 5000;
const sellOrderAmount = 1;
const platformAddr = userAccount[userAccountIndex['卖方平台账号']].address; // 平台账号
const platformSecret = userAccount[userAccountIndex['卖方平台账号']].secret;
// const sellerAddr = userAccount[5].address;

// setInterval(postSellOrderReq, msPerSellOrder);

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

    // postSellOrderReq();
    setInterval(postSellOrderReq, msPerSellOrder);


});

async function postSellOrderReq() {
    console.time('sellOrderReq');

    for(let i = 0; i < sellOrderAmount; i++) {
        var IsError = false;
        let addrFilter = {// 为什么只有买方
            addr: availableSellAddr[localUtils.randomNumber(0,2)],//目前只有三个
        };
        let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();
        let workInfoArr = await mysqlUtils.sql(c, sql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
        let sellerAddr = addrFilter.addr;

        let [sellOrder,classErrorNum,ErrorNum] = generateSellOrder_Invalid(workIds, sellerAddr); 
        try{
            let signedRes = await fetch.postData(util.format('http://%s:9001/transaction/sell', MidIP), sellOrder);
            if(debugMode) {
                let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
                // console.log('signed buy order:', resInfo);
            }
            if(resInfo.code == 1){
                IsError = true;
            }
        }
        catch{
            if(IsError){
            console.log("ExceptionRemind");
            }
        }
    
        if(!IsError){
            console.log([sellOrder, sellOrder.assetId, sellOrder.labelSet, classErrorNum, ErrorNum]);
        }
        
        // let buf = Buffer.from(sellOrderRes.body._readableState.buffer.head.data);
        // // if(debugMode) console.log('buf.toString():', buf.toString());
        // let txJson = JSON.parse(buf.toString());
        // let unsignedTx = {
        //     tx_json: txJson,
        // };
        // jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        // jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        // jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        // let blob = unsignedTx.tx_json.blob;
        
        // let signedTxRes = await fetch.postData(util.format('http://%s:9001/transaction/signedSell', MidIP), blob);
        // let resInfo = JSON.parse(Buffer.from(signedTxRes.body._readableState.buffer.head.data).toString());
        // console.log('res:', resInfo);

    }
    
    console.timeEnd('sellOrderReq');
    console.log('--------------------');

}


function generateSellOrder(wrokIds, sellerAddr) {
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);

    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: wrokIds,
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        platformAddr: platformAddr,
        contractAddr: sellOrderContractAddrs[0],
    }

    sellOrder.sellOrderId = sha256((seq++).toString() + 'a').toString();
    console.log(seq);
    return sellOrder;

}
function generateSellOrder_Invalid(wrokIds, sellerAddr) {
    
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);

    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: wrokIds,
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        platformAddr: platformAddr,
        contractAddr: sellOrderContractAddrs[0],
    }

    sellOrder.sellOrderId = sha256((seq++).toString() + 'a').toString();
    let classErrorNum = localUtils.randomNumber(1,3);
    var ErrorNum;

    switch(classErrorNum){
        case 1:
                // 类型错误
            ErrorNum = localUtils.randomNumber(1,20);
            switch(ErrorNum){
                case 0:
                    break;
                case 1://空
                    sellOrder.labelSet = null;
                    break;
                case 2://空
                    sellOrder.expectedPrice = null;
                    break;
                case 3://空
                    sellOrder.sellerAddr = null;
                    break;
                case 4://空
                    sellOrder.contact = null;
                    break;
                case 5://空
                    sellOrder.assetId = null;
                    break;
                case 6://空
                    sellOrder.assetType = null;
                    break;
                case 7://空
                    sellOrder.consumable = null;
                    break;
                case 8://空
                    sellOrder.expireTime = null;
                    break;
                case 9://空
                    sellOrder.platformAddr = null;
                    break;
                case 10://空
                    sellOrder.contractAddr = null;
                    break;
                case 11://map[int][]int
                    sellOrder.labelSet= localUtils.randomSelect([-1,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 12://map[int][]AuthorizationRange
                    sellOrder.expectedPrice = localUtils.randomSelect([-1,"一个字符串",{"错误":"的对象"}]);
                    break;
                case 13://string
                    sellOrder.sellerAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);;
                    break;
                case 14://string
                    sellOrder.contact = localUtils.randomSelect([-1,{"错误":"的对象"}]);;
                    break;
                case 15://string[]
                    sellOrder.assetId = localUtils.randomSelect([-1,{"错误":"的对象"},[{"错误":"非字符串队列"}]]);
                    break;
                case 16://int8
                    sellOrder.assetType = localUtils.randomSelect([257,"一个字符串",{"错误":"的对象"}]);//0-作品；1-版权通证；2-授权通证；
                    break;
                case 17://bool
                    sellOrder.consumable = localUtils.randomSelect([257,"一个字符串",{"错误":"的对象"}]);//true-转让；false-授权
                    break;
                case 18://int
                    sellOrder.expireTime = localUtils.randomSelect(["一个字符串",{"错误":"的对象"}]);
                    break;
                case 19://string
                    sellOrder.platformAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);;
                    break;
                case 20://string
                    sellOrder.contractAddr = localUtils.randomSelect([-1,{"错误":"的对象"}]);;
                    break;
                default:
                    break;
            }  
        break;
        case 2:
            // 范围非法
            ErrorNum = localUtils.randomNumber(1,4)
            var outrangeNum;
            switch(ErrorNum){
                case 0:
                    break;
                case 1://数组越界
                    labelSet = {
                        0: [],1: [],2: [],3: [],4: [],
                        5 : [1],
                    }
                    sellOrder.labelSet = labelSet;
                    break;
                case 2:// 0-4
                    outrangeNum = localUtils.randomSelect([-1,5]);
                    labelSet = {
                        0: [outrangeNum],1: [],2: [],3: [],4: [],
                    }
                    sellOrder.labelSet = labelSet;
                    break;
                // case 3://map[int][]AuthorizationRange //太难了不测了
                //     sellOrder.expectedPrice = null;
                //     break;
                case 3:
                    sellOrder.assetType = localUtils.randomSelect([-1,3]); // 0-2
                    break;
                case 4://空
                    sellOrder.expireTime = localUtils.randomSelect([-1,0,10000000000]);//>0
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
                    sellOrder.platformAddr ="不存在的地址";
                    break;
                case 2://错
                    sellOrder.sellerAddr = "不存在的地址";
                    break;
                case 3://错
                    sellOrder.contractAddr = "不存在的地址";
                    break;
                case 4://错
                    sellOrder.assetId = "不存在的地址";
                    break;
                case 5://假
                    sellOrder.platformAddr = "snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 6://假
                    sellOrder.sellerAddr = "snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 7://假
                    sellOrder.contractAddr ="snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 8://假
                    sellOrder.assetId = "snjQmeX9Hqvypxn2d663jKL";
                    break;
                case 7://合约地址
                    sellOrder.platformAddr = "jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC";
                    break;
                case 8://合约地址
                    sellOrder.sellerAddr = "jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC";
                    break;
                case 9://平台地址
                    sellOrder.contractAddr ="jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan";
                    break;
                case 10://买方合约
                    sellOrder.contractAddr ="jPV4U2huLRaqw9nV7QAkg5oCLb5iEmyZUF";
                    break;
                default:
                    break;
            } 
            break;
        default:
            break;
    }
    return [sellOrder, classErrorNum, ErrorNum];

}

function generateLabelSet() {

    let labelSet = {};
    //作品大类标签 5
    for(let i = 0; i < 5; i++) {
        let Demand =[];
        for(let j = 0; j < 5; j++) {
            if(localUtils.randomSelect([0,1,2,3]) == 1){// 增加标签
                Demand.push(j);  
            }
        }
        labelSet[i] = Demand;
    }
    
    return labelSet;

}

function generateExpectedPrice(basePrice) {

    let expectedPrice = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
    };
    for(let i = 0; i < 10; i++) {
        switch(i) {
            case 0:
            case 8:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 1:
            case 2:
            case 7:
            case 9:
                for(let k = 0; k < 3; k++) {
                    for(let l = 0; l < 4; l++) {
                        expectedPrice[i].push({
                            authorizationChannel: 0,
                            authorizationArea: k,
                            authorizationTime: l,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 3:
                for(let j = 0; j < 3; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 4:
            case 5:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        expectedPrice[i].push({
                            authorizationChannel: j,
                            authorizationArea: k,
                            authorizationTime: 0,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 6:
                for(let k = 0; k < 3; k++) {
                    expectedPrice[i].push({
                        authorizationChannel: 0,
                        authorizationArea: k,
                        authorizationTime: 0,
                        authorizationPrice: basePrice,
                    });
                }
                break;
            default:
                break;
        }
    }

    return expectedPrice;

}