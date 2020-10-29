import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import RequestInfo from './utils/requestInfo.js';
import Tx from './utils/tx.js'
import IPFSUtils from './utils/ipfsUtils.js';
import LocalUtils from './utils/localUtils.js';
import ERC721 from './utils/erc721.js';

import {Account, Server, authMemo} from './utils/info.js';

const requestInfo = new RequestInfo(); //区块链信息获取工具类
const tx = new Tx();
const ipfsUtils = new IPFSUtils();
const localUtils = new LocalUtils();
const erc721 = new ERC721();

const defaultWorkId = '0eef8c70bc73ba83ba83a54129e8282320c627aa2c2d89be750620e7bf6f0383';

/*----------平台账号(账号2)----------*/

const a2 = 'jUyKb7VbKdSgnD5BxYjBi6G1FxSu4na98w';
const s2 = 'spo96hmfQQ5JWkStdL7xCeWoQBnzm';

/*----------版权人账号(帐号3)----------*/

const a3 = 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf';

/*----------版权局账号(银关账号)----------*/

const ag = Account.gateAccount;
const sg = Account.gateSecret;

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

    let accountInfo = await requestInfo.requestAccountInfo(ag, r, false);
    let seq = accountInfo.account_data.Sequence;

    /*----------发行通证----------*/

    let authId = 'dci' + localUtils.formatStr(seq, 10);
    let state = 2;
    let approveArr = [];
    let tokenInfo = {
        authId: authId,
        state: state,
        approveArr: approveArr
    }
    for(let i = 0; i < 1; i++) {
        let tokenId = sha256(authId + i).toString();
        tokenInfo.right = i;
        let tokenMemos = JSON.stringify(tokenInfo);
        console.log(tokenMemos);
        await erc721.buildTransferTokenTx(sg, r, seq++, ag, a3, 'test2', tokenId, tokenMemos, true);
    }

    let memos = authMemo.m1;
    let certBuf = memos.cert;
    let certHash = await ipfsUtils.add(certBuf);
    delete memos.cert;

    //版权局发送确权作品ID，确权证书哈希，确权信息给平台

    /*----------上传确权交易----------*/

    accountInfo = await requestInfo.requestAccountInfo(a2, r, false);
    seq = accountInfo.account_data.Sequence;

    let workId = defaultWorkId;
    let authInfo = memos;
    let authInfoBuf = Buffer.from(JSON.stringify(authInfo));
    let authInfoHash = await ipfsUtils.add(authInfoBuf);

    let passInfo = {
        authId: authId,
        workId: workId,
        authInfoHash: authInfoHash,
        certHash: certHash,
    }
    let passMemos = "1_" + JSON.stringify(passInfo);
    console.log(passMemos);

    await tx.buildPaymentTx(a2, s2, r, seq++, a3, 0.000001, passMemos, true);

    //存入数据库{存证ID，确权ID，存证交易哈希，确权交易哈希}

    r.disconnect();

});