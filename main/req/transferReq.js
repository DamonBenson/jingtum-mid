import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {chains, mysqlConf, debugMode} from '../../utils/info.js';

const msPerTransfer = 20000; // 转让间隔时间
const transferPerInterval = 1; // 每个间隔内转让请求数量
const c = mysql.createConnection(mysqlConf);
c.connect(); // 数据库连接

const tokenChain = chains[1];
const a1 = tokenChain.account.a[1].address; // 买/卖方账号(存证链帐号1)
const a2 = tokenChain.account.a[2].address; // 买/卖方账号(存证链帐号2)

setInterval(async function() {

    // 开始计时
    console.log('start transfering...');
    let sTs = (new Date()).valueOf();

    // 从mysql随机获取一个待转让的通证id
    let sql = sqlText.query('select token_id,addr from token_info order by rand() limit ' + transferPerInterval);
    let transferTokenArr = await mysqlUtils.sql(c, sql);

    // 发送转让请求至http服务器mainMid.js
    let transferReqArr = new Array(transferPerInterval);
    for(let i = transferPerInterval - 1; i >= 0; i--) {
        let transferReq = transferTokenArr[i];
        transferReq.rcv = (transferReq.addr == a2 ? a1 : a2); // 根据token拥有者地址选择rcv地址
        if(debugMode) {
            console.log('transfer:', transferReq);
        }
        else {
            console.log('transfer:', transferReq.token_id);
        }
        /* RowDataPacket {
            token_id: 'C59209D11B745FF9903106E6339616CA15ABAA77E4AEC7306AB02D242048B4C5',
            addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
            rcv: 'ja7En1thjN4dd3atQCRudBEuGgwY8Qdhai'
        } */
        transferReqArr[i] = fetch.postData('http://127.0.0.1:9001/transferReq', transferReq);
        await localUtils.sleep(100);
    }
    await Promise.all(transferReqArr);

    // 结束计时
    let eTs = (new Date()).valueOf();
    console.log('----------' + (eTs - sTs) + 'ms----------');

}, msPerTransfer);