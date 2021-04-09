import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';

import * as tx from '../../../utils/jingtum/tx.js'
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../../utils/ipfsUtils.js';
import * as localUtils from '../../../utils/localUtils.js';

import {pic, chains, rightTokenName, ipfsConf, debugMode} from '../../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const uploadChain = chains[0]; // 存证链

/*----------智能预警系统发币账号----------*/

const a0 = uploadChain.account.a[0].address;
const s0 = uploadChain.account.a[0].secret;

/*----------将作品信息存入存证链----------*/

export async function handleUpload(uploadRemote, seqObj, req, res) {

    // 开始计时
    console.time('handleUpload');

    // 解析请求数据
    let body = JSON.parse(Object.keys(req.body)[0]);
    let addr = body.addr;
    delete body.addr;

    // 获取作品内容，存入IPFS
    // let work = await getWorkByUrl();
    let work = pic;
    let workHash = await ipfsUtils.add(ipfs, work);

    // 作品信息存入ipfs，获取哈希标识
    let workInfo = Buffer.from(JSON.stringify(body));
    if(debugMode) {
        console.log('workInfo:', body);
    }
    /* workInfo: {
        workName: 'm1_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 0,
        workForm: 0,
        workField: 0
    } */
    // 元数据Hash
    let workInfoHash = await ipfsUtils.add(ipfs, workInfo);
    
    // 上传存证交易
    let uploadData = {
        workHash: workHash,
        workInfoHash: workInfoHash
    } 
    let uploadMemos = "0_" + JSON.stringify(uploadData); // 以memos字段的前两位是“0_”来标识存证交易
    if(debugMode) {
        console.log('upload:', uploadData);
    }
    else {
        console.log('upload:', body.workName);
    }
    /* upload: {
        workHash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
        workInfoHash: 'QmcmdhJ2zVCSc4yffgQXPzk6YcanX3wUvDeZzACjBCXX2Q'
    } */
    let paymentRes = await tx.buildPaymentTx(a0, s0, uploadRemote, seqObj.a0.token++, addr, 0.000001, uploadMemos, true);
    let hash = paymentRes.tx_json.hash;

    // 结束计时
    console.timeEnd('handleUpload');
    console.log('--------------------');

    return [addr, hash];

}

/*----------在交易链上生成通证----------*/

export async function handleRightTokenIssue(tokenRemote, seqObj, addr, workId, req, res) {

    // 开始计时
    console.time('handleRightTokenIssue');

    // 发行通证，根据确权信息生成对应的17个通证
    let tokenInfo = {
        workId: workId,
    };
    let tokenIssuePromises = [];
    let tokenAuthPromises = [];
    for(let i = 0; i < 17; i++) {
        let rightType = i;
        let tokenId = sha256(workId + rightType).toString(); // tokenId暂定为hash(workId+0~16)
        tokenInfo.rightType = rightType;
        let tokenMemos = localUtils.obj2memos(tokenInfo);
        if(debugMode) {
            console.log('issue token:', tokenInfo);
        }
        else {
            console.log('issue token:', workInfo.work_name + '_' + rightType);
        }
        /* issue token: {
            workId: '909B18A4FCFE8ACDA0C8F4AC5C45AF2BA86F2DE7761C73126B1EDBF0A18FEBA5',
            rightType: 6
        } */
        tokenIssuePromises.push(erc721.buildIssueTokenTx(s0, tokenRemote, seqObj.a0.token++, a0, addr, rightTokenName, tokenId, tokenMemos, true)); //银关填写通证memos
        // tokenAuthPromises.push(erc721.buildAuthTokenTx(s0, tokenRemote, seqObj.a0.token++, a0, addr, rightTokenName, tokenId, true)); //银关将通证转让给用户（目前井通sdk发行通证需要这两步，导致确权开销较大）
    }
    await Promise.all(tokenIssuePromises);
    await Promise.all(tokenAuthPromises);

    console.log('issue ok:', workId);

    // 结束计时
    console.timeEnd('handleRightTokenIssue');
    console.log('--------------------');

}