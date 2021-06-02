import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';

import {mysqlConf} from '../../../utils/config/mysql.js';
import {debugMode} from '../../../utils/config/project.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const authMode = 'work';

switch(authMode) {

    case 'work':

        let workSql = sqlText.table('work_info').field('work_id, address').order('RAND()').limit(1).select();
        let workInfoArr = await mysqlUtils.sql(c, workSql);
        let authWorkInfo = {
            workId: workInfoArr[0].work_id,
            address: workInfoArr[0].address,
        }
        if(debugMode) {
            console.log('authWorkInfo:', authWorkInfo);
        }
        
        let workAuthResInfo = await httpUtils.post('http://127.0.0.1:9001/auth/innerWork', authWorkInfo);
        if(debugMode) {
            console.log('workAuthResInfo:', workAuthResInfo.data.authenticationInfo);
        }

        break;

    case 'copyright':

        const queryAmount = 1;

        let copyrightSql = sqlText.table('right_token_info').field('copyright_id').order('RAND()').limit(queryAmount).select();
        let copyrightInfoArr = await mysqlUtils.sql(c, copyrightSql);
        let copyrightIds = copyrightInfoArr.map(copyrightInfo => {
            return copyrightInfo.copyright_id;
        });
        if(debugMode) {
            console.log('copyrightIds', copyrightIds);
        }
        
        let copyrightAuthResInfo = await httpUtils.post('http://127.0.0.1:9001/auth/innerCopyright', {copyrightIds: copyrightIds});
        if(debugMode) {
            console.log('copyrightAuthResInfo:', copyrightAuthResInfo.data.authenticationInfoList);
        }

        break;

    default:
        break;

}