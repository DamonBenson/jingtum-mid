import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {userMemo, debugMode} from '../../utils/info.js';

const msPerUpload = 5000; // 上传作品间隔时间

var count = 0;

async function postUploadReq() {

    // 开始计时
    console.time('uploadReq');

    // 发送上传请求至http服务器mainMid.js
    let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 随机选择作品信息
    let uploadReq = {...userMemo[randFlag]};
    uploadReq.workName = uploadReq.workName + count++;
    if(debugMode) {
        console.log('upload:', uploadReq);
    }
    else {
        console.log('upload:', uploadReq.workName);
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
    await fetch.postData('http://127.0.0.1:9001/upload/init', uploadReq);

    // 结束计时
    console.timeEnd('uploadReq');
    console.log('--------------------');

}

setInterval(postUploadReq, msPerUpload);