import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {userAccount, chains, tokenName} from '../../utils/config/jingtum.js';
import {mysqlConf} from '../../utils/config/mysql.js';

const u = jlib.utils;

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const tokenChain = chains[1]; // 交易链

/*----------创建链接(交易链服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: tokenChain.server[2], local_sign: true});

r.connect(async function(err, result) {

    /*---------确权链连接状态----------*/

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
        console.time('chain1Watch');

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
            Destination: 'jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan',
            Fee: '10000',
            Flags: 0,
            FundCode: '7269676874546F6B656E',
            Memos: [ [Object], [Object] ],
            Sequence: 12718,
            SigningPubKey: '03A0D4DE99A47A0E9E7CD2A211FBF60C6094CFC7E4FFBC68D793920E7D86DCC720',
            TokenID: '4EA5C508A6566E76240543F8FEB06FD457777BE39549C4016436AFDA65D2330E', 
            TransactionType: 'TransferToken',
            TxnSignature: '304402200FA702462F4E702A6FD58A4FB8B0415B056B36BC3DE54AC5775418133A62FF50022000AC6A2B6F0D34F65A1EF20DA0EA816E5AF18253BFFF4ADC40675FF496E8B51C', 
            date: 672982150,
            hash: 'DD9F7FBC803EFDCEC4E5149F818AAD9111C21FA898063EDDA9D94C09DF67DF25',    
            inLedger: 1306222,
            ledger_index: 1306222,
            meta: {
              AffectedNodes: [Array],
              TransactionIndex: 0,
              TransactionResult: 'tesSUCCESS'
            },
            validated: true
        } */

        /* jlib.utils.processTx格式 {
            date: 1619667080,
            hash: '0E1E1839273F5915623E822923C84B01415EBD9484DAE9B07A1C704EED59D7E5',      
            type: 'transfertoken',
            fee: '0.01',
            result: 'tesSUCCESS',
            memos: [ { MemoData: 'a', MemoType: 'a' }, { MemoData: '', MemoType: 'b' } ],  
            ledger_index: 1306235,
            publisher: 'j9uudceu9gX3DyLcTL7czGgUnfzP9fQxko',
            receiver: 'jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan',
            token: 'rightToken',
            tokenId: '961B6DD3EDE3CB8ECBAACBD68DE040CD78EB2ED5889130CCEB4C49268EA4D506',   
            effects: [],
            balances: { SWT: 99999872.808593 },
            balancesPrev: { SWT: 99999872.818593 }
        } */

        // 筛选版权通证发行、版权通证转让
        let issueRightTokenTxs = [];
        let issueApproveTokenTxs = [];
        let transferRightTokenTxs = [];
        let transferRightTokenTxs = [];

        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            let processedTx;
            let txTokenName;
            switch(txType) {
                case 'TransferToken':
                    processedTx = u.processTx(tx, src);
                    processedTx.account = src;
                    txTokenName = processedTx.token;
                    switch(txTokenName) {
                        case tokenName.copyright:
                            if(src == userAccount.fakeBaiduAuthorizeAccount.address && dst != userAccount.fakeBaiduAuthorizeAccount.address) {
                                issueRightTokenTxs.push(processedTx);
                            }
                            else if(src != userAccount.fakeBaiduAuthorizeAccount.address && dst != userAccount.fakeBaiduAuthorizeAccount.address) {
                                transferRightTokenTxs.push(processedTx);
                            }
                            break;
                        case tokenName.approve:
                            if(src == userAccount.buptAuthorizeAccount.address && dst != userAccount.buptAuthorizeAccount.address) {
                                issueApproveTokenTxs.push(processedTx);
                            }
                            else if(src != userAccount.buptAuthorizeAccount.address && dst != userAccount.buptAuthorizeAccount.address) {
                                transferApproveTokenTxs.push(processedTx);
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
        await processIssueApproveToken(issueApproveTokenTxs, issueApproveTokenTxs.length);
        // await processTransferRightToken(transferRightTokenTxs, transferRightTokenTxs.length);
        // await processTransferApproveToken(transferApproveTokenTxs, transferApproveTokenTxs.length);

        // 结束计时
        console.timeEnd('chain1Watch');
        console.log('--------------------');

    });

});

async function processIssueRightToken(issueRightTokenTxs, loopConter) {
    
    console.log('issueRightTokenTxs:', issueRightTokenTxs);

    let rightInfoPromises = [];

    issueRightTokenTxs.forEach(async(issueRightTokenTx) => {

        let txMemos = issueRightTokenTx.memos;
        let rightInfo = localUtils.tokenInfos2obj(txMemos);

        rightInfo.copyrightId = issueRightTokenTx.tokenId;
        rightInfo.timestamp = issueRightTokenTx.date;
        rightInfo.address = issueRightTokenTx.receiver;

        let copyrightHolderHash = rightInfo.copyrightHolder;
        let copyrightHolder = await ipfsUtils.get(ipfs, copyrightHolderHash);
        Object.assign(rightInfo, copyrightHolder);
        delete rightInfo.copyrightHolder;

        localUtils.toMysqlObj(rightInfo);
        console.log(rightInfo);

        let sql = sqlText.table('right_token_info').data(rightInfo).insert();
        rightInfoPromises.push(mysqlUtils.sql(c, sql));

    });

    await Promise.all(rightInfoPromises);

}

async function processIssueApproveToken(issueApproveTokenTxs, loopConter) {
    
    console.log('issueApproveTokenTxs:', issueApproveTokenTxs);

    let approveInfoPromises = [];

    issueApproveTokenTxs.forEach(async(issueApproveTokenTx) => {

        // 方法体

    });

    await Promise.all(approveInfoPromises);

}

// async function processTransferRightToken(transferRightTokenTxs, loopConter) {

//     // 交易信息存入数据库
//     let postTransferInfoPromises = new Array(loopConter);
//     let postAddrChangePromises = new Array(loopConter);
//     for(let i = loopConter - 1; i >=0; i--) {
//         let tx = transferRightTokenTxs[i];
//         let transferInfo = {
//             transfer_id: tx.hash,
//             token_id: tx.TokenID,
//             addr: tx.Account,
//             rcv: tx.Destination,
//             transfer_time: tx.date + 946684800,
//             // transfer_time: localUtils.toMysqlDate(tx.date + 946684800),
//         };
//         if(debugMode) {
//             console.log('on transfer:', transferInfo);
//         }
//         else {
//             console.log('on transfer:', transferInfo.token_id);
//         }
//         /* on transfer: {
//             transfer_id: 'F1697D6615E6F9FFD5534886DA62813F322AB5D699ACC69E41C7CFAD8EED4D4A',   
//             token_id: 'C59209D11B745FF9903106E6339616CA15ABAA77E4AEC7306AB02D242048B4C5',      
//             addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
//             rcv: 'ja7En1thjN4dd3atQCRudBEuGgwY8Qdhai',
//             transfer_time: 1608517950
//         } */
//         let sql = sqlText.table('transfer_info').data(transferInfo).insert();
//         postTransferInfoPromises[i] = mysqlUtils.sql(c, sql);
//         sql = sqlText.table('right_token_info').data({addr: tx.Destination}).where({token_id: tx.TokenID}).update();
//         postAddrChangePromises[i] = mysqlUtils.sql(c, sql);
//     }
//     await Promise.all(postTransferInfoPromises); // 交易信息存入transfer_info表
//     await Promise.all(postAddrChangePromises); // 更改token_info表中的拥有者地址

// }