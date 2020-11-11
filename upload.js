import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as tx from './utils/jingtum/tx.js'
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as mysqlUtils from './utils/mysqlUtils.js';

import {Server, userMemo} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});
const c = mysql.createConnection({     
    host: 'localhost',       
    user: 'root',              
    password: 'bykyl626',       
    port: '3306',                   
    database: 'jingtum_mid' 
});
c.connect();

/*----------平台账号(账号1)----------*/

const a1 = 'jpkjvaSwg6Kp6vmRKY4kvsMMkrXKvmLuht';
const s1 = 'shTKB1cBr3aLiMAEj7qquPqQPLJfU';

/*----------版权人账号(帐号3)----------*/

const a3 = 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf';

/*----------创建链接(server4)----------*/

const Remote = jlib.Remote;
const r = new Remote({server: Server.s1, local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    // 获取序列号
    let accountInfo = await requestInfo.requestAccountInfo(a1, r, false);
    let seq = accountInfo.account_data.Sequence;

    /*----------处理用户存证请求----------*/
    
    r.on('ledger_closed', async function(msg) {

        console.log('on ledger_closed: ' + msg.ledger_index);

        // 作品及信息存入IPFS，获取hash标识
        let memos = {...userMemo[seq % 4]};
        memos.workName += seq;
        let workBuf = memos.work;
        let workHash = await ipfsUtils.add(ipfs, workBuf);
        delete memos.work;
        let workInfo = memos;
        // console.log('workInfo:', workInfo);
        /* workInfo: {
            workName: 'm2_137',
            createdTime: 1579017600,
            publishedTime: 1579017600,
            workType: 1,
            workForm: 1,
            workField: 1
        } */
        let workInfoBuf = Buffer.from(JSON.stringify(workInfo));
        let workInfoHash = await ipfsUtils.add(ipfs, workInfoBuf);

        // 设置存证信息
        let workId = sha256(a3 + memos.workName).toString();

        // 上传存证交易
        let uploadInfo = {
            workHash: workHash,
            workInfoHash: workInfoHash,
            workId: workId
        }
        let uploadMemos = "0_" + JSON.stringify(uploadInfo);
        // console.log('upload:', uploadInfo);
        /* upload: {
            workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
            workInfoHash: 'QmR383PSpJFe9Z9cXM6xKFs2B7838K15HBWPAGtTR8uCVr',
            workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4'      
        } */
        console.log('upload:', memos.workName);
        let uploadRes = await tx.buildPaymentTx(a1, s1, r, seq++, a3, 0.000001, uploadMemos, false);

        // 作品ID与对应哈希存入mysql
        let txHash = uploadRes.tx_json.hash;
        let insertValues = {
            work_id: workId,
            addr: a3,
            hash: txHash
        }
        await mysqlUtils.insert(c, 'work_info', insertValues);

        console.log('--------------------');

    });

});