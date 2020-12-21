import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {chains, userMemo, debugMode} from '../../utils/info.js';

const msPerUpload = 6000; // 上传作品间隔时间

const a2 = chains[0].account.a[2].address; // 版权人账号(存证链帐号2)

setInterval(async function() {

    // 开始计时
    console.log('start uploading...');
    let sTs = (new Date()).valueOf();

    // 发送上传请求至http服务器mainMid.js
    let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 随机选择作品信息
    let uploadInfo = userMemo[randFlag];
    delete uploadInfo.work; // 作品暂时由mainMid.js上传
    let uploadReq = {
        addr: a2,
        uploadInfo: uploadInfo,
    }
    if(debugMode) {
        console.log('upload:', uploadReq);
    }
    else {
        console.log('upload:', uploadReq.uploadInfo.workName);
    }
    /* upload: {
        addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
        uploadInfo: {
            workName: 'm1_',
            createdTime: 1579017600,
            publishedTime: 1579017600,
            workType: 0,
            workForm: 0,
            workField: 0
        }
    } */
    await fetch.postData('http://127.0.0.1:9001/uploadReq', uploadReq);

    // 结束计时
    let eTs = (new Date()).valueOf();
    console.log('----------' + (eTs - sTs) + 'ms----------');

}, msPerUpload);