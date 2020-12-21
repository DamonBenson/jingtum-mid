import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';
import http from 'http';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as localUtils from '../../utils/localUtils.js';
import * as router from '../../utils/router.js';

import {chains, authMemo, tokenName, ipfsConf, debugMode} from '../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const tokenChain = chains[1];

/*----------版权局账号(确权链银关账号)----------*/

const ag = tokenChain.account.gate.address;

/*----------创建链接(确权链服务器0)----------*/

const Remote = jlib.Remote;
const r = new Remote({server: tokenChain.server[0], local_sign: true});

r.connect(async function(err, result) {

    // 确权链连接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    // 获取版权局账号序列号
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

        // 开始计时
        console.log('authReq processing...');
        let sTs = (new Date()).valueOf();

        // 解析请求数据
        let workInfo = JSON.parse(chunk.toString());
        let addr = workInfo.addr;

        // 设置通证信息
        let workId = workInfo.work_id;
        let authId = 'DCI' + localUtils.formatStr(dciFlag++, 10); // authId为DCI码
        let state = 2;
        let approveArr = [];

        // 确权信息存入ipfs，获取hash标识
        let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 随机选择确权信息
        let memos = {... authMemo[randFlag]};
        let certBuf = memos.cert;
        let certHash = await ipfsUtils.add(ipfs, certBuf);
        delete memos.cert;
        let authInfo = memos;
        if(debugMode) {
            console.log('authInfo:', authInfo);
        }
        /* authInfo: {
            authCode: 'a1',
            authName: '上海版权局',
            certNum: 'c1'
        } */
        let authInfoBuf = Buffer.from(JSON.stringify(authInfo));
        let authInfoHash = await ipfsUtils.add(ipfs, authInfoBuf);

        // 发行通证，根据确权信息生成对应的17个通证
        let tokenInfo = {
            workId: workId,
            authId: authId,
            state: state,
            approveArr: approveArr,
            authInfoHash: authInfoHash,
            certHash: certHash
        };
        let tokenIssuePromises = [];
        let tokenAuthPromises = [];
        for(let i = 0; i < 17; i++) {
            let rightType = i;
            let tokenId = sha256(authId + rightType).toString(); // tokenId暂定为hash（DCI码+0~16）
            tokenInfo.rightType = rightType;
            let tokenMemos = localUtils.obj2memos(tokenInfo);
            if(debugMode) {
                console.log('issue token:', tokenInfo);
            }
            else {
                console.log('issue token:', workInfo.work_name + '_' + rightType);
            }
            /* issue token: {
                workId: '7EEC480EEA01B81365B24362318698E1FA372F902E9B77531202E4E8A3852A12',        
                authId: 'DCI0000003538',
                state: 2,
                approveArr: [],
                authInfoHash: 'QmZUMssaWe2HMjoa22FvRuQtoq4MXUkq5tYv7khoemcfqP',
                certHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
                rightType: 8
            } */
            tokenIssuePromises.push(erc721.buildIssueTokenTx(r, seq++, tokenName, tokenId, tokenMemos, true)); //银关填写通证memos
            tokenAuthPromises.push(erc721.buildAuthTokenTx(r, seq++, addr, tokenName, tokenId, true)); //银关将通证转让给用户（目前井通sdk发行通证需要这两步，导致确权开销较大）
        }
        await Promise.all(tokenIssuePromises);
        await Promise.all(tokenAuthPromises);

        console.log('issue ok:', authId);

        // 返回确权id给authMid.js（但暂时没有用处）
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(authId);

        // 结束计时
        let eTs = (new Date()).valueOf();
        console.log('----------' + (eTs - sTs) + 'ms----------');

    });

}