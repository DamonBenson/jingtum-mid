;import jlib from 'jingtum-lib';
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
const uploadRemote = new Remote({server: uploadChain.server[2], local_sign: true});
const tokenRemote = new Remote({server: tokenChain.server[2], local_sign: true});
// workId                      2B888AEF7ACE902E4E07CF0003A425947CA3D172725A251AF2054AFA2D3C56A9
// 发布通证的 TxHash            E6092D1F30A12553CA3B12C11F525B6DC8621BB6CD25385AF652501E1B9E3349
// 发布通证的 CopyrightId       9A3EB0597A1154C15CCC018C9FA24328E2C7FB5EC6D7DEBAF2AA54AC19A5B253
// 查询通证信息
let copyrightId = "FF2DB59E9BCE6733A5EA15196E8DCD71CFBFC358C4EE7B911D9E239895097C74"

// 连接到通证链
tokenRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    
    let txInfo = await tokenLayer.requestCopyrightTokenInfoLayer(tokenRemote, copyrightId);
    // let processedTx = u.processTx(txInfo, userAccount.fakeBaiduAuthorizeAccount.address);
    // console.log(JSON.parse(processedTx.memos[0].MemoData));
    console.log("txInfo:", txInfo)
});