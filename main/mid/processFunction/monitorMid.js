import * as monitorValidate from '../../../utils/validateUtils/monitor.js';
import * as tx from '../../../utils/jingtum/tx.js';

import {userAccount} from '../../../utils/config/jingtum.js';

const monitorAddr = userAccount.buptMonitorAccount.address; // 中间层-监测
const monitorSecr = userAccount.buptMonitorAccount.secret; // 中间层-监测
const midAddr = userAccount.midAccount.address; // 中间层

/**
 * @description 证据上链，中间层签名。
 * @param {int}workId 作品标识
 * @param {String}sampleId 监测文件标识
 * @param {String}evidenceNo 侵权证据标识
 * @param {String}url 侵权网页地址
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