import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {mysqlConf} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const queryMode = 'work';
const queryAmount = 3;

switch(queryMode) {

    case 'work':
        let workSql = sqlText.table('work_info').field('work_id').order('RAND()').limit(queryAmount).select();
        let workInfoArr = await mysqlUtils.sql(c, workSql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
        console.log('workIds:', workIds);
        let res = await fetch.postData('http://127.0.0.1:9001/info/work', workIds);
        let resInfo = JSON.parse(Buffer.from(res.body._readableState.buffer.head.data).toString());
        console.log('worksInfo:', resInfo.data.worksInfo);
        break;

    case 'copyright':
        let copyrightSql = sqlText.table('right_token_info').field('token_id').order('RAND()').limit(queryAmount).select();
        let rightTokenInfoArr = await mysqlUtils.sql(c, copyrightSql);
        let rightTokenIds = rightTokenInfoArr.map(rightTokenInfo => {
            return rightTokenInfo.token_id;
        });
        console.log(rightTokenIds);
        fetch.postData('http://127.0.0.1:9001/info/copyright', rightTokenIds);
        break;

    case 'approve':
        let approveSql = sqlText.table('appr_token_info').field('token_id').order('RAND()').limit(queryAmount).select();
        let approveTokenInfoArr = await mysqlUtils.sql(c, approveSql);
        let approveTokenIds = approveTokenInfoArr.map(approveTokenInfo => {
            return approveTokenInfo.token_id;
        });
        console.log(approveTokenIds);
        fetch.postData('http://127.0.0.1:9001/info/approve', approveTokenIds);
        break;

    default:
        console.log('wrong query mode.')
        break;

}