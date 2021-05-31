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
import {selectGroupBy} from "./SelectUtil.js";

import util from 'util';

import mysql from 'mysql';
import {c} from "../MidBackend.js";
import {debugMode, WORKTYPE, CREATIONTYPE, TORTSITE} from '../../../utils/info.js';

const CONNECT = false;// When false, Send Random Response

/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/5/25 17:08
 * @description:发现的侵权总数量随时间的变化。
 */
export async function handleTortCountEXchange(req, res) {

    console.time('handleTortCountEXchange');
    let sqlRes = await getTortCountEXchange();
    console.timeEnd('handleTortCountEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let TortCountEXchange = [];
    let valueRes = 0;
    for (let index = 0; index < 12; index++) {
        if(CONNECT == true){
            console.log("CONNECT =",CONNECT);
        }
        else{
            valueRes = localUtils.randomNumber(30,50);
        }
        console.log("valueRes =",valueRes);
        let MonthInfo = {
            "TortCount": valueRes,
            "Month" : MonthArray[index + 1],
        };
        TortCountEXchange.push(MonthInfo);
    }
    TortCountEXchange.reverse();
    console.log(TortCountEXchange);
    return TortCountEXchange;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: WorkType
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前不同作品类型或者不同作品类型下发生的侵权数量分布。
 */
export async function handleTortCountGroupByWorkType(req, res) {

    console.time('handleTortCountGroupByWorkType');
    let sqlRes = await getTortCountGroupByWorkType();
    console.timeEnd('handleTortCountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByWorkType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        WorkTypeInfo = {
            "workType":WORKTYPE["1"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["2"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["3"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["4"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["5"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["6"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前不同作品类型或者不同创作类型下发生的侵权数量分布。
 */
export async function handleTortCountGroupByCreationType(req, res) {

    console.time('handleTortCountGroupByCreationType');
    let sqlRes = await getTortCountGroupByCreationType();
    console.timeEnd('handleTortCountGroupByCreationType');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByCreationType() {
    let TortCountGroupByCreationType = [];
    let CreationTypeInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        CreationTypeInfo = {
            "creationType":CREATIONTYPE["3"],
            "TortCount":localUtils.randomNumber(80,100)
        };
        TortCountGroupByCreationType.push(CreationTypeInfo);
        CreationTypeInfo = {
            "creationType":CREATIONTYPE["2"],
            "TortCount":localUtils.randomNumber(60,80)
        };
        TortCountGroupByCreationType.push(CreationTypeInfo);
        CreationTypeInfo = {
            "creationType":CREATIONTYPE["1"],
            "TortCount":localUtils.randomNumber(40,60)
        };
        TortCountGroupByCreationType.push(CreationTypeInfo);
    }
    console.log(TortCountGroupByCreationType);
    return TortCountGroupByCreationType;
}


/*
 * @param req: 请求
 * @param res: 返回
 * @return: WorkType
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:3）	不同作品类型的侵权数量随时间的变化。
 */
export async function handleTortCountGroupByWorkTypeEXchange(req, res) {

    console.time('handleTortCountGroupByWorkTypeEXchange');
    let sqlRes = await getTortCountGroupByWorkTypeEXchange();
    console.timeEnd('handleTortCountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByWorkTypeEXchange() {
    let TortCountGroupByWorkTypeEXchange = [];
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    let WorkTypeInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        for (let index = 0; index < 12; index = index + MonthGap) {
            let TortCountGroupByWorkType = [];
            WorkTypeInfo = {
                "workType":WORKTYPE["1"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":WORKTYPE["2"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":WORKTYPE["3"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
            TortCountGroupByWorkTypeEXchange.push(TortCountGroupByWorkType);
        }
    }
    console.log(TortCountGroupByWorkTypeEXchange);
    return TortCountGroupByWorkTypeEXchange;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:不同创作类型的侵权数量随时间的变化。
 */
export async function handleTortCountGroupByCreationTypeEXchange(req, res) {

    console.time('handleTortCountGroupByCreationTypeEXchange');
    let sqlRes = await getTortCountGroupByCreationTypeEXchange();
    console.timeEnd('handleTortCountGroupByCreationTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByCreationTypeEXchange() {
    let TortCountGroupByCreationTypeEXchange = [];
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    let CreationTypeInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        for (let index = 0; index < 12; index = index + MonthGap) {
            let TortCountGroupByWorkType = [];
            CreationTypeInfo = {
                "creationType":CREATIONTYPE["1"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(CreationTypeInfo);
            CreationTypeInfo = {
                "creationType":CREATIONTYPE["2"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(CreationTypeInfo);
            CreationTypeInfo = {
                "creationType":CREATIONTYPE["3"],
                "TortCount":localUtils.randomNumber(40,100),
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByWorkType.push(CreationTypeInfo);
            TortCountGroupByCreationTypeEXchange.push(TortCountGroupByWorkType);
        }
    }
    console.log(TortCountGroupByCreationTypeEXchange);
    return TortCountGroupByCreationTypeEXchange;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前，在前N个侵权站点，发现的侵权数量分布。
 */
export async function handleTortCountGroupByTortSite(req, res) {

    console.time('handleTortCountGroupByTortSite');
    let sqlRes = await getTortCountGroupByTortSite();
    console.timeEnd('handleTortCountGroupByTortSite');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByTortSite() {
    let TortCountGroupByTortSite = [];
    let TortSiteInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        TortSiteInfo = {
            "TortSite":TORTSITE["3"],
            "TortCount":localUtils.randomNumber(80,100)
        };
        TortCountGroupByTortSite.push(TortSiteInfo);
        TortSiteInfo = {
            "TortSite":TORTSITE["2"],
            "TortCount":localUtils.randomNumber(60,80)
        };
        TortCountGroupByTortSite.push(TortSiteInfo);
        TortSiteInfo = {
            "TortSite":TORTSITE["1"],
            "TortCount":localUtils.randomNumber(40,60)
        };
        TortCountGroupByTortSite.push(TortSiteInfo);
    }
    console.log(TortCountGroupByTortSite);
    return TortCountGroupByTortSite;
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前，在前N个侵权站点，发现的侵权数量分布。
 */
export async function handleTortCountGroupByTortSiteEXchange(req, res) {

    console.time('handleTortCountGroupByTortSiteEXchange');
    let sqlRes = await getTortCountGroupByTortSiteEXchange();
    console.timeEnd('handleTortCountGroupByTortSiteEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByTortSiteEXchange() {
    let TortCountGroupByTortSiteEXchange = [];
    let TortSiteInfo = {};
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        for (let index = 0; index < 12; index = index + MonthGap) {
            let TortCountGroupByTortSite = [];
            TortSiteInfo = {
                "TortSite": TORTSITE["3"],
                "TortCount": localUtils.randomNumber(80, 100),
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortSiteInfo = {
                "TortSite": TORTSITE["2"],
                "TortCount": localUtils.randomNumber(60, 80),
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortSiteInfo = {
                "TortSite": TORTSITE["1"],
                "TortCount": localUtils.randomNumber(40, 60),
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortCountGroupByTortSiteEXchange.push(TortCountGroupByTortSite);
        }
    }
    console.log(TortCountGroupByTortSiteEXchange);
    return TortCountGroupByTortSiteEXchange;
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard1
 * @date: 2021/5/25 17:31
 * @description:截止当前，前N个侵权站点发现的侵权数量在不同作品类型下的分布。
 */
export async function handleTortCountGroupByTortSiteGroupByWorkType(req, res) {

    console.time('handleTortCountGroupByTortSiteGroupByWorkType');
    let sqlRes = await getTortGroupByTortSiteGroupByWorkType();
    console.timeEnd('handleTortCountGroupByTortSiteGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortGroupByTortSiteGroupByWorkType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    if(CONNECT == true){
        selectGroupBy("tort_info","WorkType",6)
        console.log("CONNECT =",CONNECT);
    }
    else{
        WorkTypeInfo = {
            "workType":WORKTYPE["1"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["2"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["3"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["4"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["5"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":WORKTYPE["6"],
            "TortCount":localUtils.randomNumber(40,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
}