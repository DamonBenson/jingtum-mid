import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {mysqlConf} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

/*----------构造上传买单的交易----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {contact} 买方联系方式
 * @param {orderInfo} 买单信息
 * @return {unsignedTx} 用以在链上上传买单的待签名交易
 */
export async function handleAuthRightRate(req, res) {

    console.time('handleBuyOrder');
    // 获取AuthRightRate
    let [WorkAmount,RightAmount] = await getAuthRightRate();
    
    res.send({'WorkAmount':WorkAmount,"RightAmount":RightAmount});
    
    
    console.timeEnd('handleBuyOrder');
    console.log('--------------------');
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


