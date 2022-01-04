import * as monitorValidate from '../../../utils/validateUtils/monitor.js';
import * as tx from '../../../utils/jingtum/tx.js';

import {userAccount} from '../../../utils/config/jingtum.js';

const monitorAddr = userAccount.buptMonitorAccount.address; // 中间层-监测
const monitorSecr = userAccount.buptMonitorAccount.secret; // 中间层-监测
const midAddr = userAccount.midAccount.address; // 中间层

/**
 * @description 证据上链，中间层签名。
 * @param {Datetime}monitorTime 监测时间
 * @param {String}tortUrl 侵权链接
 * @param {String}tortTitle 侵权标题
 * @param {String}siteName 侵权站点名称
 * @param {String}sampleId 监测作品唯一值
 * @param {String}tortNum 侵权编号
 * @param {String}author 侵权链接发布者
 * @param {int}commentCount 评论数
 * @param {int}duration 侵权音乐作品的时长 单位秒
 * @param {int}workId 作品标识
 * @param {String}ipfsAddress 侵权证据文件IPFS地址
 * @returns {Object[]} 证据上链结果，包括：交易哈希hash
 */

export async function handleEvidence(uploadRemote, seqObj, req) {

    console.time('handleEvidence');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await monitorValidate.evidenceReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/monitor/evidence:', resInfo.data);
        console.timeEnd('handleEvidence');
        console.log('--------------------');
        return resInfo;
    }

    let evidenceInfo = JSON.stringify(body);
    
    let res = await tx.buildPaymentTx(uploadRemote, monitorAddr, monitorSecr, seqObj.monitor.upload++, midAddr, 0.00001, evidenceInfo, true);

    resInfo.data.hash = res.tx_json.hash;
    console.log('/monitor/evidence:', resInfo.data);

    console.timeEnd('handleEvidence');
    console.log('--------------------');

    return resInfo;

}