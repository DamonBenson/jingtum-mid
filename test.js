import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';
import http from 'http';

import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
import * as erc721 from './utils/jingtum/erc721.js';
import * as router from './utils/router.js';

import {Account, Server, authMemo} from './utils/info.js';

const ipfs = ipfsAPI({host: '127.0.0.1', port: '5001', protocol: 'http'});

const defaultWorkId = '0eef8c70bc73ba83ba83a54129e8282320c627aa2c2d89be750620e7bf6f0383';

/*----------平台账号(账号2)----------*/

const a2 = 'jUyKb7VbKdSgnD5BxYjBi6G1FxSu4na98w';
const s2 = 'spo96hmfQQ5JWkStdL7xCeWoQBnzm';

/*----------版权人账号(帐号3)----------*/

const a3 = 'jK41GkWTjWz8Gd8wvBWt4XrxzbCfFaG2tf';

/*----------版权局账号(银关账号)----------*/

const ag = Account.gateAccount;
const sg = Account.gateSecret;

/*----------创建链接(server4)----------*/

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

    let accountInfo = await requestInfo.requestAccountInfo(ag, r, false);
    let seq = accountInfo.account_data.Sequence;

    console.log(r);

    await erc721.buildTransferTokenTx(sg, r, seq, ag, a3, 'test3', sha256(11).toString(), {a: 'a'}, true);

})