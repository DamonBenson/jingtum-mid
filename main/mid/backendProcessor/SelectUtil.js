import util from "util";
import * as mysqlUtils from "../../../utils/mysqlUtils.js";
import {c} from "../MidBackend.js";
import {WORKTYPE} from "../../../utils/info.js";

/**
 * @file: SelectUtil.js
 * @Description: 按日期查询；单字段分组查询；多字段分组查询
 * @author Bernard
 * @date 2021/5/31
 */

export async function selectGroupBy(table, byKey,limit = 3) {
    let sqlRight = util.format(
        'SELECT\n' +
        '\t*\n' +
        'FROM\n' +
        '\t(\n' +
        '\t\tSELECT\n' +
        '\t\t\t%s.%s, \n' +
        '\t\t\tCOUNT(%s.%s) AS num\n' +
        '\t\tFROM\n' +
        '\t\t\t%s\n' +
        '\t\tGROUP BY\n' +
        '\t\t\t%s.%s\n' +
        '\t) AS Type\n' +
        'ORDER BY\n' +
        '\tnum DESC\n' +
        'LIMIT %d', table, byKey,
        table, byKey,
        table,
        table, byKey, limit
    );
    console.log("sqlRight:", sqlRight);
    let sqlRes = await mysqlUtils.sql(c, sqlRight);
    console.log("sqlRes:", sqlRes);
    let Res = {};
    sqlRes.forEach(value =>
        Res[[value[byKey]]] = value['num']
    );
    return Res;
}
