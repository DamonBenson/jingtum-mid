import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as erc721 from '../utils/jingtum/erc721.js';
import {chains} from '../utils/info.js';

const tokenChain = chains[0];
const ai = tokenChain.account.issuer.address;

const tokenName = 'approveToken';
// const addr = tokenChain.account.a[0].address; //智能预警系统发币账号
const addr = tokenChain.account.a[1].address; //智能授权系统发币账号

const Remote = jlib.Remote;
const r = new Remote({server: tokenChain.server[0], local_sign: true});

r.connect(async function(err, result) {

    /*---------链接状态----------*/

    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('connect: ', result);
    }

    /*----------发币账号设置银关账号发行权限----------*/

    let accountInfo = await requestInfo.requestAccountInfo(ai, r, true);
    let seq = accountInfo.account_data.Sequence;

    await erc721.buildTokenIssueReq(r, addr, seq++, tokenName, 10000000, true);

    r.disconnect();

});