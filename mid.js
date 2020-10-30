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

        //对应关系存入数据库
        for(let i = txs.length - 1; i >= 0; i--) {
            let tx = txs[i];
            if(tx.TransactionType == 'Payment') {
                let memoStr = localUtils.ascii2str(tx.Memos[0].Memo.MemoData);
                let flag = memoStr.slice(0,1);
                if(flag == 0) {
                    let addr = tx.Destination;
                    let workId = memos.workId;
                    let workTxHash = tx.hash;
                    // 连接数据库，存入addr、id、hash
                }
            }
        }

        //从数据库中取出作品，发送确权请求给版权局
        let authTxHashs = [];
        let authReqPromises = authTxHashs.map(authTxHash => {
            return postData('/authReq', authTxHash);
        });
        await Promise.all(authReqPromises);

    });

})