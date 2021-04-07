import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {chains, ipfsConf, mysqlConf, debugMode, rightTokenName} from '../../utils/info.js';

const u = jlib.utils;

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const tokenChain = chains[0]; // 交易链

/*----------智能预警系统发币账号----------*/

const a0 = tokenChain.account.a[0].address;

/*----------智能授权系统发币账号----------*/

const a1 = tokenChain.account.a[1].address;

/*----------创建链接(交易链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: tokenChain.server[3], local_sign: true});

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

        console.log(txs);

        // 筛选版权通证发行、版权通证转让、授权通证发行、授权通证转让
        let issueRightTokenTxs = [];
        let transferRightTokenTxs = [];
        let issueApproveTokenTxs = [];
        let transferApproveTokenTxs = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            /* 
            权利项通证发行：
                1、交易类型为通证转让
                2、通证名称对应rightTokenName
                3、源地址为智能预警系统发币账号、目标地址为用户
            许可通证发行：
                1、交易类型为通证转让
                2、通证名称对应approveTokenName
                3、源地址为智能授权系统发币账号、目标地址为用户
            权利项通证转让：
                1、交易类型为通证转让
                2、通证名称对应rightTokenName
                3、源地址为用户、目标地址为用户
            许可通证转让：
                1、交易类型为通证转让
                2、通证名称对应approveTokenName
                3、源地址为用户、目标地址为用户
            */
            switch(txType) {
                case 'TransferToken':
                    let txTokenName = u.hexToString(tx.FundCode);
                    switch(txTokenName) {
                        case 'rightToken':
                            if(src == a0 && dst != a0) {
                                issueRightTokenTxs.push(tx);
                            }
                            else if(src != a0 && dst != a0) {
                                transferRightTokenTxs.push(tx);
                            }
                            break;
                        case 'approveToken':
                            if(src == a0 && dst != a0) {
                                issueApproveTokenTxs.push(tx);
                            }
                            else if(src != a0 && dst != a0) {
                                transferApproveTokenTxs.push(tx);
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }

        await processIssueRightToken(issueRightTokenTxs, issueRightTokenTxs.length);
        await processTransferRightToken(transferRightTokenTxs, transferRightTokenTxs.length);
        // await processIssueApproveToken(issueApproveTokenTxs, issueApproveTokenTxs.length);
        // await processTransferApproveToken(transferApproveTokenTxs, transferApproveTokenTxs.length);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});

async function processIssueRightToken(issueRightTokenTxs, loopConter) {
    
    // 获取交易中的通证信息
    let tokenInfoPromises = new Array(loopConter);
    for(let i = loopConter - 1; i >= 0; i--) {
        let tx = issueRightTokenTxs[i];
        tokenInfoPromises[i] = erc721.requestTokenInfo(r, tx.TokenID, false);
    }
    let tokenInfoResArr = await Promise.all(tokenInfoPromises);

    // 解析信息
    let tokenInfoArr = new Array(loopConter);
    for(let i = loopConter - 1; i >= 0; i--) {
        let res = tokenInfoResArr[i];
        tokenInfoArr[i] = localUtils.memos2obj(res.TokenInfo.Memos);
    }

    // 通证信息存入数据库
    let postTokenInfoPromises = new Array(loopConter);
    for(let i = loopConter - 1; i >= 0; i--) {
        let tx = issueRightTokenTxs[i];
        let tokenInfoRes = tokenInfoResArr[i];
        let tokenInfo = tokenInfoArr[i];
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
        let sql = sqlText.table('right_token_info').data(tokenInfo).insert();
        postTokenInfoPromises[i] = mysqlUtils.sql(c, sql);
    }
    await Promise.all(postTokenInfoPromises);

}

async function processTransferRightToken(transferRightTokenTxs, loopConter) {

    // 交易信息存入数据库
    let postTransferInfoPromises = new Array(loopConter);
    let postAddrChangePromises = new Array(loopConter);
    for(let i = loopConter - 1; i >=0; i--) {
        let tx = transferRightTokenTxs[i];
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
        sql = sqlText.table('right_token_info').data({addr: tx.Destination}).where({token_id: tx.TokenID}).update();
        postAddrChangePromises[i] = mysqlUtils.sql(c, sql);
    }
    await Promise.all(postTransferInfoPromises); // 交易信息存入transfer_info表
    await Promise.all(postAddrChangePromises); // 更改token_info表中的拥有者地址

}

// async function processIssueApproveToken(issueRightTokenTxs, loopConter)

// async function processTransferApproveToken(transferRightTokenTxs, loopConter)