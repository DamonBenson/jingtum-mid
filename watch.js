import jlib from 'jingtum-lib';

import RequestInfo from './utils/requestInfo.js';
import IPFSUtils from './utils/ipfsUtils.js';
import LocalUtils from './utils/localUtils.js';
import ERC721 from './utils/erc721.js';
import {postData} from './utils/fetch.js';

import {Server} from './utils/info.js';

const requestInfo = new RequestInfo(); //区块链信息获取工具类
const ipfsUtils = new IPFSUtils();
const localUtils = new LocalUtils();
const erc721 = new ERC721();

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

    /*----------获取序列号----------*/

    r.on('ledger_closed', async function(msg) {

        console.log('on ledger_closed: ' + msg.ledger_index);

        //获取所有交易哈希
        let ledgerIndex = msg.ledger_index;
        let ledger = await requestInfo.requestLedger(r, ledgerIndex, true, false);
        let txHashs = ledger.transactions;

        //获取所有交易信息
        let txPromises = txHashs.map(txHash => {
            return requestInfo.requestTx(r, txHash, false);
        });
        let txs = await Promise.all(txPromises);

        //筛选存证、确权交易
        for(let i = txs.length - 1; i >= 0; i--) {
            let tx = txs[i];
            if(tx.TransactionType == 'Payment') {
                let memoStr = localUtils.ascii2str(tx.Memos[0].Memo.MemoData);
                let flag = memoStr.slice(0,1);
                if(flag == 0) {
                    let memos = JSON.parse(memoStr.slice(2));
                    let uploadTime = tx.date;
                    let addr = tx.Destination;
                    let workInfoHash = memos.workInfoHash;
                    delete memos.workHash;
                    delete memos.workInfoHash;
                    let workInfoJson = await ipfsUtils.get(workInfoHash);
                    console.log(workInfoJson);
                    let workInfo = JSON.parse(workInfoJson.toString());
                    let uploadInfo = Object.assign(memos, workInfo);
                    uploadInfo.uploadTime = uploadTime;
                    uploadInfo.addr = addr;
                    console.log(uploadInfo);
                    // await postData('/uploadInfo', uploadInfo);
                }
            }
            // else if(tx.TransactionType == 'TransferToken') {
            //     let tokenId = tx.TokenID;
            //     let tokenRes = await erc721.requestTokenInfo(r, tokenId, true);
            //     let tokenInfo = JSON.parse(localUtils.ascii2str(tokenRes.TokenInfo.Memos[0].Memo.MemoData));
            //     tokenInfo.tokenId = tokenId;
            //     tokenInfo.addr = tokenRes.TokenInfo.TokenOwner;
            //     let authInfoHash = memos.authInfoHash;
            //     delete memos.authInfoHash;
            //     delete memos.certHash;
            //     let authInfoJson = await ipfsUtils.get(authInfoHash);
            //     let authInfo = JSON.parse(authInfoJson.toString());
            //     Object.assign(tokenInfo, authInfo);
            //     console.log(tokenInfo);
            //     await postData('/tokenInfo', tokenInfo);
            // }
        }
    });

})