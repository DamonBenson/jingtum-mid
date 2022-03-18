/**
 * @file: ModifyIssueInfo.js
 * @Description: 测试ChainWatch功能（chain0，chain1 存证链、通证链）
 * @author Bernard
 * @date 2022/2/21
 */
import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as tx from '../../../utils/jingtum/tx.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as tokenLayer from '../../../utils/jingtum/tokenLayer.js';
import * as localUtils from '../../../utils/localUtils.js';
import {userAccount, chains, tokenName} from '../../../utils/config/jingtum.js';
const u = jlib.utils;
const uploadChain = chains[0];
const tokenChain = chains[1];

const fakeBaiduAuthorizeAddr = userAccount.fakeBaiduAuthorizeAccount.address;
const fakeBaiduAuthorizeSecr = userAccount.fakeBaiduAuthorizeAccount.secret;


const Remote = jlib.Remote;
const tokenRemote = new Remote({server: tokenChain.server[2], local_sign: true});
// 作品存证的 workId            2B888AEF7ACE902E4E07CF0003A425947CA3D172725A251AF2054AFA2D3C56A9
// 发布通证的 TxHash            E6092D1F30A12553CA3B12C11F525B6DC8621BB6CD25385AF652501E1B9E3349
// 发布通证的 CopyrightId       9A3EB0597A1154C15CCC018C9FA24328E2C7FB5EC6D7DEBAF2AA54AC19A5B253



// 连接到通证链
tokenRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    let authenticateAccount = userAccount.authenticateAccount;//版权通证确权的确权账号
    const addr = authenticateAccount[0].address;
    let publisherSecr = fakeBaiduAuthorizeSecr;
    let publisher = fakeBaiduAuthorizeAddr;

    let rootAddr = chains[1].account.root.address;
    let rootSecr = chains[1].account.root.secret;
    // 激活账号
    // let accountInfo = await requestInfo.requestAccountInfo(rootAddr, tokenRemote, true);
    // let seq = accountInfo.account_data.Sequence;
    // await tx.buildPaymentTx(tokenRemote, rootAddr, rootSecr, seq++, addr, 100000000, 'setup', true);

    // 修改发行信息
    let roles = [
		{role: addr, type: 1}
    ];

    let txInfo = await tokenLayer.buildIssueInfoModifyTxLayer(tokenRemote, publisher,  tokenName.copyright, 0, roles, true);
    console.log("txInfo:", txInfo);
    console.log("txHash:", txInfo.tx_json.hash);
    //txHash 5E8C42532143010A177E74A02D6330F327BE1219BA77BF9F831A679CB688257A
});