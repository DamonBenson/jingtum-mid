import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {mysqlConf, debugMode} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const queryMode = 'work';
const queryAmount = 2;

switch(queryMode) {

    case 'work':

        let workSql = sqlText.table('work_info').field('work_id').order('RAND()').limit(queryAmount).select();
        let workInfoArr = await mysqlUtils.sql(c, workSql);
        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
        if(debugMode) {
            console.log('workIds:', workIds);
        }
        
        let workRes = await fetch.getData('http://127.0.0.1:9001/info/work', {workIds: workIds});
        console.log(Buffer.from(workRes.body._readableState.buffer.head.data).toString());
        if(debugMode) {
            let workResInfo = JSON.parse(Buffer.from(workRes.body._readableState.buffer.head.data).toString());
            console.log('worksInfo:', workResInfo.data.certificateInfoList);
        }
        break;

    case 'copyright':

        let copyrightSql = sqlText.table('right_token_info').field('copyright_id').order('RAND()').limit(queryAmount).select();
        let rightTokenInfoArr = await mysqlUtils.sql(c, copyrightSql);
        let rightTokenIds = rightTokenInfoArr.map(rightTokenInfo => {
            return rightTokenInfo.right_token_id;
        });
        if(debugMode) {
            console.log('rightTokenIds', rightTokenIds);
        }

        let rightRes = await fetch.getData('http://127.0.0.1:9001/info/copyright', {copyrightIds: rightTokenIds});
        if(debugMode) {
            let rightResInfo = JSON.parse(Buffer.from(rightRes.body._readableState.buffer.head.data).toString());
            console.log('rightsInfo:', rightResInfo.data.copyrightsInfo);
        }
        break;

    case 'approve':

        let approveSql = sqlText.table('appr_token_info').field('approve_id').order('RAND()').limit(queryAmount).select();
        let approveTokenInfoArr = await mysqlUtils.sql(c, approveSql);
        let approveTokenIds = approveTokenInfoArr.map(approveTokenInfo => {
            return approveTokenInfo.token_id;
        });
        if(debugMode) {
            console.log('approveTokenIds', approveTokenIds);
        }

        let approveRes = await fetch.getData('http://127.0.0.1:9001/info/approve', {approveIds: approveTokenIds});
        if(debugMode) {
            let approveResInfo = JSON.parse(Buffer.from(approveRes.body._readableState.buffer.head.data).toString());
            console.log('approvesInfo:', approveResInfo.data.approvesInfo);
        }
        break;

    default:
        console.log('wrong query mode.')
        break;

}