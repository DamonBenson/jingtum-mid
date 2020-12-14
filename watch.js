import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as erc721 from './utils/jingtum/erc721.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
import * as fetch from './utils/fetch.js';

import {Account, Server, ipfsConf, debugMode, tokenName} from './utils/info.js';

const ipfs = ipfsAPI(ipfsConf);

const ag = Account.gateAccount;

/*----------创建链接(server5)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: Server.s5, local_sign: true});

r.connect(async function(err, result) {

    /*---------链接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }


    let tokenTx = {};

    /*----------监听交易，推送数据----------*/

    r.on('ledger_closed', async function(msg) {

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

        // 筛选存证交易、通证发行交易、通证转让交易
        let uploadTxs = [];
        let tokenTxs = [];
        let transferTxs = [];
        for(let i = txLoopConter; i >= 0; i--) {
            let tx = txs[i];
            let txType = tx.TransactionType;
            let src = tx.Account;
            let dst = tx.Destination;
            if(txType == 'Payment' && localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(0, 1) == 0) {
                uploadTxs.push(tx)
            }
            else if(txType == 'TransferToken') {
                let txTokenName = localUtils.ascii2str(tx.FundCode);
                if(src == ag && dst != ag) {
                    switch(txTokenName) {
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
        const uploadCount = uploadTxs.length;
        const tokenCount = tokenTxs.length;
        const transferCount = transferTxs.length;
        const uploadLoopCounter = uploadCount - 1;
        const tokenLoopCounter = tokenCount - 1;
        const transferLoopCounter = transferCount - 1;
        
        // 获取交易中存储的存证信息
        // [0]=n
        let uploadMemosArr = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let tx = uploadTxs[i];
            uploadMemosArr[i] = JSON.parse(localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(2));
        }

        // 从IPFS上获取作品信息
        // [0]=0
        let workInfoGetPromises = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let memos = uploadMemosArr[i];
            delete memos.workHash;
            workInfoGetPromises[i] = ipfsUtils.get(ipfs, memos.workInfoHash);
        }
        let workInfoJsonArr = await Promise.all(workInfoGetPromises);

        // [0]=n
        let workInfoArr = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let workInfoJson = workInfoJsonArr[i];
            workInfoArr[i] = JSON.parse(workInfoJson);
        }

        // 向后端推送存证信息
        // [0]=0
        let postWorkInfoPromises = new Array(uploadCount);
        for(let i = uploadLoopCounter; i >= 0; i--) {
            let tx = uploadTxs[i];
            let uploadMemos = uploadMemosArr[i];
            let workInfo =  workInfoArr[i];
            delete uploadMemos.workInfoHash;
            let uploadInfo = Object.assign(uploadMemos, workInfo);
            uploadInfo.uploadTime = tx.date + 946684800;
            uploadInfo.addr = tx.Destination;
            if(debugMode) {
                console.log('on upload', uploadInfo);
            }
            else {
                console.log('on upload', uploadInfo.workName);
            }
            /* on upload {
                workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
                workName: 'm2_137',
                createdTime: 1579017600,
                publishedTime: 1579017600,
                workType: 1,
                workForm: 1,
                workField: 1,
                uploadTime: 1604924000,
                addr: 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf'
            } */
            postWorkInfoPromises[i] = fetch.postData('http://127.0.0.1:8080/uploadInfo', uploadInfo);
        }
        // await Promise.all(postWorkInfoPromises);

        // 获取交易中的通证信息
        let tokenInfoPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tx = tokenTxs[i];
            tokenInfoPromises[i] = erc721.requestTokenInfo(r, tx.TokenID, false);
        }
        let tokenInfoResArr = await Promise.all(tokenInfoPromises);

        let tokenInfoArr = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let res = tokenInfoResArr[i];
            tokenInfoArr[i] = localUtils.memos2obj(res.TokenInfo.Memos);
        }

        // 从IPFS上获取确权信息
        let authInfoGetPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tokenInfo = tokenInfoArr[i];
            authInfoGetPromises[i] = ipfsUtils.get(ipfs, tokenInfo.authInfoHash);
        }
        let authInfoJsonArr = await Promise.all(authInfoGetPromises);

        // 向后端推送确权信息
        let postAuthInfoPromises = new Array(tokenCount);
        for(let i = tokenLoopCounter; i >= 0; i--) {
            let tx = tokenTxs[i];
            let tokenInfo = tokenInfoArr[i];
            let authInfo = JSON.parse(authInfoJsonArr[i].toString());
            if(!tokenTx[tokenInfo.workId]) {
                let authTxInfo = {...authInfo};
                authTxInfo.workId = tokenInfo.workId;
                authTxInfo.authId = tokenInfo.authId;
                authTxInfo.authTime = tx.date + 946684800;
                authTxInfo.certHash = tokenInfo.certHash;
                tokenTx[tokenInfo.workId] = 1;
                if(debugMode) {
                    console.log('on auth:', authTxInfo);
                }
                else {
                    console.log('on auth:', authTxInfo.authId);
                }
                /* on auth: {
                    authCode: 'a1',
                    authName: '上海版权局',
                    certNum: 'c1',
                    workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
                    authId: 'DCI0000001657',
                    authTime: 1604924010,
                    certHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3'
                } */
                authInfoGetPromises[i] = fetch.postData('http://127.0.0.1:8080/authInfo', authTxInfo);
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
        // await Promise.all(postAuthInfoPromises);

        // 向后端推送通证信息
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
            if(debugMode) {
                console.log('on token:', tokenInfo);
            }
            else {
                console.log('on token:', tokenInfo.workId + '_' + tokenInfo.right);
            }
            /* on token: {
                workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',     
                state: 2,
                right: 5,
                approveArr: '',
                tokenId: '51DFC1AA1594989DB27A1CFF1E180FEF355689341EDA11539810FFEBDE974781',    
                addr: 'jdNdAv5chV3iN44SrxzSbyxBTuSXJXEKq'
            } */
            postTokenInfoPromises[i] = fetch.postData('http://127.0.0.1:8080/tokenInfo', tokenInfo);
        }
        // await Promise.all(postTokenInfoPromises);

        let eTs = (new Date()).valueOf();

        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

})





// import jlib from 'jingtum-lib';
// import ipfsAPI from 'ipfs-api';

// import * as requestInfo from './utils/jingtum/requestInfo.js';
// import * as erc721 from './utils/jingtum/erc721.js';
// import * as ipfsUtils from './utils/ipfsUtils.js';
// import * as localUtils from './utils/localUtils.js';
// import * as fetch from './utils/fetch.js';

// import {Account, Server, ipfsConf, debugMode, tokenName} from './utils/info.js';

// const ipfs = ipfsAPI(ipfsConf);

// const ag = Account.gateAccount;

// /*----------创建链接(server5)----------*/

// var Remote = jlib.Remote;
// var r = new Remote({server: Server.s5, local_sign: true});

// r.connect(async function(err, result) {

//     /*---------链接状态----------*/

//     if(err) {
//         return console.log('err: ', err);
//     }
//     else if(result) {
//         console.log('result: ', result);
//     }


//     let tokenTx = {};

//     /*----------监听交易，推送数据----------*/

//     r.on('ledger_closed', async function(msg) {

//         console.log('on ledger_closed: ' + msg.ledger_index);

//         let sTs = (new Date()).valueOf();

//         // 获取所有交易哈希
//         let ledgerIndex = msg.ledger_index;
//         let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
//         let txHashs = ledger.transactions;

//         // 获取所有交易信息
//         let txPromises = txHashs.map(txHash => {
//             return requestInfo.requestTx(r, txHash, false);
//         });
//         let txs = await Promise.all(txPromises);

//         // 筛选存证交易、通证发行交易
//         let uploadTxs = txs.filter(tx => tx.TransactionType == 'Payment' && localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(0, 1) == 0);
//         let tokenTxs = txs.filter(tx => tx.TransactionType == 'TransferToken' && tx.Account == ag && localUtils.ascii2str(tx.FundCode) == tokenName && tx.Destination != ag);
        
//         // 获取交易中存储的存证信息
//         let uploadMemosArr = uploadTxs.map(tx => JSON.parse(localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(2)));

//         // 从IPFS上获取作品信息
//         let workInfoGetPromises = uploadMemosArr.map(memos => {
//             delete memos.workHash;
//             return ipfsUtils.get(ipfs, memos.workInfoHash);
//         });
//         let workInfoJsonArr = await Promise.all(workInfoGetPromises);
//         let workInfoArr = workInfoJsonArr.map(workInfoJson => JSON.parse(workInfoJson));

//         // 向后端推送存证信息
//         let postWorkInfoPromises = uploadTxs.map((tx, index) => {
//             delete uploadMemosArr[index].workInfoHash;
//             let uploadInfo = Object.assign(uploadMemosArr[index], workInfoArr[index]);
//             uploadInfo.uploadTime = tx.date + 946684800;
//             uploadInfo.addr = tx.Destination;
//             if(debugMode) {
//                 console.log('on upload', uploadInfo);
//             }
//             else {
//                 console.log('on upload', uploadInfo.workName);
//             }
//             /* on upload {
//                 workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
//                 workName: 'm2_137',
//                 createdTime: 1579017600,
//                 publishedTime: 1579017600,
//                 workType: 1,
//                 workForm: 1,
//                 workField: 1,
//                 uploadTime: 1604924000,
//                 addr: 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf'
//             } */
//             return fetch.postData('http://127.0.0.1:8080/uploadInfo', uploadInfo);
//         });
//         await Promise.all(postWorkInfoPromises);

//         // 获取交易中的通证信息
//         let tokenInfoPromises = tokenTxs.map(tx => erc721.requestTokenInfo(r, tx.TokenID, false));
//         let tokenInfoResArr = await Promise.all(tokenInfoPromises);
//         let tokenInfoArr = tokenInfoResArr.map(res => localUtils.memos2obj(res.TokenInfo.Memos));

//         // 从IPFS上获取确权信息
//         let authInfoGetPromises = tokenInfoArr.map(tokenInfo => ipfsUtils.get(ipfs, tokenInfo.authInfoHash));
//         let authInfoJsonArr = await Promise.all(authInfoGetPromises);
//         let authInfoArr = authInfoJsonArr.map(authInfoJson => JSON.parse(authInfoJson.toString()));

//         // 向后端推送确权信息
//         let postAuthInfoPromises = authInfoArr.map((authInfo, index) => {

//             // 若未推送过某个通证对应作品的确权信息，则推送并记录
//             if(!tokenTx[tokenInfoArr[index].workId]) {
//                 let authTxInfo = {...authInfo};
//                 authTxInfo.workId = tokenInfoArr[index].workId;
//                 authTxInfo.authId = tokenInfoArr[index].authId;
//                 authTxInfo.authTime = tokenTxs[index].date + 946684800;
//                 authTxInfo.certHash = tokenInfoArr[index].certHash;
//                 tokenTx[tokenInfoArr[index].workId] = 1;
//                 if(debugMode) {
//                     console.log('on auth:', authTxInfo);
//                 }
//                 else {
//                     console.log('on auth:', authTxInfo.authId);
//                 }
//                 /* on auth: {
//                     authCode: 'a1',
//                     authName: '上海版权局',
//                     certNum: 'c1',
//                     workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
//                     authId: 'DCI0000001657',
//                     authTime: 1604924010,
//                     certHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3'
//                 } */
//                 return fetch.postData('http://127.0.0.1:8080/authInfo', authTxInfo);
//             }

//             // 若已收到同一作品的17个通证，则删除记录
//             else if(tokenTx[tokenInfoArr[index].workId] == 16) {
//                 delete tokenTx[tokenInfoArr[index].workId];
//             }

//             // 若已推送过通证对应作品的确权信息，则不推送并记录
//             else {
//                 tokenTx[tokenInfoArr[index].workId]++;
//             }

//         });
//         await Promise.all(postAuthInfoPromises);

//         // 向后端推送通证信息
//         let postTokenInfoPromises = tokenInfoArr.map((tokenInfo, index) => {
//             delete tokenInfo.authInfoHash;
//             delete tokenInfo.authId;
//             delete tokenInfo.certHash;
//             tokenInfo.tokenId = tokenTxs[index].TokenID;
//             tokenInfo.addr = tokenInfoResArr[index].TokenInfo.TokenOwner;
//             if(debugMode) {
//                 console.log('on token:', tokenInfo);
//             }
//             else {
//                 console.log('on token:', tokenInfo.workId + '_' + tokenInfo.right);
//             }
//             /* on token: {
//                 workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',     
//                 state: 2,
//                 right: 5,
//                 approveArr: '',
//                 tokenId: '51DFC1AA1594989DB27A1CFF1E180FEF355689341EDA11539810FFEBDE974781',    
//                 addr: 'jdNdAv5chV3iN44SrxzSbyxBTuSXJXEKq'
//             } */
//             return fetch.postData('http://127.0.0.1:8080/tokenInfo', tokenInfo);
//         });
//         await Promise.all(postTokenInfoPromises);

//         let eTs = (new Date()).valueOf();

//         console.log('----------' + (eTs - sTs) + 'ms----------');

//     });

// })