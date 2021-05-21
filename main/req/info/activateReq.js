import * as fetch from '../../../utils/fetch.js';

import {debugMode} from '../../../utils/info.js';

const addAmount = 1;
if(debugMode) {
    console.log('addAmount:', addAmount);
}

let res = await fetch.postData('http://127.0.0.1:9001/info/activateAccount', {amount: addAmount});
if(debugMode) {
    let resInfo = JSON.parse(Buffer.from(res.body._readableState.buffer.head.data).toString());
    console.log('account added:', resInfo.data.accounts);
}