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

import util from 'util';

import mysql from 'mysql';
import {c} from "../MidBackend.js";
const WORKTYPE = {
    1:"文字",2:"口述",3:"音乐",4:"戏剧",5:"曲艺",
    6:"舞蹈",7:"杂技艺术",8:"美术",9:"建筑",10:"摄影",
    11:"电影和类似摄制电影方法创作的作品",12:"图形",13:"模型",14:"其他"
};
const CONNECT = false;// When false, Send Random Response

/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/5/25 17:08
 * @description:发现的侵权总数量随时间的变化。
 * @example:.
 *
 */
export async function handleTortCountExchange(req, res) {

    console.time('handleTortCountExchange');
    let sqlRes = await getTortCountExchange();
    console.timeEnd('handleTortCountExchange');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountExchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let TortCountExchange = [];
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
        TortCountExchange.push(MonthInfo);
    }
    TortCountExchange.reverse();
    console.log(TortCountExchange);
    return TortCountExchange;
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前不同作品类型或者不同创作类型下发生的侵权数量分布。
 * @example:.
 *
 */
export async function handleTortCountGroupByCreationType(req, res) {

    console.time('handleTortCountGroupByCreationType');
    let sqlRes = await getTortCountGroupByCreationType();
    console.timeEnd('handleTortCountGroupByCreationType');
    console.log('--------------------');
    return sqlRes;
}

async function getTortCountGroupByCreationType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    if(CONNECT == true){
        console.log("CONNECT =",CONNECT);
    }
    else{
        WorkTypeInfo = {
            "workType":"音乐",
            "TortCount":localUtils.randomNumber(80,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"电影",
            "TortCount":localUtils.randomNumber(60,80)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"美术",
            "TortCount":localUtils.randomNumber(40,60)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
}

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
            "workType":"音乐",
            "TortCount":localUtils.randomNumber(80,100)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"电影",
            "TortCount":localUtils.randomNumber(60,80)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
        WorkTypeInfo = {
            "workType":"美术",
            "TortCount":localUtils.randomNumber(40,60)
        };
        TortCountGroupByWorkType.push(WorkTypeInfo);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
}