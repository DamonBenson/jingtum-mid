import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/config/jingtum.js';

const Remote = jlib.Remote;

{
    let chain = chains[1];// 通证链
    let rootAddr = chain.account.root.address;
    let rootSecr = chain.account.root.secret;

    let r = new Remote({server: chain.server[2], local_sign: true});
    r.connect(async function(err, result) {

        /*---------链接状态----------*/
    
        if(err) {
            return console.log('err: ', err);
        }
        else if(result) {
            console.log('connect: ', result);
        }

        let accountInfo = await requestInfo.requestAccountInfo(rootAddr, r, true);
        let seq = accountInfo.account_data.Sequence;

        /*----------生成账号----------*/

        let activatePromises = new Array(addAmount);
        for(let j = addLoopCounter; j >= 0; j--) {
            let a = walletArr[j].address;
            activatePromises[j] = tx.buildPaymentTx(r, rootAddr, rootSecr, seq++, a, 100000000, 'setup', true); // 转账激活账号
        }
        await Promise.all(activatePromises);

        r.disconnect();
    
    });

}