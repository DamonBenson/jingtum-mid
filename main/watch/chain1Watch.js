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

const u = jlib.utils;

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const chain1 = chains[1]; // 确权链

/*----------版权局账号(确权链银关账号)----------*/

const ag = chain1.account.gate.address;

/*----------创建链接(确权链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: chain1.server[3], local_sign: true});

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
                let txTokenName = u.hexToString(tx.FundCode);
                if(txTokenName == tokenName) {
                    if(src == ag && dst != ag) {
                        tokenTxs.push(tx);
                    }
                    else if(src != ag && dst != ag) {
                        transferTxs.push(tx);
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
                // authTxInfo.authTime = localUtils.toMysqlDate(authTxInfo.authTime); // 通用时间戳转换为数据库date格式
                localUtils.toMysqlObj(authTxInfo);
                tokenTx[tokenInfo.workId] = 1;
                if(debugMode) {
                    console.log('on auth:', authTxInfo);
                }
                else {
                    console.log('on auth:', authTxInfo.auth_id);
                }
                /* on auth: {
                    auth_code: 'a1',
                    auth_name: '上海版权局',
                    cert_num: 'c1',
                    auth_id: 'DCI0000003538',
                    auth_time: 1608517760,
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
                addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
                work_id: '7EEC480EEA01B81365B24362318698E1FA372F902E9B77531202E4E8A3852A12',       
                right_type: 8,
                approve_arr: '',
                token_id: 'C59209D11B745FF9903106E6339616CA15ABAA77E4AEC7306AB02D242048B4C5'       
            } */
            let sql = sqlText.table('token_info').data(tokenInfo).insert();
            postTokenInfoPromises[i] = mysqlUtils.sql(c, sql);
        }
        await Promise.all(postTokenInfoPromises);

        // 交易信息存入数据库
        let postTransferInfoPromises = new Array(transferCount);
        let postAddrChangePromises = new Array(transferCount);
        for(let i = transferLoopCounter; i >=0; i--) {
            let tx = transferTxs[i];
            let transferInfo = {
                transfer_id: tx.hash,
                token_id: tx.TokenID,
                addr: tx.Account,
                rcv: tx.Destination,
                transfer_time: tx.date + 946684800,
                // transfer_time: localUtils.toMysqlDate(tx.date + 946684800),
            };
            if(debugMode) {
                console.log('on transfer:', transferInfo);
            }
            else {
                console.log('on transfer:', transferInfo.token_id);
            }
            /* on transfer: {
                transfer_id: 'F1697D6615E6F9FFD5534886DA62813F322AB5D699ACC69E41C7CFAD8EED4D4A',   
                token_id: 'C59209D11B745FF9903106E6339616CA15ABAA77E4AEC7306AB02D242048B4C5',      
                addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
                rcv: 'ja7En1thjN4dd3atQCRudBEuGgwY8Qdhai',
                transfer_time: 1608517950
            } */
            let sql = sqlText.table('transfer_info').data(transferInfo).insert();
            postTransferInfoPromises[i] = mysqlUtils.sql(c, sql);
            sql = sqlText.table('token_info').data({addr: tx.Destination}).where({token_id: tx.TokenID}).update();
            postAddrChangePromises[i] = mysqlUtils.sql(c, sql);
        }
        await Promise.all(postTransferInfoPromises); // 交易信息存入transfer_info表
        await Promise.all(postAddrChangePromises); // 更改token_info表中的拥有者地址

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});