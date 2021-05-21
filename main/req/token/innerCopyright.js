import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {mysqlConf, debugMode} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const queryAmount = 1;

let copyrightSql = sqlText.table('right_token_info').field('copyright_id').order('RAND()').limit(queryAmount).select();
let copyrightInfoArr = await mysqlUtils.sql(c, copyrightSql);
let copyrightIds = copyrightInfoArr.map(copyrightInfo => {
    return copyrightInfo.copyright_id;
});
if(debugMode) {
    console.log('copyrightIds', copyrightIds);
}

let rightRes = await fetch.postData('http://127.0.0.1:9001/auth/innerCopyright', {copyrightIds: copyrightIds});
if(debugMode) {
    let rightResInfo = JSON.parse(Buffer.from(rightRes.body._readableState.buffer.head.data).toString());
    console.log('rightsInfo:', rightResInfo.data.authenticationInfoList);
}