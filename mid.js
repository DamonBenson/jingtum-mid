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

    /*---------链接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }
    
    // while(true) {
        let uncheckRes = await mysqlUtils.select(c, ['work_id', 'addr', 'hash'], 'work_info', 'auth_id is Null');
        console.log(uncheckRes[0].work_id);
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
            return postData('/authReq', authInfo);
        });
        await Promise.all(authReqPromises);

        await localUtils.sleep(5000);

    // }

    /*----------获取序列号----------*/

    // r.on('ledger_closed', async function(msg) {

    //     console.log('on ledger_closed: ' + msg.ledger_index);

    //     //获取所有交易哈希
    //     let ledgerIndex = msg.ledger_index;
    //     let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
    //     let txHashs = ledger.transactions;

    //     //获取所有交易信息
    //     let txPromises = txHashs.map(txHash => {
    //         return requestInfo.requestTx(r, txHash, false);
    //     });
    //     let txs = await Promise.all(txPromises);

    //     //对应关系存入数据库
    //     for(let i = txs.length - 1; i >= 0; i--) {
    //         let tx = txs[i];
    //         if(tx.TransactionType == 'Payment') {
    //             let memoStr = localUtils.ascii2str(tx.Memos[0].Memo.MemoData);
    //             let flag = memoStr.slice(0,1);
    //             if(flag == 0) {
    //                 let addr = tx.Destination;
    //                 let workId = memos.workId;
    //                 let workTxHash = tx.hash;
    //                 // 连接数据库，存入addr、id、hash
    //             }
    //         }
    //     }

    //     //从数据库中取出作品，发送确权请求给版权局
    //     let authTxHashs = [];
    //     let authReqPromises = authTxHashs.map(authTxHash => {
    //         return postData('/authReq', authTxHash);
    //     });
    //     await Promise.all(authReqPromises);

    // });

})