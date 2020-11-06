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
                    console.log('on upload', uploadInfo.workName);
                    // await postData('http:127.0.0.1:8080/uploadInfo', uploadInfo);
                }
            }
            // 通证发行交易
            else if(tx.TransactionType == 'TransferToken') {
                let tokenId = tx.TokenID;
                let tokenRes = await erc721.requestTokenInfo(r, tokenId, false);
                let tokenInfo = localUtils.memos2obj(tokenRes.TokenInfo.Memos);
                tokenInfo.tokenId = tokenId;
                tokenInfo.addr = tokenRes.TokenInfo.TokenOwner;
                let authInfoHash = tokenInfo.authInfoHash;
                delete tokenInfo.authInfoHash;
                let authInfoJson = await ipfsUtils.get(ipfs, authInfoHash);
                let authInfo = JSON.parse(authInfoJson.toString());
                Object.assign(tokenInfo, authInfo);
                console.log('on token:', tokenInfo.authId + '_' + tokenInfo.right);
                // await postData('http:127.0.0.1:8080/tokenInfo', tokenInfo);
            }
        }

        console.log('--------------------');

    });

})