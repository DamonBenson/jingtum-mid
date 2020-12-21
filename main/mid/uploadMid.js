import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as tx from '../../utils/jingtum/tx.js'
import * as ipfsUtils from '../../utils/ipfsUtils.js';

import {chains, userMemo, ipfsConf, debugMode} from '../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const uploadChain = chains[0]; // 存证链

/*----------中间层账号(存证链账号0)----------*/

const a0 = uploadChain.account.a[0].address;
const s0 = uploadChain.account.a[0].secret;

/*----------创建链接(存证链服务器0)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: uploadChain.server[0], local_sign: true});

r.connect(async function(err, result) {

    // 存证链连接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

    // 获取中间层账号序列号
    let accountInfo = await requestInfo.requestAccountInfo(a0, r, false);
    let seq = accountInfo.account_data.Sequence;

    // 处理上传请求
    process.stdin.on('data', async function(chunk) {

        // 开始计时
        console.log('uploadReq processing...');
        let sTs = (new Date()).valueOf();

        // 解析请求数据
        let addr = JSON.parse(chunk.toString()).addr;
        let memos = JSON.parse(chunk.toString()).uploadInfo;
        memos.work = userMemo[0].work;

        // 作品存入ipfs，获取哈希标识
        let workHash = await ipfsUtils.add(ipfs, memos.work);

        // 作品信息存入ipfs，获取哈希标识
        delete memos.work;
        let workInfo = Buffer.from(JSON.stringify(memos));
        if(debugMode) {
            console.log('workInfo:', memos);
        }
        /* workInfo: {
            workName: 'm1_',
            createdTime: 1579017600,
            publishedTime: 1579017600,
            workType: 0,
            workForm: 0,
            workField: 0
        } */
        let workInfoHash = await ipfsUtils.add(ipfs, workInfo);
        
        // 上传存证交易
        let uploadInfo = {
            workHash: workHash,
            workInfoHash: workInfoHash
        };
        let uploadMemos = "0_" + JSON.stringify(uploadInfo); // 以memos字段的前两位是“0_”来标识存证交易
        if(debugMode) {
            console.log('upload:', uploadInfo);
        }
        else {
            console.log('upload:', memos.workName);
        }
        /* upload: {
            workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
            workInfoHash: 'QmPaUkFKrUzmcGUDP5k8zyD5XCohQkXfo8v4qRdDDHk5Bu'
        } */
        await tx.buildPaymentTx(a0, s0, r, seq++, addr, 0.000001, uploadMemos, true);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

});