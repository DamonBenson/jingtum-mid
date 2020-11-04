import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';
import {Account, Server} from '../utils/info.js';

const a1 = Account.rootAccount;
const s1 = Account.rootSecret;

const addAmount = 1;

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

    /*----------生成账号----------*/

    let Wallet = jlib.Wallet;
    let walletArr = [];
    for(let i = 0; i < addAmount; i++) {
        let w = Wallet.generate();
        console.log(w);
        walletArr.push(w);
    }

    /*----------转账激活账号----------*/

    let accountInfo = await requestInfo.requestAccountInfo(a1, r, true);
    let seq = accountInfo.account_data.Sequence;

    let activatePromises = walletArr.map(w => {
        let promise = tx.buildPaymentTx(a1, s1, r, seq, w.address, 100000000, 'setup', true);
        seq += 2;
        return promise;
    })
    await Promise.all(activatePromises);

    r.disconnect();

});