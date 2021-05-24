/**
 * @file: listenDisplayGroup.js
 * @Description: 监测维权后端处理函数
 * @author Bernard
 * @date 2021/5/23
*/
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../../../utils/localUtils.js';

import util from 'util';

import mysql from 'mysql';
import {mysqlConf} from '../../../utils/info.js';
export const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

let CONNECT = false;// When false, Send Random Response

export async function handleDetectNum(req, res) {

    console.time('handleDetectNum');
    let sqlRes = await gethandleDetectNum();
    console.timeEnd('handleDetectNum');
    console.log('--------------------');
    return sqlRes;
}

async function gethandleDetectNum() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let CopyRightAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight =util.format(
            'SELECT DISTINCT\n' +
            '\tCOUNT(right_token_info.copyright_id)\n' +
            'FROM\n' +
            '\tright_token_info\n' +
            '\tINNER JOIN\n' +
            '\t(\n' +
            '\t\twork_info\n' +
            '\t)\n' +
            '\tON \n' +
            '\t\tright_token_info.work_id = work_info.work_id\n' +
            'WHERE\n' +
            '\t\twork_info.completion_time <= %s AND\n' +
            '\t\t\twork_info.completion_time > %s\n'
            ,endTimeStamp,startTimeStamp);
        // console.log(sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log(sqlRes);
        let valueRes = 0;
        sqlRes.forEach(function(item,index){
            valueRes = item['COUNT(right_token_info.copyright_id)'];
            console.log(item['COUNT(right_token_info.copyright_id)']+'---'+index);
        });
        if(CONNECT == false) valueRes = localUtils.randomNumber(30,50);
        console.log("valueRes =",valueRes);

        let MonthInfo = {
            "CopyRightAmount": valueRes,
            "Month" : MonthArray[index + 1],
        };
        CopyRightAmountEXchange.push(MonthInfo);
    }
    CopyRightAmountEXchange.reverse();
    return CopyRightAmountEXchange;
}