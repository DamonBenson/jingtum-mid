import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';
import http from 'http';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
import * as erc721 from './utils/jingtum/erc721.js';
import * as router from './utils/router.js';

import {Account, Server, authMemo} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});

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

    http.createServer(function(request, response) {
        console.log(r);
        router.register(seq++, request, response, [
            {
                'url': '/authReq',
                'handler': handleAuth
            }
        ]);
    })
    .listen(9000);
    
});

function handleAuth(seq, request, response) {

    request.on('data', async function(chunk) {

        //解析请求数据
        let workInfo = JSON.parse(chunk.toString());

        //设置通证信息
        let workId = workInfo.workId;
        let authId = 'DCI' + localUtils.formatStr(seq, 10);
        let state = 2;
        let approveArr = [];

        //确权信息存入IPFS，获取hash标识
        let memos = authMemo[seq % 4];
        let certBuf = memos.cert;
        let certHash = await ipfsUtils.add(ipfs, certBuf);
        delete memos.cert;
        let authInfo = memos;
        let authInfoBuf = Buffer.from(JSON.stringify(authInfo));
        let authInfoHash = await ipfsUtils.add(ipfs, authInfoBuf);

        let tokenInfo = {
            workId: workId,
            authId: authId,
            state: state,
            approveArr: approveArr,
            authInfoHash: authInfoHash,
            certHash: certHash
        }

        for(let i = 0; i < 1; i++) {
            console.log(r);
            let tokenId = sha256(authId + i).toString();
            tokenInfo.right = i;
            console.log(tokenInfo);
            // await erc721.buildTransferTokenTx(sg, r, seq, ag, a3, 'test2', tokenId, tokenInfo, true);
            await erc721.buildTransferTokenTx(sg, r, seq, ag, a3, 'test2', sha256(1).toString(), {a: 'a'}, true);
            // await localUtils.sleep(1000);
            console.log('erc721');
        }

        //存入数据库{存证ID，确权ID，存证交易哈希，确权交易哈希}
    });

}