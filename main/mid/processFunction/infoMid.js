import {Wallet} from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as localUtils from '../../../utils/localUtils.js';
import * as tx from '../../../utils/jingtum/tx.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as infoValidate from '../../../utils/validateUtils/info.js';

import {userAccount} from '../../../utils/config/jingtum.js';
import {mysqlConf} from '../../../utils/config/mysql.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

// 中间层账号
const midAddr = userAccount.midAccount.address;
const midSecr = userAccount.midAccount.secret;

/**
 * @description 激活账户，中间层签名。
 * @param {int}amount 需要激活的区块链账户数量
 * @returns {Object[]} 账户信息列表，包括：账户地址address、账户私钥secret
 */
export async function handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req) {

    console.time('handleActivateAccount');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await infoValidate.activateReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/activateAccount:', resInfo.data);
        console.timeEnd('handleActivateAccount');
        console.log('--------------------');
        return resInfo;
    }

    let addAmount = body.amount;
    let walletArr = new Array(addAmount);
    for(let i = addAmount - 1; i >= 0; i--) {
        walletArr[i] = Wallet.generate()
    }

    /*----------生成账号----------*/

    let activatePromises = [];
    for(let j = addAmount - 1; j >= 0; j--) {
        let a = walletArr[j].address;
        // 转账激活账号
        activatePromises.push(tx.buildPaymentTx(uploadRemote, midAddr, midSecr, seqObj.mid.upload++, a, 100, 'Activate account', true));
        activatePromises.push(tx.buildPaymentTx(tokenRemote, midAddr, midSecr, seqObj.mid.token++, a, 100, 'Activate account', true));
        activatePromises.push(tx.buildPaymentTx(contractRemote, midAddr, midSecr, seqObj.mid.contract++, a, 100, 'Activate account', true));
    }
    await Promise.all(activatePromises);

    resInfo.data.accounts = walletArr;
    console.log('/info/activateAccount:', resInfo.data);

    console.timeEnd('handleActivateAccount');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询作品信息。
 * @param {int[]}workIds 作品标识列表
 * @returns {Object[]} 存证信息列表，具体数据格式见文档
 */
export async function handleWorkInfo(req) {

    console.time('handleWorkInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    try {
        await infoValidate.workQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/work:', resInfo.data);
        console.timeEnd('handleWorkInfo');
        console.log('--------------------');
        return resInfo;
    }

    let workIds = body.workIds.split(',');
    console.log(workIds);
    let sqlPromises = workIds.map(async workId => {
        let filter = {
            work_id: workId,
        }
        let sql = sqlText.table('work_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    })
    let certificateInfoList = (await Promise.all(sqlPromises)).map(sqlResArr => localUtils.fromMysqlObj(sqlResArr[0]));

    resInfo.data.certificateInfoList = certificateInfoList;
    console.log('/info/work:', resInfo.data);

    console.timeEnd('handleWorkInfo');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询版权信息。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @returns {Object[]} 版权权利通证信息列表，具体数据格式见文档
 */
export async function handleCopyrightInfo(req) {

    console.time('handleCopyrightInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    try {
        await infoValidate.copyrightQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/copyright:', resInfo.data);
        console.timeEnd('handleCopyrightInfo');
        console.log('--------------------');
        return resInfo;
    }

    let copyrightIds = body.copyrightIds.split(',');
    let sqlPromises = copyrightIds.map(async copyrightId => {
        let filter = {
            copyright_id: copyrightId,
        }
        let sql = sqlText.table('right_token_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    });
    let copyrightInfoList = (await Promise.all(sqlPromises)).map(sqlResArr => localUtils.fromMysqlObj(sqlResArr[0]));

    resInfo.data.copyrightInfoList = copyrightInfoList;
    console.log('/info/copyright:', resInfo.data);

    console.timeEnd('handleCopyrightInfo');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询许可信息。
 * @param {int[]}approveIds 版权许可通证标识列表
 * @returns {Object[]} 版权许可通证信息列表，具体数据格式见文档
 */
export async function handleApproveInfo(req) {

    console.time('handleApproveInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    try {
        await infoValidate.approveQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/approve:', resInfo.data);
        console.timeEnd('handleApproveInfo');
        console.log('--------------------');
        return resInfo;
    }

    let approveIds = body.approveIds.split(',');
    let sqlPromises = approveIds.map(async approveId => {
        let filter = {
            appr_token_id: approveId,
        }
        let sql = sqlText.table('appr_token_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    })
    let approveInfoList = (await Promise.all(sqlPromises)).map(sqlResArr => localUtils.fromMysqlObj(sqlResArr[0]));

    resInfo.data.approveInfoList = approveInfoList;
    console.log('/info/approve:', resInfo.data);

    console.timeEnd('handleApproveInfo');
    console.log('--------------------');


    return resInfo;

}