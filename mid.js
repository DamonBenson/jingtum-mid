import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as mysqlUtils from './utils/mysqlUtils.js';
import * as localUtils from './utils/localUtils.js';
import {postData} from './utils/fetch.js';

import {Server} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});
const c = mysql.createConnection({     
    host: 'localhost',       
    user: 'root',              
    password: 'bykyl626',       
    port: '3306',                   
    database: 'jingtum-mid' 
});
c.connect();

/*----------创建链接(服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: Server.s4, local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }
    
    /*----------处理用户确权请求----------*/

    while(true) {

        // 从mysql查询未确权作品信息
        let uncheckRes = await mysqlUtils.select(c, ['work_id', 'addr', 'hash'], 'work_info', 'auth_id is Null');

        // 整合作品信息，向authServer发送确权请求
        let authReqPromises = uncheckRes.map(async uncheckInfo => {
            let txHash = uncheckInfo.hash;
            let tx = await requestInfo.requestTx(r, txHash);
            let txMemoStr = localUtils.ascii2str(tx.Memos[0].Memo.MemoData);
            let txMemos = JSON.parse(txMemoStr.slice(2));
            let workInfoHash = txMemos.workInfoHash;
            delete txMemos.workInfoHash;
            let workInfoJson = await ipfsUtils.get(ipfs, workInfoHash);
            let workInfo = JSON.parse(workInfoJson.toString());
            let authInfo = Object.assign(workInfo, txMemos);
            authInfo.addr = uncheckInfo.addr;
            console.log(authInfo);
            return postData('http://127.0.0.1:9000/authReq', authInfo);
        });

        // 从authServer获取确权ID
        let authRes = await Promise.all(authReqPromises);
        let authIds = authRes.map(res => {
            return res.body._readableState.buffer.head.data.toString();
        });
        console.log(authIds);
        let workIds = uncheckRes.map(res => {
            return res.work_id;
        });
        console.log(workIds);

        // 更新mysql中作品信息中的auth_id
        let authPromises = workIds.map(async function(workId, index) {
            return mysqlUtils.update(c, 'work_info', "auth_id = '" + authIds[index] + "'", "work_id = '" + workId + "'");
        });
        await Promise.all(authPromises);

        await localUtils.sleep(10000);

    }

})