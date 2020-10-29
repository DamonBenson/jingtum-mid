import jlib from 'jingtum-lib';

import RequestInfo from '../utils/requestInfo.js';
import ERC721 from '../utils/erc721.js';
import {Account, Server} from '../utils/info.js';

const requestInfo = new RequestInfo();
const erc721 = new ERC721();

const ar = Account.rootAccount;
const sr = Account.rootSecret;
const ag = Account.gateAccount;

const tokenName = 'test2';

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

    /*----------总账号设置银关账号发行权限----------*/

    let accountInfo = await requestInfo.requestAccountInfo(ar, r, true);
    let seq = accountInfo.account_data.Sequence;

    await erc721.buildTokenIssueTx(ar, sr, r, seq, ag, tokenName, 10000, true); //总帐号才有权限设置代币发行，发币账号没有权限

    r.disconnect();

});