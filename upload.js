import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import RequestInfo from './utils/requestInfo.js';
import Tx from './utils/tx.js'
import IPFSUtils from './utils/ipfsUtils.js';

import {Server, userMemo} from './utils/info.js';

const requestInfo = new RequestInfo(); //区块链信息获取工具类
const tx = new Tx();
const ipfsUtils = new IPFSUtils();

/*----------平台账号(账号1)----------*/

const a1 = 'jpkjvaSwg6Kp6vmRKY4kvsMMkrXKvmLuht';
const s1 = 'shTKB1cBr3aLiMAEj7qquPqQPLJfU';

/*----------版权人账号(帐号3)----------*/

const a3 = 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf';

/*----------创建链接(server4)----------*/

const Remote = jlib.Remote;
const r = new Remote({server: Server.s4, local_sign: true});

r.connect(async function(err, result) {

    /*---------链接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    /*----------获取序列号----------*/

    let accountInfo = await requestInfo.requestAccountInfo(a1, r, false);
    let seq = accountInfo.account_data.Sequence;

    /*----------上传存证交易----------*/
    
    let memos = userMemo.m1;
    memos.workName += seq;

    let workBuf = memos.work;
    let workHash = await ipfsUtils.add(workBuf);
    delete memos.work;
    let workInfo = memos;
    let workInfoBuf = Buffer.from(JSON.stringify(workInfo));
    let workInfoHash = await ipfsUtils.add(workInfoBuf);

    let workId = sha256(a3 + memos.workName).toString();
    let state = 1;

    let uploadInfo = {
        workHash: workHash,
        workInfoHash: workInfoHash,
        workId: workId,
        state: state
    }
    let uploadMemos = "0_" + JSON.stringify(uploadInfo);
    console.log(uploadMemos);

    await tx.buildPaymentTx(a1, s1, r, seq++, a3, 0.000001, uploadMemos, true);

    //存入数据库{存证ID，存证交易哈希}

    r.disconnect();

});