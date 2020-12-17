import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/info.js';

const addAmount = 3;

const Remote = jlib.Remote;

for(let i = chains.length - 1; i >= 0; i--) {

    let chain = chains[i];
    let ar = chain.account.root.address;
    let sr = chain.account.root.secret;

    let r = new Remote({server: chain.server[0], local_sign: true});
    r.connect(async function(err, result) {

        /*---------链接状态----------*/
    
        if(err) {
            return console.log('err: ', err);
        }
        else if(result) {
            console.log('connect: ', result);
        }
    
        /*----------生成账号----------*/

        let accountInfo = await requestInfo.requestAccountInfo(ar, r, true);
        let seq = accountInfo.account_data.Sequence;

        let Wallet = jlib.Wallet;

        let activatePromises = new Array(addAmount);
        for(let j = addAmount - 1; j >= 0; j--) {
            let w = Wallet.generate();
            console.log('chain' + i + ' account:', w);
            activatePromises[j] = tx.buildPaymentTx(ar, sr, r, seq++, w.address, 100000000, 'setup', true);
        }
        await Promise.all(activatePromises);

        r.disconnect();
    
    });

}