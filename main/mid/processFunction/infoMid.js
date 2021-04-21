import jlib, { Wallet } from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as tx from '../../../utils/jingtum/tx.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as infoValidate from '../../../utils/validateUtils/info.js';

import {userAccount, chains, mysqlConf} from '../../../utils/info.js';

const Remote = jlib.Remote;

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

// 中间层账号
const a9 = userAccount[9].address;
const s9 = userAccount[9].secret;

/*----------激活账号----------*/

export async function handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleActivateAccount');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let addAmount = body;
    let [validateInfoRes, validateInfo] = await infoValidate.validateActivateReq(addAmount);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    let walletArr = new Array(addAmount);
    for(let i = addAmount - 1; i >= 0; i--) {
        walletArr[i] = Wallet.generate()
    }

    /*----------生成账号----------*/

    let activatePromises = [];
    for(let j = addAmount - 1; j >= 0; j--) {
        let a = walletArr[j].address;
        // 转账激活账号
        activatePromises.push(tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, a, 10000, 'Activate account', true));
        activatePromises.push(tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, a, 10000, 'Activate account', true));
        activatePromises.push(tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, a, 10000, 'Activate account', true));
    }
    await Promise.all(activatePromises);

    console.timeEnd('handleActivateAccount');
    console.log('--------------------');

    resInfo.data.wallets = walletArr;
    return resInfo;

}

/*----------查询作品信息----------*/

export async function handleWorkInfo(req, res) {

    console.time('handleWorkInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await infoValidate.validateQueryReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters';
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    let sqlPromises = body.map(async workId => {
        let filter = {
            work_id: workId,
        }
        let sql = sqlText.table('work_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    })
    let worksInfo = (await Promise.all(sqlPromises)).map(sqlResArr => sqlResArr[0]);

    console.timeEnd('handleWorkInfo');
    console.log('--------------------');

    resInfo.data.worksInfo = worksInfo;

    return resInfo;

}

/*----------查询版权通证信息----------*/

export async function handleCopyrightInfo(req, res) {

    console.time('handleCopyrightInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await infoValidate.validateQueryReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters';
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    let sqlPromises = body.map(async copyrightId => {
        let filter = {
            token_id: copyrightId,
        }
        let sql = sqlText.table('right_token_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    })
    let copyrightsInfo = (await Promise.all(sqlPromises)).map(sqlResArr => sqlResArr[0]);

    console.timeEnd('handleCopyrightInfo');
    console.log('--------------------');

    resInfo.data.copyrightsInfo = copyrightsInfo;

    return resInfo;

}

/*----------查询许可通证信息----------*/

export async function handleApproveInfo(req, res) {

    console.time('handleApproveInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await infoValidate.validateQueryReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters';
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    let sqlPromises = body.map(async approveId => {
        let filter = {
            appr_token_id: approveId,
        }
        let sql = sqlText.table('appr_token_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    })
    let approvesInfo = (await Promise.all(sqlPromises)).map(sqlResArr => sqlResArr[0]);

    console.timeEnd('handleApproveInfo');
    console.log('--------------------');

    resInfo.data.approvesInfo = approvesInfo;

    return resInfo;

}