import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as erc721 from '../utils/jingtum/erc721.js';
import {userAccount, chains, tokenName} from '../utils/config/jingtum.js';

const tokenChain = chains[1];
const issuerAddr = tokenChain.account.issuer.address;

const token = tokenName.copyright;
// const addr = userAccount.fakeBaiduAuthorizeAccount.address; //百度智能授权系统
const addr = 'jLHYmgoFht8ZdhN5VJvLnfvZzgcExxPLhH'; //百度智能授权系统
const flagAddrs = userAccount.superviseAccount.map(acc => acc.address);
const tokenInfosAddrs = userAccount.authenticateAccount.map(acc => acc.address);

// const token = tokenName.approve;
// const addr = userAccount.buptAuthorizeAccount.address; //中间层智能授权系统
// const flagAddrs = userAccount.superviseAccount.map(acc => acc.address);

const Remote = jlib.Remote;
const r = new Remote({server: tokenChain.server[0], local_sign: true});

r.connect(async function(err, result) {

    /*---------链接状态----------*/

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    /*----------发币账号设置银关账号发行权限----------*/

    let accountInfo = await requestInfo.requestAccountInfo(issuerAddr, r, true);
    let seq = accountInfo.account_data.Sequence;

    await erc721.buildTokenIssueTx(r, addr, seq++, token, 100000000, 0, flagAddrs, tokenInfosAddrs, 0, true);
    // await erc721.buildTokenIssueTx(r, addr, seq++, token, 100000000, 0, flagAddrs, [], 1, true);
    
    r.disconnect();

});