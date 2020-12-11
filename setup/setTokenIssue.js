import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as erc721 from '../utils/jingtum/erc721.js';
import {Account, Server} from '../utils/info.js';

const ai = Account.issuerAccount;
const si = Account.issuerSecret;
const ag = Account.gateAccount;

const tokenName = 'test1';

const Remote = jlib.Remote;
const r = new Remote({server: Server.s2, local_sign: true});

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

    await erc721.buildTokenIssueReq(r, seq, tokenName, 100000, true);

    r.disconnect();

});