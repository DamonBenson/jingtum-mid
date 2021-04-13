import { Wallet } from 'jingtum-lib';

import * as fetch from '../../../utils/fetch.js';

const addAmount = 3;

let walletArr = new Array();
let addressArr = new Array();
for(let i = 0; i < addAmount; i++) {
    let w = Wallet.generate();
    walletArr.push(w);
    addressArr.push(w.address);
}
console.log('generate wallets:', walletArr);
fetch.postData('http://127.0.0.1:9001/info/activateAccount', addressArr);