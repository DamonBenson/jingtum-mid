import fs from 'fs';
import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as fetch from '../../../utils/fetch.js';
import util from 'util';
import * as OrderGenerate from './OrderGenerate.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {chains, userAccount, userAccountIndex, debugMode, availableSellAddr, mysqlConf} from '../../../utils/info.js';
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

    postStaticBuyOrderGenerate();
    postStaticSellOrderGenerate();


});

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
        let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();
        let workInfoArr = await mysqlUtils.sql(c, sql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
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
