import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {userAccount, chains} from '../../utils/config/jingtum.js';
import {mysqlConf} from '../../utils/config/mysql.js';
import {debugMode} from '../../utils/config/project.js';

const u = jlib.utils;

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
setInterval(() => c.ping(err => console.log('MySQL ping err:', err)), 60000);

const uploadChain = chains[0]; // 存证链

/*----------创建链接(存证链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: uploadChain.server[2], local_sign: true});

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
        console.time('chain0Watch');

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

        /* tx格式 {
            Account: 'j9uudceu9gX3DyLcTL7czGgUnfzP9fQxko',
            Amount: '100',
            Destination: 'jG1Y4G3omHCAbAWRuuYZ5zwcftXgvfmaX3',
            Fee: '10000',
            Flags: 0,
            Memos: [ { Memo: [Object] } ],
            Sequence: 12714,
            SigningPubKey: '03A0D4DE99A47A0E9E7CD2A211FBF60C6094CFC7E4FFBC68D793920E7D86DCC720',
            TransactionType: 'Payment',
            TxnSignature: '3044022045483C234A56BD225C146AE62FD70015FEC774C59BBB3B2659D9962E629B69CC022047A9A7A144BD7D304DB60864A5EDB165EF963F5162C2031155D0996DD755D12D',   
            date: 672979190,
            hash: '21CC7F918E023BB5A7D4DD21DB17361397D08DD8DA81F6CB57706D61D74138A6',      
            inLedger: 1305926,
            ledger_index: 1305926,
            meta: {
              AffectedNodes: [ [Object], [Object], [Object] ],
              TransactionIndex: 0,
              TransactionResult: 'tesSUCCESS',
              delivered_amount: 'unavailable'
            },
            validated: true
        } */

        /* jlib.utils.processTx格式 {
            date: 1619664450,
            hash: 'D60F0B86E7680C26058320ABEB6405636B3B1E7222A282CF71FB8C558DA12611',      
            type: 'sent',
            fee: '0.01',
            result: 'tesSUCCESS',
            memos: [ { MemoData: 'test' } ],
            ledger_index: 1305972,
            counterparty: 'jG1Y4G3omHCAbAWRuuYZ5zwcftXgvfmaX3',
            amount: { value: '0.0001', currency: 'SWT', issuer: '' },
            effects: [],
            balances: { SWT: 99999872.828593 },
            balancesPrev: { SWT: 99999872.838693 }
        } */

        // 筛选存证交易
        let uploadTxs = [];

        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            let processedTx = u.processTx(tx, src);
            processedTx.account = src;
            switch(txType) {
                case 'Payment':
                    if(src == userAccount.baiduAuthorizeAccount.address ||
                        src == userAccount.fakeBaiduAuthorizeAccount.address) {
                        uploadTxs.push(processedTx);
                    }
                default:
                    break;
            }
        }

        // 存证交易入数据库
        await processUpload(uploadTxs, uploadTxs.length);

        // 结束计时
        console.timeEnd('chain0Watch');
        console.log('--------------------');

    });

});

async function processUpload(uploadTxs, loopConter) {

    if(debugMode == true) {
        console.log('uploadTxs:', uploadTxs);
    }

    let workInfoPromises = [];

    uploadTxs.forEach(async(uploadTx) => {

        let workInfo = JSON.parse(uploadTx.memos[0].MemoData);

        workInfo.workId = uploadTx.hash;
        workInfo.completionTime = uploadTx.date;
        workInfo.address = uploadTx.counterparty;

        let fileInfoListHash = workInfo.fileInfoList;
        let fileInfoList = JSON.stringify(await ipfsUtils.get(fileInfoListHash));
        workInfo.fileInfoList = fileInfoList;

        if(workInfo.publishStatus == 'Published') {
            workInfo.publishStatus = 1;
            let publishInfoHash = workInfo.publishInfo;
            let publishInfo = await ipfsUtils.get(publishInfoHash);
            Object.assign(workInfo, publishInfo);
            delete workInfo.publishInfo;
        }
        else {
            workInfo.publishStatus = 0;
            delete workInfo.publishInfo;
        }

        console.log("workInfo:", workInfo);
        localUtils.toMysqlObj(workInfo);

        let sql = sqlText.table('work_info').data(workInfo).insert();
        workInfoPromises.push(mysqlUtils.sql(c, sql));

    });

    await Promise.all(workInfoPromises);
    
}