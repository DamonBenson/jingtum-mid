/**
 * @file: authDisplayGroup.js
 * @Description: 存证确权后端处理函数
 * @author Bernard
 * @date 2021/5/23
*/
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../../../utils/localUtils.js';

import util from 'util';

import mysql from 'mysql';
import {c} from "../MidBackend.js";

const WORKTYPE = {
    1:"文字",2:"口述",3:"音乐",4:"戏剧",5:"曲艺",
    6:"舞蹈",7:"杂技艺术",8:"美术",9:"建筑",10:"摄影",
    11:"电影和类似摄制电影方法创作的作品",12:"图形",13:"模型",14:"其他"
};
const CONNECT = true;// When false, Send Random Response
// 1.	存证信息-作品信息
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
            'SELECT DISTINCT\n' +
            '\tCOUNT(right_token_info.work_id)\n' +
            'FROM\n' +
            '\tright_token_info\n' +
            '\tINNER JOIN\n' +
            '\t(\n' +
            '\t\twork_info\n' +
            '\t)\n' +
            '\tON \n' +
            '\t\tright_token_info.work_id = work_info.work_id\n' +
            'WHERE\n' +
            '\tright_token_info.copyright_type = 1 AND\n' +
            '\t(\n' +
            '\t\twork_info.completion_time <= %s AND\n' +
            '\t\t(\n' +
            '\t\t\twork_info.completion_time > %s\n' +
            '\t\t)\n' +
            '\t)'
            ,endTimeStamp,startTimeStamp);
        console.log("sqlRight:",sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log("sqlRes:",sqlRes);
        let valueRes = 0;

        sqlRes.forEach(function(item,index){
            valueRes = item['COUNT(right_token_info.work_id)'];
            console.log(item['COUNT(right_token_info.work_id)']+'---'+index);
        });
        console.log("valueRes =",valueRes);
        if(CONNECT == false)valueRes = localUtils.randomNumber(30,50);

        let MonthInfo = {
            "CertificateAmount": valueRes,
            "Month" : MonthArray[index + 1],
        };
        CertificateAmountEXchange.push(MonthInfo);
    }
    CertificateAmountEXchange.reverse();
    console.log(CertificateAmountEXchange);
    return CertificateAmountEXchange;
}
// 2）	截止当前不同作品类型
export async function handleCertificateAmountGroupByWorkType(req, res) {

    console.time('handleCertificateAmountGroupByWorkType');
    let sqlRes = await getCertificateAmountGroupByWorkType();
    console.timeEnd('handleCertificateAmountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}

async function getCertificateAmountGroupByWorkType() {
    let CertificateAmountGroupByWorkType = [];
    let WorkTypeInfo = {};

    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\t*\n' +
            'FROM\n' +
            '\t(\n' +
            '\t\tSELECT\n' +
            '\t\t\twork_info.work_type, \n' +
            '\t\t\tCOUNT(work_info.work_id) AS num\n' +
            '\t\tFROM\n' +
            '\t\t\twork_info\n' +
            '\t\tGROUP BY\n' +
            '\t\t\twork_info.work_type\n' +
            '\t) AS Type\n' +
            'ORDER BY\n' +
            '\tnum DESC\n' +
            'LIMIT 3');
        console.log("sqlRight:",sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log("sqlRes:",sqlRes);
        let Res = {};
        sqlRes.forEach(value =>
            Res[WORKTYPE[value['work_type']]] = value['num']
        );
        console.log("Res:",Res);
        let keys = Object.keys(Res);
        console.log("keys:",keys);
        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            WorkTypeInfo = {
                "workType":key,
                "CertificateAmount":Res[key]
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
        }
        console.log("CertificateAmountGroupByWorkType:",CertificateAmountGroupByWorkType);

    }
    else{
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
    }
    return CertificateAmountGroupByWorkType;
}
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
    let CertificateAmountGroupByWorkType = [];
    let MonthGap = 3;
    let WorkTypeInfo = {};
    // console.log([TimeStampArray, MonthArray]);
    if(CONNECT == true){
        // TODO 第一个月确定选中的类型
        let index = 0;
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight =util.format(
            'SELECT\n' +
            '\t*\n' +
            'FROM\n' +
            '\t(\n' +
            '\t\tSELECT\n' +
            '\t\t\twork_info.work_type, \n' +
            '\t\t\tCOUNT(work_info.work_id) AS num\n' +
            '\t\tFROM\n' +
            '\t\t\twork_info\n' +
            '\t\tWHERE\n' +
            '\t\t\twork_info.completion_time <= %s AND\n' +
            '\t\t\twork_info.completion_time > %s\n' +
            '\t\tGROUP BY\n' +
            '\t\t\twork_info.work_type\n' +
            '\t) AS Type\n' +
            'ORDER BY\n' +
            '\tnum DESC\n' +
            'LIMIT 3'
            ,endTimeStamp,startTimeStamp);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        let Res = {};
        sqlRes.forEach(value =>
            Res[WORKTYPE[value['work_type']]] = value['num']
        );
        console.log("Res =",Res);

        let keys = Object.keys(Res);
        console.log("keys:",keys);
        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            if(Res[key]==null)Res[key]=0;
            let MonthInfo = {
                "workType":key,
                "CertificateAmount":Res[key],
                "Month" : MonthArray[index + MonthGap],
            };
            CertificateAmountGroupByWorkType.push(MonthInfo);
        }
        CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);
        index = index + MonthGap;
        for (; index < 12; index = index + MonthGap) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            sqlRight =util.format(
                'SELECT\n' +
                '\t*\n' +
                'FROM\n' +
                '\t(\n' +
                '\t\tSELECT\n' +
                '\t\t\twork_info.work_type, \n' +
                '\t\t\tCOUNT(work_info.work_id) AS num\n' +
                '\t\tFROM\n' +
                '\t\t\twork_info\n' +
                '\t\tWHERE\n' +
                '\t\t\twork_info.completion_time <= %s AND\n' +
                '\t\t\twork_info.completion_time > %s\n' +
                '\t\tGROUP BY\n' +
                '\t\t\twork_info.work_type\n' +
                '\t) AS Type\n' +
                'ORDER BY\n' +
                '\tnum DESC\n' +
                'LIMIT 3'
                ,endTimeStamp,startTimeStamp);
            console.log("sqlRight:",sqlRight);
            sqlRes = await mysqlUtils.sql(c, sqlRight);
            console.log("sqlRes:",sqlRes);
            Res = {};
            sqlRes.forEach(value =>
                Res[WORKTYPE[value['work_type']]] = value['num']
            );
            console.log("Res =",Res);
            CertificateAmountGroupByWorkType =[];
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "workType":key,
                    "CertificateAmount":Res[key],
                    "Month" : MonthArray[index + MonthGap],
                };
                CertificateAmountGroupByWorkType.push(MonthInfo);
            }
            CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);

        }
    }
    else{
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

    }

    CertificateAmountGroupByWorkTypeEXchange.reverse();
    return CertificateAmountGroupByWorkTypeEXchange;
}

// 1）	版权通证总数量随时间的变化。
export async function handleCopyRightAmountEXchange(req, res) {

    console.time('handleCopyRightAmountEXchange');
    let sqlRes = await getCopyRightAmountEXchange();

    console.timeEnd('handleCopyRightAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getCopyRightAmountEXchange() {
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
// 1..9   1.2.4为个人
async function getCopyRightAmountGroupByIDtype() {
    let CopyRightAmountGroupByIDtype = {};
    if(CONNECT == false){
        CopyRightAmountGroupByIDtype = {
            "个人账户数目" : localUtils.randomNumber(300,500),
            "非个人账户数目": localUtils.randomNumber(600,1000),
        };
    }
    else{
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(right_token_info.copyright_id) AS num\n' +
            'FROM\n' +
            '\tright_token_info\n' +
            'WHERE\n' +
            '\tright_token_info.id_type = 3 OR \n' +
            '\tright_token_info.id_type = 5 OR \n' +
            '\tright_token_info.id_type = 6 OR \n' +
            '\tright_token_info.id_type = 7 OR \n' +
            '\tright_token_info.id_type = 8 OR \n' +
            '\tright_token_info.id_type = 9');
        console.log(sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log(sqlRes);
        let InPersonalNum = 0;
        sqlRes.forEach(function(item,index){
            InPersonalNum = item['num'];
        });
        sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(right_token_info.copyright_id) AS num\n' +
            'FROM\n' +
            '\tright_token_info\n' +
            'WHERE\n' +
            '\tright_token_info.id_type = 1 OR \n' +
            '\tright_token_info.id_type = 2 OR \n' +
            '\tright_token_info.id_type = 4');
        console.log(sqlRight);
        sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log(sqlRes);
        let PersonalNum = 0;
        sqlRes.forEach(function(item,index){
            PersonalNum = item['num'];
        });

        CopyRightAmountGroupByIDtype = {
            "个人账户数目" : PersonalNum,
            "非个人账户数目": InPersonalNum,
        };
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
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(right_token_info.copyright_id) AS num, \n' +
            '\tright_token_info.copyright_type\n' +
            'FROM\n' +
            '\tright_token_info\n' +
            'GROUP BY\n' +
            '\tright_token_info.copyright_type\n' +
            'ORDER BY\n' +
            '\tright_token_info.copyright_type');
        console.log(sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log(sqlRes);
        let AmountGroup = {};
        sqlRes.forEach(function(item,index){
            AmountGroup[index] = item['num'];
        });
        console.log(AmountGroup);
        CopyRightAmountGroupByIDtype = {
            "复制权" : AmountGroup[0],
            "发行权" : AmountGroup[1],
            "出租权" : AmountGroup[2],
            "展览权" : AmountGroup[3],
            "表演权" : AmountGroup[4],
            "放映权" : AmountGroup[5],
            "广播"   : AmountGroup[6],
            "信息网络传播权" : AmountGroup[7],
            "摄制权" : AmountGroup[8],
            "改编权" : AmountGroup[9],
            "翻译权" : AmountGroup[10],
            "汇编权" : AmountGroup[11],
            "其他"   : AmountGroup[12]
        }
    }
    else {
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






// /** 监测维权服务 等待百度文档
//  *
//  *
//  */
// // 一维图（一个自变量）
// // 1）	存证总数量随时间的变化。
// export async function handleCertificateAmountEXchange(req, res) {

//     console.time('handleCertificateAmountEXchange');
//     let sqlRes = await getCertificateAmountEXchange();

//     console.timeEnd('handleCertificateAmountEXchange');
//     console.log('--------------------');
//     return sqlRes;
// }

// async function getCertificateAmountEXchange() {
//     let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
//     // console.log([TimeStampArray, MonthArray]);
//     let CertificateAmountEXchange = [];
//     for (let index = 0; index < 12; index++) {
//         let endTimeStamp = TimeStampArray[index];
//         let startTimeStamp = TimeStampArray[(index + 1)];
//         let sqlRight =util.format(
//             'work_info.created_time >= %s\
//                  AND\
//             work_info.created_time < %s'
//             ,endTimeStamp,startTimeStamp);
//         // console.log(sqlRight);
//         let value = localUtils.randomNumber(30,50);
//         // sqlRes = await mysqlUtils.sql(c, sqlRight);
//         // // console.log(sqlRes);
//         // sqlRes.forEach(value => 
//         //     Res[i][value['address']] = value['COUNT(right_token_info.address)']
//         // );
        
//         let MonthInfo = {
//             "CertificateAmount": value,
//             "Month" : MonthArray[index + 1],
//         };
//         CertificateAmountEXchange.push(MonthInfo);
//     }
//     console.log(CertificateAmountEXchange);
//     return CertificateAmountEXchange;
// }