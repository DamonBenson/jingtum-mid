import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as tx from '../../../utils/jingtum/tx.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {userAccount, mysqlConf} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

// 中间层账号
const a9 = userAccount[9].address;
const s9 = userAccount[9].secret;

/*----------激活账号----------*/

export async function handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleActivateAccount');

    let body = JSON.parse(Object.keys(req.body)[0]);

    body.map(async addr => {
        await tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, addr, 10000, 'Activate account.', true);
    })

    console.timeEnd('handleActivateAccount');
    console.log('--------------------');

}

/*----------查询作品信息----------*/

export async function handleWorkInfo(req, res) {

    console.time('handleWorkInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let loopCounter = body.length;
    let workInfoArr = new Array();
    for(let i = 0; i < loopCounter; i++) {
        let workIdFilter = {
            work_id: body[i],
        };
        let sql = sqlText.table('work_info').where(workIdFilter).select();
        let sqlRes = await mysqlUtils.sql(c, sql);
        workInfoArr.push(sqlRes[0]);
    }
    console.log(workInfoArr);

    console.timeEnd('handleWorkInfo');
    console.log('--------------------');

    return workInfoArr;

}

/*----------查询版权通证信息----------*/

export async function handleCopyrightInfo(req, res) {

    console.time('handleCopyrightInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let loopCounter = body.length;
    let rightTokenInfoArr = new Array();
    for(let i = 0; i < loopCounter; i++) {
        let rightTokenIdFilter = {
            token_id: body[i],
        };
        let sql = sqlText.table('right_token_info').where(rightTokenIdFilter).select();
        let sqlRes = await mysqlUtils.sql(c, sql);
        rightTokenInfoArr.push(sqlRes[0]);
    }
    console.log(rightTokenInfoArr);

    console.timeEnd('handleCopyrightInfo');
    console.log('--------------------');

    return rightTokenInfoArr;

}

/*----------查询许可通证信息----------*/

export async function handleApproveInfo(req, res) {

    console.time('handleApproveInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let loopCounter = body.length;
    let approveTokenInfoArr = new Array();
    for(let i = 0; i < loopCounter; i++) {
        let approveTokenIdFilter = {
            token_id: body[i],
        };
        let sql = sqlText.table('approve_token_info').where(approveTokenIdFilter).select();
        let sqlRes = await mysqlUtils.sql(c, sql);
        approveTokenInfoArr.push(sqlRes[0]);
    }
    console.log(approveTokenInfoArr);

    console.timeEnd('handleApproveInfo');
    console.log('--------------------');

    return approveTokenInfoArr;

}