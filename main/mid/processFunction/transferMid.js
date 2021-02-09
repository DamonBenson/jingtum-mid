import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {chains, mysqlConf, debugMode, rightTokenName} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // 数据库连接

const tokenChain = chains[1]; // 存证链

/*----------创建链接(确权链服务器1)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: tokenChain.server[1], local_sign: true});

r.connect(async function(err, result) {

    // 存证链连接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

    global.addrSeq = {}; // 存储用户账号与序列号的对应关系

    // 处理上传请求
    process.stdin.on('data', async function(chunk) {

        // 开始计时
        console.log('transferReq processing...');
        let sTs = (new Date()).valueOf();

        // 解析请求数据
        let transferReq = JSON.parse(chunk.toString());
        let tokenId = transferReq.token_id;
        let addr = transferReq.addr;
        let rcv = transferReq.rcv;

        // 获取序列号
        if(!addrSeq[addr]) {
            let accountInfo = await requestInfo.requestAccountInfo(addr, r, false);
            addrSeq[addr] = accountInfo.account_data.Sequence;
        }

        // 获取私钥
        let sql = sqlText.table('account_info').field('secret').where({addr: addr}).select();
        let sqlRes = await mysqlUtils.sql(c, sql);
        let secret = sqlRes[0].secret;

        // 调用erc721
        if(debugMode) {
            console.log('transfer:', transferReq);
        }
        else {
            console.log('transfer:', transferReq.token_id);
        }
        /* transfer: {
            token_id: 'C59209D11B745FF9903106E6339616CA15ABAA77E4AEC7306AB02D242048B4C5',      
            addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
            rcv: 'ja7En1thjN4dd3atQCRudBEuGgwY8Qdhai'
        } */
        await erc721.buildTransferTokenTx(secret, r, addrSeq[addr]++, addr, rcv, rightTokenName, tokenId, true);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});