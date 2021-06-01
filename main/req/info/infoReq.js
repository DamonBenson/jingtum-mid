import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';

import {mysqlConf, debugMode} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const queryMode = 'issueApprove';
const queryAmount = 1;

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
        
        let workResInfo = await httpUtils.get('http://127.0.0.1:9001/info/work', {workIds: workIds});
        if(debugMode) {
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
            console.log('copyrightIds:', copyrightIds);
        }

        let rightResInfo = await httpUtils.get('http://127.0.0.1:9001/info/copyright', {copyrightIds: copyrightIds});
        if(debugMode) {
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
            console.log('approveIds:', approveIds);
        }

        let approveResInfo = await httpUtils.get('http://127.0.0.1:9001/info/approve', {approveIds: approveIds});
        if(debugMode) {
            console.log('approvesInfo:', approveResInfo.data.approveInfoList);
        }
        break;

    case 'issueApprove':

        let issueApproveSql = sqlText.table('work_info').field('work_id, address').order('RAND()').limit(1).select();
        let issueApproveInfoArr = await mysqlUtils.sql(c, issueApproveSql);
        let issueApproveReq = {
            workId: issueApproveInfoArr[0].work_id, // '4BA705AFC73EBDEB4F2B0DCE395D6E9246A1B61C554B0FF95A8ED94FE0EF45B1'
            address: issueApproveInfoArr[0].address,
        }
        if(debugMode) {
            console.log('issueApproveReq:', issueApproveReq);
        }

        let userIssueApproveInfo = await httpUtils.get('http://127.0.0.1:9001/info/user/work/issueApprove', issueApproveReq);
        if(debugMode) {
            console.log('userApproveInfo:', userIssueApproveInfo.data.userApproveInfoList);
        }
        break;

    case 'ownApprove':

        let ownApproveSql = sqlText.table('work_info').field('work_id, address').order('RAND()').limit(1).select();
        let ownApproveInfoArr = await mysqlUtils.sql(c, ownApproveSql);
        let ownApproveReq = {
            workId: ownApproveInfoArr[0].work_id, // '4BA705AFC73EBDEB4F2B0DCE395D6E9246A1B61C554B0FF95A8ED94FE0EF45B1'
            address: ownApproveInfoArr[0].address, // 'j4M6Hb65iKUVyzRNVYCCvqnpB6q4j7TT9Q'
        }
        if(debugMode) {
            console.log('ownApproveReq:', ownApproveReq);
        }

        let userOwnApproveInfo = await httpUtils.get('http://127.0.0.1:9001/info/user/work/ownApprove', ownApproveReq);
        if(debugMode) {
            console.log('userApproveInfo:', userOwnApproveInfo.data.userApproveInfoList);
        }
        break;

    default:
        console.log('wrong query mode.')
        break;

}