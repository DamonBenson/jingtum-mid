import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as erc721 from '../utils/jingtum/erc721.js';
import * as tokenLayer from '../utils/jingtum/tokenLayer.js';
import {userAccount, chains, tokenName} from '../utils/config/jingtum.js';

const tokenChain = chains[1];
const issuerAddr = tokenChain.account.issuer.address;

const token = tokenName.copyright;
const addr = userAccount.fakeBaiduAuthorizeAccount.address; //百度智能授权系统
// const addr = userAccount.baiduAuthorizeAccount.address; //百度智能授权系统
const authAddrs = userAccount.authenticateAccount.map(acc => acc.address);
const monitorAddrs = userAccount.superviseAccount.map(acc => acc.address);

const Remote = jlib.Remote;
const r = new Remote({server: tokenChain.server[2], local_sign: true});

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

    await tokenLayer.buildTokenIssueTx(r, addr, seq++, token, 100000000, 0, authAddrs, monitorAddrs, 1, true);
    
    r.disconnect();

});