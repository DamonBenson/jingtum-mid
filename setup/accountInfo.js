import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/config/jingtum.js';

const Remote = jlib.Remote;

for(let i = chains.length - 1; i >= 0; i--) {

    let chain = chains[i];
    let rootAddr = chain.account.root.address;
    let chargeAddr = chain.account.charge.address;
    let issuerAddr = chain.account.issuer.address;

    let r = new Remote({server: chain.server[0], local_sign: true});
    r.connect(async function(err, result) {

        /*---------链接状态----------*/
    
        if(err) {
            return console.log('connect err: ', err);
        }
        else if(result) {
            console.log('connect: ', result);
        }
    
        /*----------转账激活账号----------*/
    
        console.log('root-' + i + ':', await requestInfo.requestAccountInfo(rootAddr, r, false));
        console.log('charge-' + i + ':', await requestInfo.requestAccountInfo(chargeAddr, r, false));
        console.log('issuer-' + i + ':', await requestInfo.requestAccountInfo(issuerAddr, r, false));
    
        r.disconnect();
    
    });

}