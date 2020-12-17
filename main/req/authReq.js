import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../utils/mysqlUtils.js';
import * as fetch from '../../utils/fetch.js';

import {mysqlConf} from '../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // 数据库连接

setInterval(async function() {

    // 开始计时
    console.log('start authing...');
    let sTs = (new Date()).valueOf();

    // 从mysql获取未确权作品id
    let sql = sqlText.table('work_info').field('work_id').where('auth_id is Null').select();
    let uncheckIdArr = await mysqlUtils.sql(c, sql);

    // 发送确权请求至http服务器mainMid.js
    const uncheckCount = uncheckIdArr.length;
    let authReqArr = new Array(uncheckCount);
    for(let i = uncheckCount - 1; i>=0; i--) {
        let uncheckId = uncheckIdArr[i].work_id;
        console.log('auth:', uncheckId);
        // auth: 01D42A929780AA2ECF1DBC35D7E132FAA476A1B4BAA8224089688806759B5BF8
        authReqArr[i] = fetch.postData('http://127.0.0.1:9001/authReq', uncheckId);
    }
    await Promise.all(authReqArr);

    // 结束计时
    let eTs = (new Date()).valueOf();
    console.log('----------' + (eTs - sTs) + 'ms----------');

}, 15000); // 15s防止发送相同作品id的确权请求（账本间隔10s+保护时间）