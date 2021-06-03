import {Wallet} from 'jingtum-lib';
import moment from 'moment';
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
setInterval(() => c.ping(err => console.log('MySQL ping err:', err)), 60000);

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
    if(!body.workIds.length) {
        body.workIds = [body.workIds];
    }
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

    let workIds = body.workIds;
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
 * @description 查询权利信息。
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
    if(!body.copyrightIds.length) {
        body.copyrightIds = [body.copyrightIds];
    }
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

    let copyrightIds = body.copyrightIds;
    let rightTokenSqlPromises = copyrightIds.map(async copyrightId => {
        let filter = {
            copyright_id: copyrightId,
        }
        let sql = sqlText.table('right_token_info').where(filter).select();
        return mysqlUtils.sql(c, sql);
    });
    let copyrightInfoList = (await Promise.all(rightTokenSqlPromises)).map(sqlResArr => localUtils.fromMysqlObj(sqlResArr[0]));

    let authenticateSqlPromises = copyrightIds.map(async copyrightId => {
        let filter = {
            copyright_id: copyrightId,
        }
        let sql = sqlText.table('auth_info').field('contract_address, authentication_id, license_url, timestamp').where(filter).select();
        return mysqlUtils.sql(c, sql);
    });
    let authenticationInfoList = (await Promise.all(authenticateSqlPromises)).map(sqlResArr => sqlResArr.map(sqlRes => localUtils.fromMysqlObj(sqlRes)));

    for (let i = copyrightInfoList.length - 1; i >= 0; i--) {
        copyrightInfoList[i].authenticationInfoList = authenticationInfoList[i];
    }

    resInfo.data.copyrightInfoList = copyrightInfoList;
    console.log('/info/copyright:', resInfo.data);

    console.timeEnd('handleCopyrightInfo');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询授权信息。
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
    if(!body.approveIds.length) {
        body.approveIds = [body.approveIds];
    }
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

    let approveIds = body.approveIds;
    let sqlPromises = approveIds.map(async approveId => {
        let filter = {
            approve_id: approveId,
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

/**
 * @description 查询用户的所有作品信息。
 * @param {String}address 用户地址
 * @returns {Object[]} 用户作品信息列表，具体数据格式见文档
 */
export async function handleWorkInfoOfUser(req) {

    console.time('handleWorkInfoOfUser');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    console.log(body);
    try {
        await infoValidate.workOfUserQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/user/work:', resInfo.data);
        console.timeEnd('handleWorkInfoOfUser');
        console.log('--------------------');
        return resInfo;
    }

    let address = body.address;

    let copyrightWorkSql = "\
        SELECT\
            temp.work_id,\
            work_name,\
            work_type,\
            authentication_status,\
            file_info_list\
        FROM\
            (\
                SELECT DISTINCT\
                    work_id,\
                IF (\
                    authentication_id IS NULL,\
                    0,\
                    1\
                ) AS authentication_status\
                FROM\
                    right_token_info\
                LEFT JOIN auth_info ON right_token_info.copyright_id = auth_info.copyright_id\
                WHERE\
                    address = '" + address + "'\
            ) AS temp\
        INNER JOIN work_info ON temp.work_id = work_info.work_id\
    ";
    let copyrightWorkInfoArr =  await mysqlUtils.sql(c, copyrightWorkSql);
    copyrightWorkInfoArr.forEach(copyrightWorkInfo => {
        localUtils.fromMysqlObj(copyrightWorkInfo);
        copyrightWorkInfo.fileHashList = JSON.parse(copyrightWorkInfo.fileInfoList).map(fileInfo => fileInfo.fileHash);
        delete copyrightWorkInfo.fileInfoList;
        copyrightWorkInfo.ownershipType = 0;
    });

    let approveWorkSql = "\
        SELECT\
            temp2.work_id,\
            work_name,\
            work_type,\
            file_info_list\
        FROM\
            (\
                SELECT DISTINCT\
                    work_id\
                FROM\
                    (\
                        SELECT DISTINCT\
                            copyright_id\
                        FROM\
                            appr_token_info\
                        WHERE\
                            address = '" + address + "'\
                    ) AS temp1\
                INNER JOIN right_token_info ON right_token_info.copyright_id = temp1.copyright_id\
            ) AS temp2\
        INNER JOIN work_info ON work_info.work_id = temp2.work_id\
    ";
    let approveWorkInfoArr =  await mysqlUtils.sql(c, approveWorkSql);
    approveWorkInfoArr.forEach(approveWorkInfo => {
        localUtils.fromMysqlObj(approveWorkInfo);
        approveWorkInfo.fileHashList = JSON.parse(approveWorkInfo.fileInfoList).map(fileInfo => fileInfo.fileHash);
        delete approveWorkInfo.fileInfoList;
        approveWorkInfo.authenticationStatus = 0;
        approveWorkInfo.ownershipType = 0;
    });

    let userWorkInfoList = copyrightWorkInfoArr.concat(approveWorkInfoArr);

    resInfo.data.userWorkInfoList = userWorkInfoList;
    console.log('/info/user/work:', resInfo.data);

    console.timeEnd('handleWorkInfoOfUser');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询用户作品的许可发放信息。
 * @param {String}address 用户地址
 * @param {int}workId 作品标识
 * @returns {Object[]} 用户许可信息列表，具体数据格式见文档
 */
export async function handleIssueApproveInfoOfWork(req) {

    console.time('handleIssueApproveInfoOfWork');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    console.log(body);
    try {
        await infoValidate.issueApproveOfWorkQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/user/work/issueApprove:', resInfo.data);
        console.timeEnd('handleIssueApproveInfoOfWork');
        console.log('--------------------');
        return resInfo;
    }

    let workId = body.workId;
    let address = body.address;

    let issueApproveSql = "\
        SELECT\
            approve_id,\
            address,\
            start_time,\
            copyright_type,\
            approve_channel,\
            approve_area,\
            approve_time\
        FROM\
            (\
                SELECT\
                    copyright_id\
                FROM\
                    right_token_info\
                WHERE\
                    work_id = '" + workId + "'\
                AND address = '" + address + "'\
            ) AS temp\
        INNER JOIN appr_token_info ON temp.copyright_id = appr_token_info.copyright_id\
    ";
    let userApproveInfoList =  await mysqlUtils.sql(c, issueApproveSql);
    userApproveInfoList.forEach(issueApproveInfo => {
        localUtils.fromMysqlObj(issueApproveInfo);
        issueApproveInfo.approveTime = getEndTimeStr(issueApproveInfo.startTime, issueApproveInfo.approveTime);
        delete issueApproveInfo.startTime;
    });

    resInfo.data.userApproveInfoList = userApproveInfoList;
    console.log('/info/user/work/issueApprove:', resInfo.data);

    console.timeEnd('handleIssueApproveInfoOfWork');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询用户作品的许可获得信息。
 * @param {String}address 用户地址
 * @param {int}workId 作品标识
 * @returns {Object[]} 用户许可信息列表，具体数据格式见文档
 */
export async function handleOwnApproveInfoOfWork(req) {

    console.time('handleOwnApproveInfoOfWork');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    console.log(body);
    try {
        await infoValidate.issueApproveOfWorkQueryReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/info/user/work/ownApprove:', resInfo.data);
        console.timeEnd('handleOwnApproveInfoOfWork');
        console.log('--------------------');
        return resInfo;
    }

    let workId = body.workId;
    let address = body.address;

    let ownApproveSql = "\
        SELECT\
            approve_id,\
            temp.address,\
            start_time,\
            copyright_type,\
            approve_channel,\
            approve_area,\
            approve_time\
        FROM\
            (\
                SELECT\
                    copyright_id,\
                    address\
                FROM\
                    right_token_info\
                WHERE\
                    work_id = '" + workId + "'\
            ) AS temp\
        INNER JOIN appr_token_info ON temp.copyright_id = appr_token_info.copyright_id\
        WHERE\
            appr_token_info.address = '" + address + "'\
    ";
    let userApproveInfoList =  await mysqlUtils.sql(c, ownApproveSql);
    userApproveInfoList.forEach(ownApproveInfo => {
        localUtils.fromMysqlObj(ownApproveInfo);
        ownApproveInfo.approveTime = getEndTimeStr(ownApproveInfo.startTime, ownApproveInfo.approveTime);
        delete ownApproveInfo.startTime;
    });

    resInfo.data.userApproveInfoList = userApproveInfoList;
    console.log('/info/user/work/ownApprove:', resInfo.data);

    console.timeEnd('handleOwnApproveInfoOfWork');
    console.log('--------------------');

    return resInfo;

}

function getEndTimeStr(startTime, approveTime) {

    switch(approveTime) {
        case 0:
            return moment(startTime * 1000).add(6, 'months').format('YYYY年MM月DD日');
        case 1:
            return moment(startTime * 1000).add(1, 'years').format('YYYY年MM月DD日');
        case 2:
            return moment(startTime * 1000).add(3, 'years').format('YYYY年MM月DD日');
        case 3:
            return '永久';
    }
    
}