import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {chains, ipfsConf, mysqlConf, debugMode, tokenName} from '../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const chain1 = chains[1]; // 确权链

/*----------版权局账号(确权链银关账号)----------*/

const ag = chain1.account.gate.address;

/*----------创建链接(确权链服务器1)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: chain1.server[1], local_sign: true});

r.connect(async function(err, result) {

    /*---------确权链连接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

    let tokenTx = {}; // 用以判断哪些通证发行交易中的确权信息已经存入数据库（对于确权信息，只需推送17个中的一个）

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

        // 筛选通证发行交易、通证转让交易
        let tokenTxs = [];
        let transferTxs = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            /* 通证发行：
                1、交易类型为通证转让（井通链sdk复用）
                2、通证名称对应
                3、源地址为银关、目标地址为用户
            通证转让：
                1、交易类型为通证转让（井通链sdk复用）
                2、通证名称对应
                3、源地址为用户、目标地址为用户
            */
            if(txType == 'TransferToken') {
                let txTokenName = localUtils.ascii2str(tx.FundCode);
                if(src == ag && dst != ag) {
                    switch(txTokenName) { // 考虑不同种类版权（图片、音乐、视频）为不同名称的通证
                        case tokenName:
                            tokenTxs.push(tx);
                            break;
                    }
                }
                else if(src != ag && dst != ag) {
                    switch(txTokenName) {
                        case tokenName:
                            transferTxs.push(tx);
                            break;
                    }
                }
            }
        }
        const tokenCount = tokenTxs.length;
        const transferCount = transferTxs.length;
        const tokenLoopCounter = tokenCount - 1;
        const transferLoopCounter = transferCount - 1;

        // 获取交易中的通证信息
        let tokenInfoPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tx = tokenTxs[i];
            tokenInfoPromises[i] = erc721.requestTokenInfo(r, tx.TokenID, false);
        }
        let tokenInfoResArr = await Promise.all(tokenInfoPromises);

        // 解析信息
        let tokenInfoArr = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let res = tokenInfoResArr[i];
            tokenInfoArr[i] = localUtils.memos2obj(res.TokenInfo.Memos);
        }

        // 从ipfs上获取确权信息
        let authInfoGetPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tokenInfo = tokenInfoArr[i];
            authInfoGetPromises[i] = ipfsUtils.get(ipfs, tokenInfo.authInfoHash);
        }
        let authInfoJsonArr = await Promise.all(authInfoGetPromises);

        // 确权信息存入数据库
        let postAuthInfoPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tx = tokenTxs[i];
            let tokenInfo = tokenInfoArr[i];
            let authInfo = JSON.parse(authInfoJsonArr[i].toString());
            if(!tokenTx[tokenInfo.workId]) {
                let authTxInfo = {...authInfo};
                authTxInfo.authId = tokenInfo.authId;
                authTxInfo.authTime = tx.date + 946684800; // 井通链时间戳转换为通用时间戳
                authTxInfo.certHash = tokenInfo.certHash;
                authTxInfo.authTime = localUtils.toMysqlDate(authTxInfo.authTime); // 通用时间戳转换为数据库date格式
                localUtils.toMysqlObj(authTxInfo);
                tokenTx[tokenInfo.workId] = 1;
                if(debugMode) {
                    console.log('on auth:', authTxInfo);
                }
                else {
                    console.log('on auth:', authTxInfo.auth_id);
                }
                /* on auth: {
                    auth_code: 'a3',
                    auth_name: '国家版权局',
                    cert_num: 'c3',
                    auth_id: 'DCI0000000585',
                    auth_time: '2020-12-17T02:40:00',
                    cert_hash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3'
                } */
                let workId = tokenInfo.workId;
                let sql = sqlText.table('work_info').data(authTxInfo).where({work_id: workId}).update();
                postAuthInfoPromises[i] = mysqlUtils.sql(c, sql);
            }

            // 若已收到同一作品的17个通证，则删除记录
            else if(tokenTx[tokenInfo.workId] == 16) {
                delete tokenTx[tokenInfo.workId];
            }

            // 若已推送过通证对应作品的确权信息，则不推送并记录
            else {
                tokenTx[tokenInfo.workId]++;
            }
        }
        await Promise.all(postAuthInfoPromises);

        // 通证信息存入数据库
        let postTokenInfoPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tx = tokenTxs[i];
            let tokenInfoRes = tokenInfoResArr[i];
            let tokenInfo = tokenInfoArr[i];
            delete tokenInfo.authInfoHash;
            delete tokenInfo.authId;
            delete tokenInfo.certHash;
            tokenInfo.tokenId = tx.TokenID;
            tokenInfo.addr = tokenInfoRes.TokenInfo.TokenOwner;
            localUtils.toMysqlObj(tokenInfo);
            if(debugMode) {
                console.log('on token:', tokenInfo);
            }
            else {
                console.log('on token:', tokenInfo.work_id + '_' + tokenInfo.right_type);
            }
            /* on token: {
                state: 2,
                addr: 'jn3dGnngMBLXU2GPH8BbCS7qRmXvJFY2ZJ',
                work_id: '01D42A929780AA2ECF1DBC35D7E132FAA476A1B4BAA8224089688806759B5BF8',       
                right_type: 9,
                approve_arr: '',
                token_id: 'C3207FB2E9D510A8546A96FE77593621121AF9198CB831FC472AAF8BA9D7044B'       
            } */
            let sql = sqlText.table('token_info').data(tokenInfo).insert();
            postTokenInfoPromises[i] = mysqlUtils.sql(c, sql);
        }
        await Promise.all(postTokenInfoPromises);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});