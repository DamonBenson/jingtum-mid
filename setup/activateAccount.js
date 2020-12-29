import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/info.js';

const Remote = jlib.Remote;

for(let i = chains.length - 1; i >= 0; i--) {

    let chain = chains[i];
    let ar = chain.account.root.address;
    let sr = chain.account.root.secret;
    let ac = chain.account.charge.address;
    let ai = chain.account.issuer.address;
    let ag = chain.account.gate.address;

    let r = new Remote({server: chain.server[0], local_sign: true});
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
    
        await tx.buildPaymentTx(ar, sr, r, seq++, ac, 100000000, 'setup', true);
        await tx.buildPaymentTx(ar, sr, r, seq++, ai, 100000000, 'setup', true);
        await tx.buildPaymentTx(ar, sr, r, seq++, ag, 100000000, 'setup', true);
    
        r.disconnect();
    
    });

}