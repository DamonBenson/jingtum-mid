import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as tx from './utils/jingtum/tx.js'
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as mysqlUtils from './utils/mysqlUtils.js';
import * as localUtils from './utils/localUtils.js';

import {Account, Server, userMemo, ipfsConf, mysqlConf, debugMode} from './utils/info.js';

const ipfs = ipfsAPI(ipfsConf);
const c = mysql.createConnection(mysqlConf);
c.connect();

// 每个帐本上传交易数
const uploadPerLedger = 1;

/*----------平台账号(账号1)----------*/

const a1 = Account.a1Account;
const s1 = Account.a1Secret;

/*----------版权人账号(帐号3)----------*/

const a3 = Account.a3Account;

/*----------创建链接(server2)----------*/

const Remote = jlib.Remote;
const r = new Remote({server: Server.s2, local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    // 获取序列号
    let accountInfo = await requestInfo.requestAccountInfo(a1, r, true);
    let seq = accountInfo.account_data.Sequence;

    /*----------处理用户存证请求----------*/
    
    r.on('ledger_closed', async function(msg) {

        console.log('on ledger_closed: ' + msg.ledger_index);

        let sTs = (new Date()).valueOf();
        const loopCounter = uploadPerLedger - 1;

        // 根据序列号取出作品数据
        let memosArr = new Array(uploadPerLedger);
        for(let i = loopCounter; i >= 0; i--) {
            let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]);
            memosArr[i] = {...userMemo[randFlag]};
        }

        // 作品存入IPFS，获取哈希标识
        let workAddPromises = new Array(uploadPerLedger);
        for(let i = loopCounter; i >= 0; i--) {
            let memos = memosArr[i];
            workAddPromises[i] = ipfsUtils.add(ipfs, memos.work);
        }
        let workHashArr = await Promise.all(workAddPromises);

        // 作品信息存入IPFS，获取哈希标识
        let workInfoAddPromises = new Array(uploadPerLedger);
        for(let i = loopCounter; i >= 0; i--) {
            let memos = memosArr[i];
            memos.workName += seq + i;
            delete memos.work;
            let workInfo = Buffer.from(JSON.stringify(memos));
            if(debugMode) {
                console.log('workInfo:', memos);
            }
            /* workInfo: {
                workName: 'm2_137',
                createdTime: 1579017600,
                publishedTime: 1579017600,
                workType: 1,
                workForm: 1,
                workField: 1
            } */
            workInfoAddPromises[i] = ipfsUtils.add(ipfs, workInfo);
        }
        let workInfoHashArr = await Promise.all(workInfoAddPromises);
        
        // 上传存证交易
        let uploadPromises = new Array(uploadPerLedger);
        for(let i = loopCounter; i >= 0; i--) {
            let memos = memosArr[i];
            let workHash = workHashArr[i];
            let workInfoHash = workInfoHashArr[i];
            memos.workId = sha256(a3 + memos.workName).toString();
            let uploadInfo = {
                workHash: workHash,
                workInfoHash: workInfoHash,
                workId: memos.workId
            };
            let uploadMemos = "0_" + JSON.stringify(uploadInfo);
            if(debugMode) {
                console.log('upload:', uploadInfo);
            }
            else {
                console.log('upload:', memos.workName);
            }
            /* upload: {
                workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
                workInfoHash: 'QmR383PSpJFe9Z9cXM6xKFs2B7838K15HBWPAGtTR8uCVr',
                workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4'      
            } */
            uploadPromises[i] = tx.buildPaymentTx(a1, s1, r, seq++, a3, 0.000001, uploadMemos, true);
        }
        let uploadResArr = await Promise.all(uploadPromises);

        // 作品ID与对应哈希存入mysql
        let mysqlInsertPromises = new Array(uploadPerLedger);
        for(let i = loopCounter; i >= 0; i--) {
            let memos = memosArr[i];
            let res = uploadResArr[i];
            let txHash = res.tx_json.hash;
            let insertValues = {
                work_id: memos.workId,
                addr: a3,
                hash: txHash
            };
            mysqlInsertPromises[i] = mysqlUtils.insert(c, 'work_info', insertValues);
        }
        await Promise.all(mysqlInsertPromises);

        let eTs = (new Date()).valueOf();

        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});





// import jlib from 'jingtum-lib';
// import ipfsAPI from 'ipfs-api';
// import mysql from 'mysql';
// import sha256 from 'crypto-js/sha256.js';

// import * as requestInfo from './utils/jingtum/requestInfo.js';
// import * as tx from './utils/jingtum/tx.js'
// import * as ipfsUtils from './utils/ipfsUtils.js';
// import * as mysqlUtils from './utils/mysqlUtils.js';
// import * as localUtils from './utils/localUtils.js';

// import {Account, Server, userMemo, ipfsConf, mysqlConf, debugMode} from './utils/info.js';

// const ipfs = ipfsAPI(ipfsConf);
// const c = mysql.createConnection(mysqlConf);
// c.connect();

// // 每个帐本上传交易数
// const uploadPerLedger = 10;

// /*----------平台账号(账号1)----------*/

// const a1 = Account.a1Account;
// const s1 = Account.a1Secret;

// /*----------版权人账号(帐号3)----------*/

// const a3 = Account.a3Account;

// /*----------创建链接(server2)----------*/

// const Remote = jlib.Remote;
// const r = new Remote({server: Server.s2, local_sign: true});

// r.connect(async function(err, result) {

//     // 链接状态
//     if(err) {
//         return console.log('err: ', err);
//     }
//     else if(result) {
//         console.log('connect: ', result);
//     }

//     // 获取序列号
//     let accountInfo = await requestInfo.requestAccountInfo(a1, r, true);
//     let seq = accountInfo.account_data.Sequence;

//     /*----------处理用户存证请求----------*/
    
//     r.on('ledger_closed', async function(msg) {

//         console.log('on ledger_closed: ' + msg.ledger_index);

//         let sTs = (new Date()).valueOf();

//         // 设置序列号
//         let seqArr = new Array(uploadPerLedger).fill('').map((value, index) => index + seq);

//         // 根据序列号取出作品数据
//         let memosArr = seqArr.map(seqTemp => {
//             let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]);
//             return {...userMemo[randFlag]};
//         });

//         // 作品存入IPFS，获取哈希标识
//         let workAddPromises = memosArr.map(memos => ipfsUtils.add(ipfs, memos.work));
//         let workHashArr = await Promise.all(workAddPromises);

//         // 作品信息存入IPFS，获取哈希标识
//         let workInfoAddPromises = memosArr.map((memos, index) => {
//             memos.workName += seqArr[index];
//             delete memos.work;
//             let workInfo = Buffer.from(JSON.stringify(memos));
//             if(debugMode) {
//                 console.log('workInfo:', memos);
//             }
//             /* workInfo: {
//                 workName: 'm2_137',
//                 createdTime: 1579017600,
//                 publishedTime: 1579017600,
//                 workType: 1,
//                 workForm: 1,
//                 workField: 1
//             } */
//             return ipfsUtils.add(ipfs, workInfo);
//         });
//         let workInfoHashArr = await Promise.all(workInfoAddPromises);

//         // 上传存证交易
//         let uploadPromises = memosArr.map((memos, index) => {
//             memos.workId = sha256(a3 + memos.workName).toString();
//             let uploadInfo = {
//                 workHash: workHashArr[index],
//                 workInfoHash: workInfoHashArr[index],
//                 workId: memos.workId
//             };
//             let uploadMemos = "0_" + JSON.stringify(uploadInfo);
//             if(debugMode) {
//                 console.log('upload:', uploadInfo);
//             }
//             else {
//                 console.log('upload:', memos.workName);
//             }
//             /* upload: {
//                 workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
//                 workInfoHash: 'QmR383PSpJFe9Z9cXM6xKFs2B7838K15HBWPAGtTR8uCVr',
//                 workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4'      
//             } */
//             return tx.buildPaymentTx(a1, s1, r, seq++, a3, 0.000001, uploadMemos, true);
//         });
//         let uploadResArr = await Promise.all(uploadPromises);

//         // 作品ID与对应哈希存入mysql
//         let mysqlInsertPromises = uploadResArr.map((res, index) => {
//             let txHash = res.tx_json.hash;
//             let insertValues = {
//                 work_id: memosArr[index].workId,
//                 addr: a3,
//                 hash: txHash
//             };
//             return mysqlUtils.insert(c, 'work_info', insertValues);
//         });
//         await Promise.all(mysqlInsertPromises);

//         let eTs = (new Date()).valueOf();

//         console.log('----------' + (eTs - sTs) + 'ms----------');

//     });

// });