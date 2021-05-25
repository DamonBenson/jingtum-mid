import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import sha256 from 'crypto-js/sha256.js';
import util from 'util';
import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';
import * as OrderGenerate from './OrderGenerate.js';

import {userAccount, chains, contractAddr} from '../../../utils/config/jingtum.js';
import {mysqlConf} from '../../../utils/config/mysql.js';
import {debugMode} from '../../../utils/config/project.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const ip = 'localhost';// 中间层服务器IP
const msPerSellOrder = 5000;
const sellOrderAmount = 1;
const platformAddr = userAccount.platformAccount[0].address;
const platformSecret = userAccount.platformAccount[0].secret;
const sellerAddr = userAccount.normalAccount[0].address;

// setInterval(postSellOrderReq, msPerSellOrder);

const contractChain = chains[2];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});
const outband = false;
// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    postSellOrderReq();
    // setInterval(postSellOrderReq, msPerSellOrder);


});

async function postSellOrderReq(SELLORDER = null) {
    console.time('sellOrderReq');


    for(let i = 0; i < sellOrderAmount; i++) {

        let addrFilter = {// 为什么只有买方
            address: sellerAddr,
        };
        let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();
        let workInfoArr = await mysqlUtils.sql(c, sql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });

        // let sql = sqlText.table('work_info').field('work_id,addr').order('RAND()').limit(localUtils.randomNumber(1,5)).select();
        // let workInfoArr = await mysqlUtils.sql(c, sql);
        // let workIds = [];
        // let Addr = [];
        // workInfoArr.map(workInfoArr => {
        //     workIds.push(workInfoArr.work_id);
        //     Addr.push(workInfoArr.addr);
        // });
        // let [workIds,sellerAddr] = workInfoArr.map(workInfo => {
        //     return [workInfo.work_id,workInfo.addr];
        // });
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
            console.log('sellOrder:', sellOrder);
            // console.log('sellOrder:', sellOrder.sellOrderId);
        }
        
        let unsignedRes = await httpUtils.post(util.format('http://%s:9001/transaction/sell', ip), sellOrder);
        let unsignedResInfo = JSON.parse(Buffer.from(unsignedRes.body._readableState.buffer.head.data).toString());
        console.log(unsignedResInfo);
        let txJson = unsignedResInfo.data.unsignedTx;
        let unsignedTx = {
            tx_json: txJson,
        };
        jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        let blob = unsignedTx.tx_json.blob;
        
        let signedTxRes = await httpUtils.post(util.format('http://%s:9001/transaction/signedSell', ip), {blob: blob});
        let resInfo = JSON.parse(Buffer.from(signedTxRes.body._readableState.buffer.head.data).toString());
        console.log('res:', resInfo);

    }
    
    console.timeEnd('sellOrderReq');
    console.log('--------------------');

}