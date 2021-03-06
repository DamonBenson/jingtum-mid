import jlib, { Wallet } from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/config/jingtum.js';

const addAmount = 10;
const addLoopCounter = addAmount - 1;

const Remote = jlib.Remote;

let walletArr = new Array(addAmount);
for(let i = addLoopCounter; i >= 0; i--) {
    walletArr[i] = Wallet.generate()
}
console.log('generate wallets:', walletArr);

/*----------账号信息存入数据库----------*/

// let postAccountInfoPromises = new Array(addAmount);
// for(let j = addLoopCounter; j >= 0; j--) {
//     let accountInfo = {
//         user_id: 'null',
//         addr: walletArr[j].address,
//         secret: walletArr[j].secret,
//     };
//     let sql = sqlText.table('account_info').data(accountInfo).insert();
//     postAccountInfoPromises[j] = mysqlUtils.sql(c, sql);
// }
// await Promise.all(postAccountInfoPromises);

for(let i = chains.length - 1; i >= 0; i--) {

    let chain = chains[i];
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