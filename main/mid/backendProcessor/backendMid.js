import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {mysqlConf} from '../../../utils/info.js';
import util from 'util';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

/*----------构造上传买单的交易----------*/

/**
 *
 */
export async function handleAuthRightRate(req, res) {

    console.time('handleAuthRightRate');
    // 获取AuthRightRate
    let [WorkAmount,RightAmount] = await getAuthRightRate();
    let resJson = JSON.stringify({'WorkAmount':WorkAmount,"RightAmount":RightAmount});
    console.timeEnd('handleAuthRightRate');
    console.log('--------------------');
    return resJson;

}

async function getAuthRightRate() {
    let sqlWork = sqlText.count().table('work_info').select();
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    let RightAmount = await mysqlUtils.sql(c, sqlRight);
    RightAmount = RightAmount[0]['COUNT(1)'];


    return [WorkAmount,RightAmount];

}
/**
 *
 */
 export async function handleAuthByCompany(req, res) {

    console.time('handleAuthByCompany');
    let sqlRes = await getAuthByCompany();
    // let 
    // for(let i=0 ; i<4 ; i++){
    //     sqlRes
    // }

    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleAuthByCompany');
    console.log('--------------------');
    return resJson;
}

async function getAuthByCompany() {
    let timeNow = Math.round((new Date())/ 1000);
    let timeLastOneMonth = Math.round((new Date() - 30*24*3600)/ 1000);
    let timeLastTwoMonth = Math.round((new Date() - 60*24*3600)/ 1000);
    let timeLastThreeMonth = Math.round((new Date() - 90*24*3600)/ 1000);
    let timeLastFourMonth = Math.round((new Date() - 120*24*3600)/ 1000);
    let timeSlot = [timeNow,timeLastOneMonth,timeLastTwoMonth,timeLastThreeMonth,timeLastFourMonth];
    let sqlRight ="";
    let sqlRes ="";
    let Res = {
        0:{},
        1:{},
        2:{},
        3:{},
    };
    for(let i = 0 ; i < 4; i++){
        sqlRight =util.format(
            'SELECT DISTINCT\
                 right_token_info.addr,\
                 COUNT(right_token_info.addr)\
             FROM\
                 right_token_info\
                 INNER JOIN\
                 work_info\
                 ON \
                     right_token_info.work_id = work_info.work_id\
             WHERE\
                 right_type = 1 AND\
                 (\
                     work_info.created_time >= %s\
                 ) AND\
                 (\
                     work_info.created_time < %s\
                 )\
             GROUP BY\
                 right_token_info.addr\
             ORDER BY\
                 work_info.created_time ASC',timeSlot[i+1],timeSlot[i]);
        // console.log(sqlRight);
        sqlRes = await mysqlUtils.sql(c, sqlRight);
        // console.log(sqlRes);
        sqlRes.forEach(value => 
            Res[i][value['addr']] = value['COUNT(right_token_info.addr)']
        );
    }
    console.log(Res);
    let NeedRes ={
        0:{},
        1:{},
        2:{},
        3:{},
    }
    for(let i = 0 ; i < 4; i++){
        try{
            NeedRes[i]["JD"] = Res[i]["jG1Y4G3omHCAbAWRuuYZ5zwcftXgvfmaX3"];
            NeedRes[i]["Baidu"] = Res[i]["jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC"];
            NeedRes[i]["Month"] = i;
        }
        catch{
            NeedRes[i]["JD"] = 0;
            NeedRes[i]["Baidu"] = 0;
        }
        if(NeedRes[i]["JD"] == null){
            NeedRes[i]["JD"] = 0;
            NeedRes[i]["Baidu"] = 0;
        }
    }
    console.log(NeedRes);

    return NeedRes;

}

