import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {chains, ipfsConf, mysqlConf, debugMode} from '../../utils/info.js';

const u = jlib.utils;

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const chain0 = chains[0]; // 存证链

/*----------创建链接(存证链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: chain0.server[3], local_sign: true});

r.connect(async function(err, result) {

    /*---------存证链连接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

    /*----------监听交易，信息存入数据库----------*/

    r.on('ledger_closed', async function(msg) {

        // 开始计时
        console.log('on ledger_closed: ' + msg.ledger_index);
        let sTs = (new Date()).valueOf();

        // 获取所有交易哈希
        let ledgerIndex = msg.ledger_index;
        let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
        let txHashs = ledger.transactions;
        const txLoopConter = txHashs.length - 1;

        // 获取所有交易信息
        let txPromises = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let txHash = txHashs[i];
            txPromises.push(requestInfo.requestTx(r, txHash, false));
        }
        let txs = await Promise.all(txPromises);

        // 筛选存证交易
        let uploadTxs = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            /* 存证交易：
                1、交易类型为支付
                2、memos前两位为“0_”
            */
            if(txType == 'Payment' && u.hexToString(tx.Memos[0].Memo.MemoData).slice(0, 1) == 0) {
                uploadTxs.push(tx);
            }
        }
        const uploadCount = uploadTxs.length;
        const uploadLoopCounter = uploadCount - 1;
        
        // 获取交易中存储的存证信息
        // [0]=n
        let uploadMemosArr = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let tx = uploadTxs[i];
            uploadMemosArr[i] = JSON.parse(u.hexToString(tx.Memos[0].Memo.MemoData).slice(2));
        }

        // 从ipfs上获取作品信息
        // [0]=0
        let workInfoGetPromises = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let memos = uploadMemosArr[i];
            workInfoGetPromises[i] = ipfsUtils.get(ipfs, memos.workInfoHash);
        }
        let workInfoJsonArr = await Promise.all(workInfoGetPromises);

        // 解析作品信息
        // [0]=n
        let workInfoArr = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let workInfoJson = workInfoJsonArr[i];
            workInfoArr[i] = JSON.parse(workInfoJson);
        }

        // 存证信息存入数据库
        // [0]=0
        let postWorkInfoPromises = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let tx = uploadTxs[i];
            let uploadMemos = uploadMemosArr[i];
            let workInfo =  workInfoArr[i];
            delete uploadMemos.workInfoHash;
            let uploadInfo = Object.assign(uploadMemos, workInfo);
            uploadInfo.workId = tx.hash;
            uploadInfo.uploadTime = tx.date + 946684800; // 井通链时间戳转换为通用时间戳
            uploadInfo.addr = tx.Destination;
            // uploadInfo.createdTime = localUtils.toMysqlDate(uploadInfo.createdTime); // 通用时间戳转换为数据库date格式
            // uploadInfo.publishedTime = localUtils.toMysqlDate(uploadInfo.publishedTime);
            // uploadInfo.uploadTime = localUtils.toMysqlDate(uploadInfo.uploadTime);
            localUtils.toMysqlObj(uploadInfo);
            if(debugMode) {
                console.log('on upload', uploadInfo);
            }
            else {
                console.log('on upload', uploadInfo.work_name);
            }
            /* upload {
                addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
                work_hash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
                work_name: 'm1_',
                created_time: 1579017600,
                published_time: 1579017600,
                work_type: 0,
                work_form: 0,
                work_field: 0,
                work_id: '7EEC480EEA01B81365B24362318698E1FA372F902E9B77531202E4E8A3852A12',       
                upload_time: 1608517640
            } */
            let sql = sqlText.table('work_info').data(uploadInfo).insert();
            postWorkInfoPromises[i] = mysqlUtils.sql(c, sql);
        }
        await Promise.all(postWorkInfoPromises);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});