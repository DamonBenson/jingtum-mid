import fs from 'fs';
import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';
import util from 'util';
import * as OrderGenerate from './OrderGenerate.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';


import {chains, userAccount, userAccountIndex, debugMode, availableSellAddr, mysqlConf} from '../../../utils/info.js';
import { time } from 'console';
import { exit } from 'process';
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
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

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
    // postStaticBuyOrder();
    // postStaticSellOrder();

    // postStaticBuyOrderGenerate();// generateBuyOrderOutBand();
    // postStaticSellOrderGenerate();

    // postStaticBuyOrderRewrite();

});
async function postStaticBuyOrder() {
    const file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObjectProtected\\buyOrder.json');
    fs.readFile(file, function(err,data){
        if(err)
            throw err;
            
        let jsonObj=JSON.parse(data);
        let msPerBuyOrder = 3000;
        var i=0,size=jsonObj.length;
        setInterval(function(){
            if(i == 10)
                exit();

            let record=jsonObj[i];
            postBuyOrderReq(record);
            i++;

        }, msPerBuyOrder);

    });
}

async function postStaticBuyOrderRewrite() {
    const fileIN = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObjectProtected\\buyOrder.json');
    const fileOut = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObject\\buyOrder_Anti_Tuhao_Tight.json');

    let buyOrders =[];

    let data = fs.readFileSync(fileIN);
    let jsonObj=JSON.parse(data);
    var i=0,size=jsonObj.length;
    for(;i<size;i++){
        let record = jsonObj[i];
        record.limitPrice = 1000;
        buyOrders.push(record);

    }
    buyOrders = JSON.stringify(buyOrders);
    
    fs.open(fileOut, 'a', (err, fd) => {
        if (err) throw err;



        fs.appendFile(fd, buyOrders, 'utf8', (err) => {
            if (err) throw err;
        });

        fs.close(fd, (err) => {
            if (err) throw err;
        });
    });
}
function GetStaticbuyOrder(fileIN) {
    let buyOrders =[];

    fs.readFileSync(fileIN, function(err,data){
        if(err)
            throw err;
        
        let jsonObj=JSON.parse(data);
        var i=0,size=jsonObj.length;
        for(;i<size;i++){
            let record = jsonObj[i];
            record.limitPrice = 40000;
            // console.log(record);
            buyOrders.push(record);
            // console.log(buyOrders);

        }
    });

    console.log("buyOrders",buyOrders);

    return buyOrders;
}
async function postStaticSellOrder() {
    const file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObjectProtected\\sellOrder.json');
    fs.readFile(file, function(err,data){
        if(err)
            throw err;
            
        let jsonObj=JSON.parse(data);
        let msPerBuyOrder = 3000;
        var i=0,size=jsonObj.length;
        setInterval(function(){
            if(i == 10)
                exit();

            let record=jsonObj[i];
            postBuyOrderReq(record);
            i++;

        }, msPerBuyOrder);

    });
    

}

async function postStaticBuyOrderGenerate() {
    const file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObject\\buyOrder.json');

    let count =1;
    let buyOrders =[];
    while(count<=1000){

        let buyOrder = OrderGenerate.generateBuyOrderOutBand();
        if(debugMode) {
            console.log('buyOrder:', buyOrder.buyOrderId);
        }
        buyOrders.push(buyOrder);

        count = count + 1;
    }
    buyOrders = JSON.stringify(buyOrders)
    fs.open(file, 'a', (err, fd) => {
        if (err) throw err;

        fs.appendFile(fd, buyOrders, 'utf8', (err) => {
            if (err) throw err;
        });

        fs.close(fd, (err) => {
            if (err) throw err;
        });
    });
}
async function postStaticSellOrderGenerate() {
    const file = new URL('file:E:\\InputFile\\GitBase\\Mid\\main\\req\\transaction\\StaticObject\\sellOrder.json');

    let count =1;
    let sellOrders =[];

    while(count<=1000){
        let addrFilter = {// 为什么只有买方
            addr: availableSellAddr[localUtils.randomNumber(0,2)],//目前只有三个
        };
        // let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();
        // let workInfoArr = await mysqlUtils.sql(c, sql);
        // let workIds = workInfoArr.map(workInfo => {
        //     return workInfo.work_id;
        // });
        let workIds = ["5A557A23D0204792AC3700F81601D32EFBC66A31991D0627FBA0F7381378CB44","C9AB40F6DBFCB05E8FED6FACAD9ECCF0CBBD99755ED2354F230C679867BBE22F"]
        let sellerAddr = addrFilter.addr;
        let sellOrder = null;
        if (localUtils.randomNumber(0,1) == true){
            sellOrder = OrderGenerate.generateSellOrderOutBand(workIds, sellerAddr);
        }
        else{
            sellOrder = OrderGenerate.generateSellOrder(workIds, sellerAddr);
        }
        if(debugMode) {
            console.log('sellOrder:', sellOrder.sellOrderId);
        }
        sellOrders.push(sellOrder);

        count = count + 1;
    }
    sellOrders = JSON.stringify(sellOrders)
    fs.open(file, 'a', (err, fd) => {
        if (err) throw err;
        fs.appendFile(fd, sellOrders, 'utf8', (err) => {
            if (err) throw err;
        });
        fs.close(fd, (err) => {
            if (err) throw err;
        });
    });
}

async function postBuyOrderReq(BUYORDER = null) {

    console.time('buyOrderReq');
    
    let buyOrder = null;
    if(BUYORDER != null){
        buyOrder = BUYORDER;
    }
    // 无参时：构造
    else{
        if(outband == true){
            buyOrder = OrderGenerate.generateBuyOrderOutBand();

            console.log('generateBuyOrderOutBand');
        }
        else{
            buyOrder = OrderGenerate.generateBuyOrder();
            
            console.log('generateBuyOrder');
        }
    }


    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }

    let unsignedRes = await httpUtils.post(util.format('http://%s:9001/transaction/buy', MidIP), buyOrder);
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

    let signedRes = await httpUtils.post(util.format('http://%s:9001/transaction/signedBuy', MidIP), blob);
    if(debugMode) {
        let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
        console.log('signed buy order:', resInfo);
    }

    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}
async function postSellOrderReq(SELLORDER = null) {
    console.time('sellOrderReq');


    for(let i = 0; i < sellOrderAmount; i++) {

        let addrFilter = {// 为什么只有买方
            addr: availableSellAddr[localUtils.randomNumber(0,2)],//目前只有三个
        };
        let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();
        let workInfoArr = await mysqlUtils.sql(c, sql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
        let sellerAddr = addrFilter.addr;

        let sellOrder = null;
        if(SELLORDER != null){
            sellOrder = SELLORDER;
        }
        // 无参时：构造
        else{
            if (outband == true){
                sellOrder = OrderGenerate.generateSellOrderOutBand(workIds, sellerAddr);
    
                console.log("generateSellOrderOutBand");
            }
            else{
                sellOrder = OrderGenerate.generateSellOrder(workIds, sellerAddr);
    
                console.log("generateSellOrder");
            }
        }


        if(debugMode) {
            console.log('sellOrder:', sellOrder.sellOrderId);
        }
        
        let signedRes = await httpUtils.post(util.format('http://%s:9001/transaction/sell', MidIP), sellOrder);
        if(debugMode) {
            let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
            console.log('signed buy order:', resInfo);
        }

    }
    
    console.timeEnd('sellOrderReq');
    console.log('--------------------');

}