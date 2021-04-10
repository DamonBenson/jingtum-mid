import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';
import sha256 from 'crypto-js/sha256.js';

import {userMemo, userAccount, debugMode} from '../../utils/info.js';

const msPerUpload = 20000; // 上传作品间隔时间

var count = 0;

async function postUploadReq() {

    // 开始计时
    console.time('uploadReq');

    // 发送上传请求至http服务器mainMid.js.

    // @old_version
    // let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 随机选择作品信息
    // let uploadReq = {...userMemo[randFlag]};
    // uploadReq.workName = uploadReq.workName + count++;
    // if(debugMode) {
    //     console.log('upload:', uploadReq);
    // }
    // else {
    //     console.log('upload:', uploadReq.workName);
    // }
    /* upload: {
    addr: 'jUy7sbmrwaphoPdACnZnxeKAAEqG46WkCC',     
    workName: 'm1_0',
    createdTime: 1579017600,
    publishedTime: 1579017600,
    workType: 0,
    workForm: 0,
    workField: 0
    } */

    // @new_version
    let randFlag = localUtils.randomSelect([0, 1, 2, 3], [0.1, 0.2, 0.3, 0.4]); // 作品越来越多
    let timeNow = 0;
    switch(randFlag){
            case 0:
                timeNow = Math.round((new Date()-localUtils.randomNumber(90, 120)*24*3600)/ 1000);
                break;
            case 1:
                timeNow = Math.round((new Date()-localUtils.randomNumber(60, 90)*24*3600)/ 1000);
                break;
            case 2:
                timeNow = Math.round((new Date()-localUtils.randomNumber(30, 60)*24*3600)/ 1000);
                break;
            case 3:
                timeNow = Math.round((new Date()-localUtils.randomNumber(0, 30)*24*3600)/ 1000);   
                break;
            default:
                timeNow = Math.round((new Date())/ 1000);
    }
    let upload ={
        addr : userAccount[6].address,
        work_name : sha256(localUtils.randomNumber(100, 100000).toString()).toString(),
        created_time : timeNow,
        published_time : Math.round((new Date())/ 1000),
        work_type : localUtils.randomSelect([0, 1, 2, 3]),
        work_form : localUtils.randomSelect([0, 1, 2, 3]),
        work_field : localUtils.randomSelect([0, 1, 2, 3]),
    };
    let uploadReq = {...upload};
    if(debugMode) {
        console.log('upload:', uploadReq);
    }
    else {
        console.log('upload:', uploadReq.workName);
    }
    /* upload {
        addr: 'jL8QgMCYxZCiwwhQ6RQBbC25jd9hsdP3sW',
        work_name: 'm1_',
        created_time: 1579017600,
        published_time: 1579017600,
        work_type: 0,
        work_form: 0,
        work_field: 0,
        //**generate in MidHandle    
        //work_hash: 'QmcpdLr5gy6dWpGjuQgwuYPzsBJRXc7efbdTeDUTABQaD3',
        //work_id: '7EEC480EEA01B81365B24362318698E1FA372F902E9B77531202E4E8A3852A12',       
        //upload_time: 1608517640
    } */
    await fetch.postData('http://127.0.0.1:9001/upload/init', uploadReq);

    // 结束计时
    console.timeEnd('uploadReq');
    console.log('--------------------');

}

setInterval(postUploadReq, msPerUpload);