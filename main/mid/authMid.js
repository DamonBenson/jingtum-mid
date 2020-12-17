import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as fetch from '../../utils/fetch.js';

import {mysqlConf, debugMode} from '../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // 数据库连接

// 处理确权请求
process.stdin.on('data', async function(chunk) {

    // 开始计时
    console.log('authReq processing...');
    let sTs = (new Date()).valueOf();

    // 解析请求数据
    let workId = JSON.parse(chunk.toString());

    // 从mysql获取作品id对应的相关信息（因为数据库内容是从链上同步的，因此不再从链上获取信息）
    let sql = sqlText.table('work_info').field('work_hash, work_name, created_time, published_time, work_type, work_form, work_field, work_id, upload_time, addr').where({work_id: workId}).select();
    let authInfo = await mysqlUtils.sql(c, sql);
    authInfo = authInfo[0];

    // 向版权局http服务器authServer.js发送确权请求
    if(debugMode) {
        console.log('authReq:', authInfo);
    }
    else {
        console.log('authReq:', authInfo.work_id); 
    }
    /* authReq: RowDataPacket {
        work_hash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
        work_name: 'm3_',
        created_time: 2020-01-14T08:00:00.000Z,
        published_time: 2020-01-14T08:00:00.000Z,
        work_type: 2,
        work_form: 2,
        work_field: 2,
        work_id: '01D42A929780AA2ECF1DBC35D7E132FAA476A1B4BAA8224089688806759B5BF8',       
        upload_time: 2020-12-16T18:39:40.000Z,
        addr: 'jUJzw8Y1eBKMchijfndBV6KFeD87uk64K7'
    } */
    await fetch.postData('http://127.0.0.1:9000/authReq', authInfo);

    // 结束计时
    let eTs = (new Date()).valueOf();
    console.log('----------' + (eTs - sTs) + 'ms----------');

});