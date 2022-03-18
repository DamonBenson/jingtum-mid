import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as tokenLayer from '../../utils/jingtum/tokenLayer.js';
import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as localUtils from '../../utils/localUtils.js';

import {userAccount, chains, tokenName} from '../../utils/config/jingtum.js';
import {mysqlConf} from '../../utils/config/mysql.js';
import {debugMode} from '../../utils/config/project.js';

const u = jlib.utils;

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
setInterval(() => c.ping(), 60000);

const tokenChain = chains[1]; // 交易链

const flagAddrs = userAccount.superviseAccount.map(acc => acc.address);
const tokenInfosAddrs = userAccount.authenticateAccount.map(acc => acc.address);

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
        let transferApproveTokenTxs = [];
        let tokenInfoChangeTxs = [];
        let tokenFlagChangeTxs = [];

        // console.log(txs);

        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            let processedTx = u.processTx(tx, src);
            processedTx.account = src;
            console.log("processedTx:",processedTx);
            let txTokenName;
            switch(txType) {
                case 'PublishCopyrightToken':
                    txTokenName = processedTx.token;
                    switch(txTokenName) {
                        case tokenName.copyright:
                            if((src == userAccount.baiduAuthorizeAccount.address && dst != userAccount.baiduAuthorizeAccount.address) ||
                            (src == userAccount.fakeBaiduAuthorizeAccount.address && dst != userAccount.fakeBaiduAuthorizeAccount.address)) {
                                issueRightTokenTxs.push(processedTx);
                                console.log("PublishCopyrightToken Pushed");
                            }
                            break;
                        case tokenName.approve:
                            if(src == userAccount.buptAuthorizeAccount.address && dst != userAccount.buptAuthorizeAccount.address) {
                                issueApproveTokenTxs.push(processedTx);
                                console.log("PublishCopyrightToken Pushed");
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 'ModifyAuthenticationInfo':
                    tokenInfoChangeTxs.push(processedTx);
                    console.log("ModifyAuthenticationInfo Pushed");
                    // TODO 检验通证层合法发布
                    // if(tokenInfosAddrs.includes(src)) {
                    //     tokenInfoChangeTxs.push(processedTx);
                    //     console.log("ModifyAuthenticationInfo Pushed");
                    // }
                    // else if(flagAddrs.includes(src)) {
                    //     tokenFlagChangeTxs.push(processedTx);
                    //     console.log("ModifyAuthenticationInfo Pushed");
                    // }
                    break;
                default:
                    break;
            }
        }

        await processIssueRightToken(issueRightTokenTxs, issueRightTokenTxs.length);// 版权通证发行
        await processIssueApproveToken(r, issueApproveTokenTxs, issueApproveTokenTxs.length);
        // await processTransferRightToken(transferRightTokenTxs, transferRightTokenTxs.length);
        // await processTransferApproveToken(transferApproveTokenTxs, transferApproveTokenTxs.length);
        await processTokenInfoChange(tokenInfoChangeTxs, tokenInfoChangeTxs.length);// 版权通证确权

        // 结束计时
        console.timeEnd('chain1Watch');
        console.log('--------------------');

    });

});

async function processIssueRightToken(issueRightTokenTxs, loopConter) {
    console.time('processIssueRightToken');

    if(debugMode == true && loopConter != 0) {
        console.log('issueRightTokenTxs:', issueRightTokenTxs);
    }

    let copyrightInfoPromises = [];

    issueRightTokenTxs.forEach(async(issueRightTokenTx) => {
        // console.log('issueRightTokenTx:', issueRightTokenTx);//接受的交易

        let tokenInfos = issueRightTokenTx;
        // console.log('tokenInfosTokenTx...............');
        // console.log('tokenInfosTokenTx:', tokenInfos);//接受的tokenObj
        // let tokenInfosObj = localUtils.tokenInfos2obj(tokenInfos);
        let tokenInfosObj = tokenInfos;
        let copyrightInfo = Object();
        copyrightInfo = praseCopyrightToken(tokenInfosObj);
        // console.log('copyrightInfo:', copyrightInfo);//入库信息
        let sql = sqlText.table('CopyrightToken').data(copyrightInfo).insert();
        copyrightInfoPromises.push(mysqlUtils.sql(c, sql));

    });

    console.timeEnd('processIssueRightToken');

    await Promise.all(copyrightInfoPromises);

}

function praseCopyrightToken(tokenInfosObj){
    let copyrightInfo = Object();
    // *** CopyrightToken *** //
    copyrightInfo.TokenId                               = tokenInfosObj.tokenId;
    if(tokenInfosObj.adminAddress){
        copyrightInfo.adminAddress                      = tokenInfosObj.adminAddress;
    }
    else{
        copyrightInfo.adminAddress                      = tokenInfosObj.receiver;
    }
    
    copyrightInfo.timestamp                             = tokenInfosObj.Timestamp;
    if(tokenInfosObj.authenticationInfos){
        copyrightInfo.authenticationInfo                = JSON.stringify(tokenInfosObj.authenticationInfos);                   
    }else{
        copyrightInfo.authenticationInfo                = JSON.stringify({"authenticationInstitudeName":"","authenticationId":"","authenticatedDate":""});                   
    }
    copyrightInfo.copyrightType                         = tokenInfosObj.copyrightType;
    copyrightInfo.copyrightGetType                      = tokenInfosObj.copyrightTypeGetType;
    copyrightInfo.copyrightUnit                         = JSON.stringify(tokenInfosObj.copyrightUnits);
    let copyrightConstraint = tokenInfosObj.copyrightConstraint[0];
    copyrightInfo.copyrightConstraint_copyrightLimit=copyrightConstraint.copyrightLimit;
    let apprConstraint = tokenInfosObj.apprConstraint[0];
    copyrightInfo.apprConstraint_channel=tokenInfosObj.apprConstraint[0].area;
    copyrightInfo.apprConstraint_area=apprConstraint.channel;
    copyrightInfo.apprConstraint_time=apprConstraint.time;
    copyrightInfo.apprConstraint_transferType=apprConstraint.reapproveType;
    copyrightInfo.apprConstraint_reapproveType=apprConstraint.transferType;
    let licenseConstraint = tokenInfosObj.licenseConstraint[0];
    copyrightInfo.licenseConstraint_type=licenseConstraint.type;
    copyrightInfo.licenseConstraint_area=licenseConstraint.area;
    copyrightInfo.licenseConstraint_time=licenseConstraint.time;
    copyrightInfo.constraintExplain=tokenInfosObj.constraintExplain;
    copyrightInfo.constraintExpand=tokenInfosObj.constraintExpand;
    copyrightInfo.workId=tokenInfosObj.workId;
    let copyrightStatus = tokenInfosObj.copyrightStatus[0];
    copyrightInfo.publishStatus = copyrightStatus.publishStatus;
    copyrightInfo.publishCity = copyrightStatus.publishCity;
    copyrightInfo.publishCountry = copyrightStatus.publishCountry;
    copyrightInfo.publishDate = copyrightStatus.publishDate;
    copyrightInfo.comeoutStatus = copyrightStatus.comeoutStatus;
    copyrightInfo.comeoutCity = copyrightStatus.domeoutCity;//TODO comeoutCity
    copyrightInfo.comeoutCountry = copyrightStatus.domeoutCountry;//TODO comeoutCountry
    copyrightInfo.comeoutDate = copyrightStatus.domeoutDate;//TODO  comeoutDate
    copyrightInfo.issueStatus = copyrightStatus.issueStatus;
    copyrightInfo.issueCity = copyrightStatus.issueCity;
    copyrightInfo.issueCountry = copyrightStatus.issueCountry;
    copyrightInfo.issueDate = copyrightStatus.issueDate;
    copyrightInfo.flag = tokenInfosObj.flag;

    return copyrightInfo;
}

async function processIssueApproveToken(tokenRemote, issueApproveTokenTxs, loopConter) {
    
    if(debugMode == true && loopConter != 0) {
        console.log('issueApproveTokenTxs:', issueApproveTokenTxs);
    }

    let approveInfoPromises = [];

    issueApproveTokenTxs.forEach(async(issueApproveTokenTx) => {

        let tokenInfos = issueApproveTokenTx.tokenInfos;
        let approveInfo = localUtils.tokenInfos2obj(tokenInfos);

        approveInfo.approveId = issueApproveTokenTx.tokenId;
        approveInfo.startTime = issueApproveTokenTx.date;
        approveInfo.timestamp = issueApproveTokenTx.date;
        approveInfo.address = issueApproveTokenTx.receiver;

        let approveTokenInfo = await erc721.requestTokenInfo(tokenRemote, issueApproveTokenTx.tokenId, false);
        let copyrightId = approveTokenInfo.TokenInfo.ReferenceID;
        let rightTokenInfo = await erc721.requestTokenInfo(tokenRemote, copyrightId, false);
        tokenInfos = rightTokenInfo.TokenInfo.TokenInfos.map(TokenInfo => TokenInfo.TokenInfo);
        let copyrightInfo = localUtils.tokenInfos2obj(tokenInfos);
        let copyrightType = copyrightInfo.copyrightType;

        approveInfo.copyrightId = copyrightId;
        approveInfo.copyrightType = copyrightType;

        localUtils.toMysqlObj(approveInfo);
        console.log('approveInfo:', approveInfo);

        let sql = sqlText.table('appr_token_info').data(approveInfo).insert();
        approveInfoPromises.push(mysqlUtils.sql(c, sql));

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

async function processTokenInfoChange(tokenInfoChangeTxs, loopConter) {
    console.time("processTokenInfoChange");

    if(debugMode == true && loopConter != 0) {
        console.log('tokenInfoChangeTxs:', tokenInfoChangeTxs);
    }

    let authInfoPromises = [];

    tokenInfoChangeTxs.forEach(async(tokenInfoChangeTx) => {
        // 获取copyrightId
        let copyrightId = tokenInfoChangeTx.tokenId;
        console.log('authenticationInfos:', tokenInfoChangeTx.authenticationInfos);

        // 按照copyrightId请求CopyrightToken
        let txInfo = await tokenLayer.requestCopyrightTokenInfoLayer(r, copyrightId);
                           
        let tokenInfos = txInfo.TokenInfo;
        let tokenInfosObj = tokenInfos;
        let copyrightInfo = Object();
        copyrightInfo = praseCopyrightToken(tokenInfosObj);
        // copyrightInfo.TokenId = sha256(localUtils.randomNumber(100, 2000000000).toString()).toString();

        console.log('copyrightInfo:', copyrightInfo);//入库信息
        let sql = sqlText.table('CopyrightToken').data(copyrightInfo).update();
        // let sql = sqlText.table('CopyrightToken').data(copyrightInfo).insert();
        authInfoPromises.push(mysqlUtils.sql(c, sql));

    });
    console.timeEnd("processTokenInfoChange");
    
    await Promise.all(authInfoPromises);

}
