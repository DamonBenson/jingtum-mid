import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as erc721 from './utils/jingtum/erc721.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
import {postData} from './utils/fetch.js';

import {Server} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});

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

        /*----------筛选交易----------*/

        for(let i = txs.length - 1; i >= 0; i--) {
            let tx = txs[i];
            // 存证交易
            if(tx.TransactionType == 'Payment') {
                let memoStr = localUtils.ascii2str(tx.Memos[0].Memo.MemoData);
                let flag = memoStr.slice(0,1);
                if(flag == 0) {
                    let memos = JSON.parse(memoStr.slice(2));
                    let uploadTime = tx.date + 946684800;
                    let addr = tx.Destination;
                    let workInfoHash = memos.workInfoHash;
                    delete memos.workHash;
                    delete memos.workInfoHash;
                    let workInfoJson = await ipfsUtils.get(ipfs, workInfoHash);
                    let workInfo = JSON.parse(workInfoJson.toString());
                    let uploadInfo = Object.assign(memos, workInfo);
                    uploadInfo.uploadTime = uploadTime;
                    uploadInfo.addr = addr;
                    // console.log('on upload', uploadInfo);
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
                    console.log('on upload', uploadInfo.workName);
                    // await postData('http:127.0.0.1:8080/uploadInfo', uploadInfo);
                }
            }
            // 通证发行交易
            else if(tx.TransactionType == 'TransferToken') {
                // 获取通证信息
                let tokenId = tx.TokenID;
                let authTime = tx.date + 946684800;
                let tokenRes = await erc721.requestTokenInfo(r, tokenId, false);
                let tokenInfo = localUtils.memos2obj(tokenRes.TokenInfo.Memos);
                // 解析数据
                let authInfoHash = tokenInfo.authInfoHash;
                delete tokenInfo.authInfoHash;
                let authInfoJson = await ipfsUtils.get(ipfs, authInfoHash);
                let authInfo = JSON.parse(authInfoJson.toString());
                // 若未向后端发送过该作品的确权信息，则推送确权信息
                if(!tokenTx[tokenInfo.workId]) {
                    let authTxInfo = {...authInfo};
                    authTxInfo.workId = tokenInfo.workId;
                    authTxInfo.authId = tokenInfo.authId;
                    authTxInfo.authTime = authTime;
                    authTxInfo.certHash = tokenInfo.certHash;
                    // console.log('on auth:', authTxInfo);
                    /* on auth: {
                        authCode: 'a1',
                        authName: '上海版权局',
                        certNum: 'c1',
                        workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
                        authId: 'DCI0000001657',
                        authTime: 1604924010,
                        certHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3'
                    } */
                    console.log('on auth:', authTxInfo.authId);
                    // await postData('http:127.0.0.1:8080/authInfo', authTxInfo);
                    tokenTx[tokenInfo.workId] = 1;
                }
                else if(tokenTx[tokenInfo.workId] == 16) {
                    delete tokenTx[tokenInfo.workId];
                }
                else {
                    tokenTx[tokenInfo.workId]++;
                }
                delete tokenInfo.authId;
                delete tokenInfo.certHash;
                tokenInfo.tokenId = tokenId;
                tokenInfo.addr = tokenRes.TokenInfo.TokenOwner;
                // console.log('on token:', tokenInfo);
                /* on token: {
                    workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',     
                    state: 2,
                    right: 5,
                    approveArr: '',
                    tokenId: '51DFC1AA1594989DB27A1CFF1E180FEF355689341EDA11539810FFEBDE974781',    
                    addr: 'jdNdAv5chV3iN44SrxzSbyxBTuSXJXEKq'
                } */
                console.log('on token:', tokenInfo.workId + '_' + tokenInfo.right);
                // await postData('http:127.0.0.1:8080/tokenInfo', tokenInfo);
            }
        }

        console.log('--------------------');

    });

})