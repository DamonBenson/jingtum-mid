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

        // 获取所有交易哈希
        let ledgerIndex = msg.ledger_index;
        let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
        let txHashs = ledger.transactions;

        // 获取所有交易信息
        let txPromises = txHashs.map(txHash => {
            return requestInfo.requestTx(r, txHash, false);
        });
        let txs = await Promise.all(txPromises);

        // 筛选存证交易、通证发行交易
        let uploadTxs = txs.filter(tx => tx.TransactionType == 'Payment' && localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(0, 1) == 0);
        let tokenTxs = txs.filter(tx => tx.TransactionType == 'TransferToken' && tx.Account == ag && localUtils.ascii2str(tx.FundCode) == tokenName && tx.Destination != ag);
        console.log(tokenTxs);
        
        // 获取交易中存储的存证信息
        let uploadMemosArr = uploadTxs.map(tx => JSON.parse(localUtils.ascii2str(tx.Memos[0].Memo.MemoData).slice(2)));

        // 从IPFS上获取作品信息
        let workInfoGetPromises = uploadMemosArr.map(memos => {
            delete memos.workHash;
            return ipfsUtils.get(ipfs, memos.workInfoHash);
        });
        let workInfoJsonArr = await Promise.all(workInfoGetPromises);
        let workInfoArr = workInfoJsonArr.map(workInfoJson => JSON.parse(workInfoJson));

        // 向后端推送存证信息
        let postWorkInfoPromises = uploadTxs.map((tx, index) => {
            delete uploadMemosArr[index].workInfoHash;
            let uploadInfo = Object.assign(uploadMemosArr[index], workInfoArr[index]);
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
            return fetch.postData('http://127.0.0.1:8080/uploadInfo', uploadInfo);
        });
        await Promise.all(postWorkInfoPromises);

        // 获取交易中的通证信息
        let tokenInfoPromises = tokenTxs.map(tx => erc721.requestTokenInfo(r, tx.TokenID, false));
        let tokenInfoResArr = await Promise.all(tokenInfoPromises);
        let tokenInfoArr = tokenInfoResArr.map(res => localUtils.memos2obj(res.TokenInfo.Memos));

        // 从IPFS上获取确权信息
        let authInfoGetPromises = tokenInfoArr.map(tokenInfo => ipfsUtils.get(ipfs, tokenInfo.authInfoHash));
        let authInfoJsonArr = await Promise.all(authInfoGetPromises);
        let authInfoArr = authInfoJsonArr.map(authInfoJson => JSON.parse(authInfoJson.toString()));

        // 向后端推送确权信息
        let postAuthInfoPromises = authInfoArr.map((authInfo, index) => {

            // 若未推送过某个通证对应作品的确权信息，则推送并记录
            if(!tokenTx[tokenInfoArr[index].workId]) {
                let authTxInfo = {...authInfo};
                authTxInfo.workId = tokenInfoArr[index].workId;
                authTxInfo.authId = tokenInfoArr[index].authId;
                authTxInfo.authTime = tokenTxs[index].date + 946684800;
                authTxInfo.certHash = tokenInfoArr[index].certHash;
                tokenTx[tokenInfoArr[index].workId] = 1;
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
                return fetch.postData('http://127.0.0.1:8080/authInfo', authTxInfo);
            }

            // 若已收到同一作品的17个通证，则删除记录
            else if(tokenTx[tokenInfoArr[index].workId] == 16) {
                console.log('on 17 token.');
                delete tokenTx[tokenInfoArr[index].workId];
            }

            // 若已推送过通证对应作品的确权信息，则不推送并记录
            else {
                console.log('on 2-16 token.');
                tokenTx[tokenInfoArr[index].workId]++;
            }

        });
        await Promise.all(postAuthInfoPromises);

        // 向后端推送通证信息
        let postTokenInfoPromises = tokenInfoArr.map((tokenInfo, index) => {
            delete tokenInfo.authInfoHash;
            delete tokenInfo.authId;
            delete tokenInfo.certHash;
            tokenInfo.tokenId = tokenTxs[index].TokenID;
            tokenInfo.addr = tokenInfoResArr[index].TokenInfo.TokenOwner;
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
            return fetch.postData('http://127.0.0.1:8080/tokenInfo', tokenInfo);
        });
        await Promise.all(postTokenInfoPromises);

        console.log('--------------------');

    });

})