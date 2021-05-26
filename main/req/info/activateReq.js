import * as httpUtils from '../../../utils/httpUtils.js';

import {debugMode} from '../../../utils/info.js';

const addAmount = 1;
if(debugMode) {
    console.log('addAmount:', addAmount);
}

let resInfo = await httpUtils.post('http://127.0.0.1:9001/info/activateAccount', {amount: addAmount});
if(debugMode) {
    console.log('account added:', resInfo.data.accounts);
}