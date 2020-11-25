import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';
import http from 'http';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as erc721 from './utils/jingtum/erc721.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
import * as router from './utils/router.js';

import {Account, Server, authMemo, tokenName} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});

/*----------版权人账号(帐号3)----------*/

const a3 = Account.a3Account;

/*----------版权局账号(银关账号)----------*/

const ag = Account.gateAccount;
const sg = Account.gateSecret;

/*----------创建链接(server4)----------*/

const Remote = jlib.Remote;
const r = new Remote({server: Server.s4, local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    // 获取序列号
    let accountInfo = await requestInfo.requestAccountInfo(ag, r, false);
    global.seq = accountInfo.account_data.Sequence;
    global.dciFlag = seq;

    // 启动服务器
    http.createServer(function(request, response) {
        router.register(request, response, [
            {
                'url': '/authReq',
                'handler': handleAuth
            }
        ]);
    })
    .listen(9000);
    
});

/*----------处理mid确权请求----------*/

function handleAuth(request, response) {

    // 处理数据
    request.on('data', async function(chunk) {

        // 解析请求数据
        let workInfo = JSON.parse(chunk.toString());

        // 设置通证信息
        let workId = workInfo.workId;
        let authId = 'DCI' + localUtils.formatStr(dciFlag++, 10);
        let state = 2;
        let approveArr = [];

        // 确权信息存入IPFS，获取hash标识
        let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]);
        let memos = {... authMemo[randFlag]};
        let certBuf = memos.cert;
        let certHash = await ipfsUtils.add(ipfs, certBuf);
        delete memos.cert;
        let authInfo = memos;
        console.log('authInfo:', authInfo);
        /* authInfo: {
            authCode: 'a1',
            authName: '上海版权局',
            certNum: 'c1'
        } */
        let authInfoBuf = Buffer.from(JSON.stringify(authInfo));
        let authInfoHash = await ipfsUtils.add(ipfs, authInfoBuf);

        // 发行通证
        let tokenInfo = {
            workId: workId,
            authId: authId,
            state: state,
            approveArr: approveArr,
            authInfoHash: authInfoHash,
            certHash: certHash
        };
        let rightArr = new Array(17).fill('').map((value, index) => index);
        let tokenTransferPromises = rightArr.map(right => {
            let tokenId = sha256(authId + right).toString();
            tokenInfo.right = right;
            let tokenMemos = localUtils.obj2memos(tokenInfo);
            console.log('issue token:', tokenInfo);
            /* issue token: {
                workId: 'f5cdb7f6f3750758b500bd0aa6049da7055dce74c1eb14a3cda5f0f4df260df4',
                authId: 'DCI0000001657',
                state: 2,
                approveArr: [],
                authInfoHash: 'QmZUMssaWe2HMjoa22FvRuQtoq4MXUkq5tYv7khoemcfqP',
                certHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
                right: 0
            } */
            // console.log('issue token:', workInfo.workName + '_' + right);
            return erc721.buildTransferTokenTx(sg, r, seq++, ag, a3, tokenName, tokenId, tokenMemos, false);
        });
        await Promise.all(tokenTransferPromises);
        console.log('issue ok:', authId);

        // 返回确权ID给mid
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(authId);

        console.log('--------------------');

    });

}