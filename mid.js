import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as mysqlUtils from './utils/mysqlUtils.js';
import * as localUtils from './utils/localUtils.js';
import * as fetch from './utils/fetch.js';

import {Server, ipfsConf, mysqlConf, debugMode} from './utils/info.js';

const ipfs = ipfsAPI(ipfsConf);
const c = mysql.createConnection(mysqlConf);
c.connect();

/*----------创建链接(服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: Server.s3, local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }
    
    /*----------处理用户确权请求----------*/

    r.on('ledger_closed', async function(msg) {

        console.log('on ledger_closed: ' + msg.ledger_index);

        // 从mysql查询未确权作品信息
        let uncheckInfoArr = await mysqlUtils.select(c, ['work_id', 'addr', 'hash'], 'work_info', 'auth_id is Null');

        // 获取存证交易信息
        let txInfoPromises = uncheckInfoArr.map(uncheckInfo => requestInfo.requestTx(r, uncheckInfo.hash, false));
        let txArr = await Promise.all(txInfoPromises);

        // 根据存证交易中的哈希标识获取作品信息
        let txMemosArr = txArr.map(tx => JSON.parse(localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(2)));
        let workInfoGetPromises = txMemosArr.map(txMemos => ipfsUtils.get(ipfs, txMemos.workInfoHash));
        let workInfoJsonArr = await Promise.all(workInfoGetPromises);
        let workInfoArr = workInfoJsonArr.map(workInfoJson => JSON.parse(workInfoJson));

        // 整合作品存证信息，向版权局发送确权请求，并获取确权ID
        let authReqPromises = txMemosArr.map((txMemos, index) => {
            delete txMemos.workInfoHash;
            let authInfo = Object.assign(workInfoArr[index], txMemos);
            authInfo.addr = txArr[index].Destination;
            authInfo.uploadtime = txArr[index].date + 946684800; // 加一项上传时间
            if(debugMode) {
                console.log('authReq:', authInfo);
            }
            else {
                console.log('authReq:', authInfo.workName); 
            }
            /* authReq: {
                workName: 'm2_137',
                createdTime: 1579017600,
                publishedTime: 1579017600,
                workType: 1,
                workForm: 1,
                workField: 1,
                workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
                workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',     
                addr: 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf',
                uploadtime: 1606288180
            } */
            return fetch.postData('http://127.0.0.1:9000/authReq', authInfo);
        });
        let authRes = await Promise.all(authReqPromises);

        // 更新mysql中作品信息中的auth_id
        let authIds = authRes.map(res => {
            return res.body._readableState.buffer.head.data.toString();
        });
        let workIds = uncheckInfoArr.map(uncheckInfo => {
            return uncheckInfo.work_id;
        });
        let authPromises = workIds.map(async function(workId, index) {
            return mysqlUtils.update(c, 'work_info', "auth_id = '" + authIds[index] + "'", "work_id = '" + workId + "'");
        });
        await Promise.all(authPromises);

        console.log('--------------------');

    });

});