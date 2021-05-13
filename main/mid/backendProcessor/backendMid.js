import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../../../utils/localUtils.js';

import {mysqlTestConf} from '../../../utils/info.js';
import util from 'util';

const c = mysql.createConnection(mysqlTestConf);
c.connect(); // mysql连接

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
                 work_info.created_time ASC'
            ,timeSlot[i+1],timeSlot[i]);
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
            NeedRes[i]["Month"] = i;
        }
        if(NeedRes[i]["JD"] == null){
            NeedRes[i]["JD"] = 0;
            NeedRes[i]["Baidu"] = 0;
            NeedRes[i]["Month"] = i;
        }
    }
    console.log(NeedRes);

    return NeedRes;

}

//*****************************************************************************************************//
// 新方案
// 1.1 存证总数量随时间变化 折线图
// 1.2 当前不同作品类型存证数量分布饼图
// 1.3 最大的三种作品类型的存证数量随时间的变化
// 2.1 版权通证总数量随时间变化 折线图
// 3.1 个人账户与非个人账户接收者通证数量对比
// 4.1 截止当前，不同类别通证的数量分布饼图
//*****************************************************************************************************//
// 1.	存证信息-作品信息
// 一维图（一个自变量）
// 1）	存证总数量随时间的变化。
export async function handleCertificateAmountEXchange(req, res) {

    console.time('handleCertificateAmountEXchange');
    let sqlRes = await getCertificateAmountEXchange();

    // let resJson = JSON.stringify(sqlRes);

    console.timeEnd('handleCertificateAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getCertificateAmountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    // console.log([TimeStampArray, MonthArray]);
    let CertificateAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight =util.format(
            'work_info.created_time >= %s\
                 AND\
            work_info.created_time < %s'
            ,endTimeStamp,startTimeStamp);
        // console.log(sqlRight);
        let value = localUtils.randomNumber(30,50);
        // sqlRes = await mysqlUtils.sql(c, sqlRight);
        // // console.log(sqlRes);
        // sqlRes.forEach(value => 
        //     Res[i][value['addr']] = value['COUNT(right_token_info.addr)']
        // );
        
        let MonthInfo = {
            "CertificateAmount": value,
            "Month" : MonthArray[index + 1],
        };
        CertificateAmountEXchange.push(MonthInfo);
    }
    console.log(CertificateAmountEXchange);
    return CertificateAmountEXchange;
}
// 2）	截止当前不同作品类型
export async function handleCertificateAmountGroupByWorkType(req, res) {

    console.time('handleCertificateAmountGroupByWorkType');
    let sqlRes = await getCertificateAmountGroupByWorkType();


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCertificateAmountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}

async function getCertificateAmountGroupByWorkType() {
    let CertificateAmountGroupByWorkType = [];
    let WorkTypeInfo = {};

    WorkTypeInfo = {
        "workType":"音乐",
        "CertificateAmount":localUtils.randomNumber(80,100)
    };
    CertificateAmountGroupByWorkType.push(WorkTypeInfo);
    WorkTypeInfo = {
        "workType":"电影",
        "CertificateAmount":localUtils.randomNumber(60,80)
    };
    CertificateAmountGroupByWorkType.push(WorkTypeInfo);
    WorkTypeInfo = {
        "workType":"美术",
        "CertificateAmount":localUtils.randomNumber(40,60)
    };
    CertificateAmountGroupByWorkType.push(WorkTypeInfo);

    return CertificateAmountGroupByWorkType;
}
// 2）	截止当前不同创作类型的存证数量分布。

// 二维图（两个自变量）
// 3）	不同作品类型的存证数量随时间的变化。workType
export async function handleCertificateAmountGroupByWorkTypeEXchange(req, res) {

    console.time('handleCertificateAmountGroupByWorkTypeEXchange');
    let sqlRes = await getCertificateAmountGroupByWorkTypeEXchange();


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCertificateAmountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getCertificateAmountGroupByWorkTypeEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let CertificateAmountGroupByWorkTypeEXchange = [];
    let MonthGap = 3;
    let WorkTypeInfo = {};
    for (let index = 0; index < 12; index = index + MonthGap) {
        let CertificateAmountGroupByWorkType = [];
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + MonthGap)];
        WorkTypeInfo = {
            "workType":"音乐",
            "CertificateAmount":localUtils.randomNumber(80,100),
            "Month" : MonthArray[index + MonthGap],
        };
        CertificateAmountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"电影",
            "CertificateAmount":localUtils.randomNumber(60,80),
            "Month" : MonthArray[index + MonthGap],
        };
        CertificateAmountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"美术",
            "CertificateAmount":localUtils.randomNumber(40,60),
            "Month" : MonthArray[index + MonthGap],
        };
        CertificateAmountGroupByWorkType.push(WorkTypeInfo);
        CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);
    }


    return CertificateAmountGroupByWorkTypeEXchange;
}
// 4）	不同创作类型的存证数量随时间的变化。creationType
export async function handleCertificateAmountGroupByCreationTypeEXchange(req, res) {

    console.time('handleCertificateAmountGroupByCreationTypeEXchange');
    let sqlRes = await getCertificateAmountGroupByCreationTypeEXchange();


    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCertificateAmountGroupByCreationTypeEXchange');
    console.log('--------------------');
    return resJson;
}

async function getCertificateAmountGroupByCreationTypeEXchange() {
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    return [WorkAmount,RightAmount];
}
// 2.	版权信息-通证总体数量
// 一维图（一个自变量）
// 1）	版权通证总数量随时间的变化。 Amount
export async function handleCopyRightAmountEXchange(req, res) {

    console.time('handleCopyRightAmountEXchange');
    let sqlRes = await getCopyRightAmountEXchange();


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getCopyRightAmountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    // console.log([TimeStampArray, MonthArray]);
    let CopyRightAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight =util.format(
            'work_info.created_time >= %s\
                 AND\
            work_info.created_time < %s'
            ,endTimeStamp,startTimeStamp);
        // console.log(sqlRight);
        let value = localUtils.randomNumber(30,50);
        // sqlRes = await mysqlUtils.sql(c, sqlRight);
        // // console.log(sqlRes);
        // sqlRes.forEach(value => 
        //     Res[i][value['addr']] = value['COUNT(right_token_info.addr)']
        // );
        
        let MonthInfo = {
            "CopyRightAmount": value,
            "Month" : MonthArray[index + 1],
        };
        CopyRightAmountEXchange.push(MonthInfo);
    }
    return CopyRightAmountEXchange;
}
// 2）	截止当前不同作品类型、不同创作类型的通证数量分布。 INNER_JOIN workType、creationType
export async function handleCopyRightAmountGroupByWorkType(req, res) {

    console.time('handleCopyRightAmountGroupByWorkType');
    let sqlRes = await getCopyRightAmountGroupByWorkType();


    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByWorkType');
    console.log('--------------------');
    return resJson;
}

async function getCopyRightAmountGroupByWorkType() {
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    return [WorkAmount,RightAmount];
}
export async function handleCopyRightAmountGroupByCreationType(req, res) {

    console.time('handleCopyRightAmountGroupByCreationType');
    let sqlRes = await getCopyRightAmountGroupByCreationType();


    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByCreationType');
    console.log('--------------------');
    return resJson;
}

async function getCopyRightAmountGroupByCreationType() {
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    return [WorkAmount,RightAmount];
}
// 二维图（两个自变量）
// 3）	不同作品类型的通证数量随时间的变化。INNER_JOIN workType
export async function handleCopyRightAmountGroupByWorkTypeEXchange(req, res) {

    console.time('handleCopyRightAmountGroupByWorkTypeEXchange');
    let sqlRes = await getCopyRightAmountGroupByWorkTypeEXchange();


    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return resJson;
}

async function getCopyRightAmountGroupByWorkTypeEXchange() {
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    return [WorkAmount,RightAmount];
}
// 4）	不同创作类型的通证数量随时间的变化。INNER_JOIN creationType
export async function handleCopyRightAmountGroupByCreationTypeEXchange(req, res) {

    console.time('handleCopyRightAmountGroupByCreationTypeEXchange');
    let sqlRes = await getCopyRightAmountGroupByCreationTypeEXchange();


    let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByCreationTypeEXchange');
    console.log('--------------------');
    return resJson;
}

async function getCopyRightAmountGroupByCreationTypeEXchange() {
    let sqlRight = sqlText.count().table('right_token_info').where('right_type=1').select();

    let WorkAmount = await mysqlUtils.sql(c, sqlWork);
    WorkAmount = WorkAmount[0]['COUNT(1)'];

    return [WorkAmount,RightAmount];
}
// 3.	存证信息-存证时的版权（通证）接收者
// 一维图（一个自变量）
// 1）	截止当前，在已生成的全部版权通证中，个人账户作为存证时的版权接收者（版权持有者证件类型为居民身份证、军官证与护照）
// 与非个人账户作为存证时的版权接收者（版权持有者证件类型为营业执照、企业法人营业执照、组织机构代码证书、事业单位法人证书、社团法人证书、其他有效证件）
// 的通证数量分布。 id_type
export async function handleCopyRightAmountGroupByIDtype(req, res) {

    console.time('handleCopyRightAmountGroupByIDtype');
    let sqlRes = await getCopyRightAmountGroupByIDtype();
    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByIDtype');
    console.log('--------------------');
    return sqlRes;
}

async function getCopyRightAmountGroupByIDtype() {
    let CopyRightAmountGroupByIDtype = {};

    CopyRightAmountGroupByIDtype = {
        "个人账户数目" : localUtils.randomNumber(300,500),
        "非个人账户数目": localUtils.randomNumber(600,1000),
    }

    return CopyRightAmountGroupByIDtype;
}
// 二维图（两个自变量）
// 2）	不同类型的账户作为版权通证接收者的通证数量随时间的变化。 IDType NeedTime
// 4.	版权信息-copyrightType
// 一维图（一个自变量）
// 1)	截止当前，不同类别通证的数量分布。 copyrightType Amount
export async function handleCopyRightAmountGroupByCopyrightType(req, res) {

    console.time('handleCopyRightAmountGroupByCopyrightType');
    let sqlRes = await getCopyRightAmountGroupByCopyrightType();
    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCopyRightAmountGroupByCopyrightType');
    console.log('--------------------');
    return sqlRes;
}

async function getCopyRightAmountGroupByCopyrightType() {
    let CopyRightAmountGroupByIDtype = {};

    CopyRightAmountGroupByIDtype = {
        "复制权" : localUtils.randomNumber(200,500),
        "发行权" : localUtils.randomNumber(200,500),
        "出租权" : localUtils.randomNumber(200,500),
        "展览权" : localUtils.randomNumber(200,500),
        "表演权" : localUtils.randomNumber(200,500),
        "放映权" : localUtils.randomNumber(200,500),
        "广播"   : localUtils.randomNumber(200,500),
        "信息网络传播权" : localUtils.randomNumber(200,500),
        "摄制权" : localUtils.randomNumber(200,500),
        "改编权" : localUtils.randomNumber(200,500),
        "翻译权" : localUtils.randomNumber(200,500),
        "汇编权" : localUtils.randomNumber(200,500),
        "其他"   : localUtils.randomNumber(50,200),
        
    }

    return CopyRightAmountGroupByIDtype;
}
// 二维图（两个自变量）
// 2)	不同类别的通证的数量随时间的变化。 copyrightType Amount NeedTime
// 5.	版权信息-copyrightHolder-具有动态性
// 一维图（一个自变量）
// 1）	截止当前，个人拥有版权（版权持有者证件类型为居民身份证、军官证与护照）、非个人拥有版权（版权持有者证件类型为营业执照、企业法人营业执照、组织机构代码证书、事业单位法人证书、社团法人证书、其他有效证件）的版权通证数量分布。
// 6.	存证信息-作品文件信息
// 1）	存证作品文件总数量随时间的变化。 fileInfo Amount
// 2）	截止当前不同作品文件类型的数量分布。 fileType
// 3）	不同作品文件类型的文件数量随时间的变化。 fileTypeTime






/** 监测维权服务 等待百度文档
 *
 *
 */
// 一维图（一个自变量）
// 1）	存证总数量随时间的变化。
export async function handleCertificateAmountEXchange(req, res) {

    console.time('handleCertificateAmountEXchange');
    let sqlRes = await getCertificateAmountEXchange();

    console.timeEnd('handleCertificateAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getCertificateAmountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    // console.log([TimeStampArray, MonthArray]);
    let CertificateAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight =util.format(
            'work_info.created_time >= %s\
                 AND\
            work_info.created_time < %s'
            ,endTimeStamp,startTimeStamp);
        // console.log(sqlRight);
        let value = localUtils.randomNumber(30,50);
        // sqlRes = await mysqlUtils.sql(c, sqlRight);
        // // console.log(sqlRes);
        // sqlRes.forEach(value => 
        //     Res[i][value['addr']] = value['COUNT(right_token_info.addr)']
        // );
        
        let MonthInfo = {
            "CertificateAmount": value,
            "Month" : MonthArray[index + 1],
        };
        CertificateAmountEXchange.push(MonthInfo);
    }
    console.log(CertificateAmountEXchange);
    return CertificateAmountEXchange;
}