import jlib from 'jingtum-lib';

import RequestInfo from '../utils/requestInfo.js';
import Tx from '../utils/tx.js';
import {Account, Server} from '../utils/info.js';

const requestInfo = new RequestInfo();
const tx = new Tx();

const ar = Account.rootAccount;
const sr = Account.rootSecret;
const ac= Account.chargeAccount;
const ai = Account.issuerAccount;
const ag = Account.gateAccount;

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

    /*----------转账激活账号----------*/

    let accountInfo = await requestInfo.requestAccountInfo(ar, r, true);
    let seq = accountInfo.account_data.Sequence;

    await tx.buildPaymentTx(ar, sr, r, seq, ac, 100000000, 'setup', true);
    seq+=2;
    await tx.buildPaymentTx(ar, sr, r, seq, ai, 100000000, 'setup', true);
    seq+=2;
    await tx.buildPaymentTx(ar, sr, r, seq, ag, 100000000, 'setup', true);
    seq+=2;

    r.disconnect();

});