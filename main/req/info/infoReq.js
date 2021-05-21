import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {mysqlConf, debugMode} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const queryMode = 'copyright';
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
        if(debugMode) {
            let workResInfo = JSON.parse(Buffer.from(workRes.body._readableState.buffer.head.data).toString());
            console.log('worksInfo:', workResInfo.data.certificateInfoList);
        }
        break;

    case 'copyright':

        let copyrightSql = sqlText.table('right_token_info').field('copyright_id').order('RAND()').limit(queryAmount).select();
        let copyrightInfoArr = await mysqlUtils.sql(c, copyrightSql);
        let copyrightIds = copyrightInfoArr.map(copyrightInfo => {
            return copyrightInfo.copyright_id;
        });
        if(debugMode) {
            console.log('copyrightIds', copyrightIds);
        }

        let rightRes = await fetch.getData('http://127.0.0.1:9001/info/copyright', {copyrightIds: copyrightIds});
        if(debugMode) {
            let rightResInfo = JSON.parse(Buffer.from(rightRes.body._readableState.buffer.head.data).toString());
            console.log('rightsInfo:', rightResInfo.data.copyrightInfoList);
        }
        break;

    case 'approve':

        let approveSql = sqlText.table('appr_token_info').field('approve_id').order('RAND()').limit(queryAmount).select();
        let approveInfoArr = await mysqlUtils.sql(c, approveSql);
        let approveIds = approveInfoArr.map(approveInfo => {
            return approveInfo.approve_id;
        });
        if(debugMode) {
            console.log('approveIds', approveIds);
        }

        let approveRes = await fetch.getData('http://127.0.0.1:9001/info/approve', {approveIds: approveIds});
        if(debugMode) {
            let approveResInfo = JSON.parse(Buffer.from(approveRes.body._readableState.buffer.head.data).toString());
            console.log('approvesInfo:', approveResInfo.data.approvesInfo);
        }
        break;

    default:
        console.log('wrong query mode.')
        break;

}