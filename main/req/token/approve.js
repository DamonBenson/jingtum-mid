import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as fetch from '../../../utils/fetch.js'

import {userAccount} from "../../../utils/config/jingtum.js";
import {mysqlConf} from '../../../utils/config/mysql.js';
import {debugMode} from '../../../utils/config/project.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const buyerAddr = userAccount.normalAccount[1].address;
const sellerAddr = userAccount.normalAccount[0].address;
const sellerSecr = userAccount.normalAccount[0].secret;

const sellOrderAmount = 1;

let sql = sqlText.table('right_token_info').field('work_id').where({address: sellerAddr}).order('RAND()').limit(sellOrderAmount).select();
let sellOrderInfoList = (await mysqlUtils.sql(c, sql)).map(res => {
    return {
        sellerAddr: sellerAddr,
        sellerSecret: sellerSecr,
        workId: res.work_id,
    }
});

let approveConfirmReq = {
    buyOrderInfo: {
        buyerAddr: buyerAddr,
        authorizationScene: 0,
        authorizationChannel: 0,
        authorizationArea: 0,
        authorizationTime: 0,
    },
    sellOrderInfoList: sellOrderInfoList,
};

if(debugMode) {
    console.log('approveConfirmReq:', approveConfirmReq);
}

let res = await fetch.postData('http://127.0.0.1:9001/transaction/approveConfirm', approveConfirmReq);
if(debugMode) {
    let resInfo = JSON.parse(Buffer.from(res.body._readableState.buffer.head.data).toString());
    console.log('resInfo:', resInfo.data.approveResultList);
}