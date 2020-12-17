import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {userMemo, debugMode} from '../../utils/info.js';

const uploadPerLedger = 1; // 每个帐本（10s）上传作品数

setInterval(async function() {

    // 开始计时
    console.log('start uploading...');
    let sTs = (new Date()).valueOf();

    // 发送上传请求至http服务器mainMid.js
    let uploadReqArr = new Array(uploadPerLedger);
    for(let i = uploadPerLedger - 1; i >= 0; i--) {
        let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 随机选择作品信息
        let uploadInfo = userMemo[randFlag];
        delete uploadInfo.work; // 作品暂时由mainMid.js上传
        if(debugMode) {
            console.log('upload', uploadInfo);
        }
        else {
            console.log('upload', uploadInfo.workName);
        }
        /* upload {
            workName: 'm2_',
            createdTime: 1579017600,
            publishedTime: 1579017600,
            workType: 1,
            workForm: 1,
            workField: 1
        } */
        uploadReqArr[i] = fetch.postData('http://127.0.0.1:9001/uploadReq', uploadInfo);
    }
    await Promise.all(uploadReqArr);

    // 结束计时
    let eTs = (new Date()).valueOf();
    console.log('----------' + (eTs - sTs) + 'ms----------');

}, 10000); // 按账本间隔（10s）发送请求