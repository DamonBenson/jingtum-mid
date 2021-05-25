import * as localUtils from '../localUtils.js';
import * as httpUtils from '../../utils/httpUtils.js';

import {userAccount, debugMode} from '../info.js';

export default function WorkInfo() {

    this.workId = null;
    this.uploadTime = null;
    this.ipfsHash = null;

    if(!arguments.length) {
        this.addr = localUtils.randomSelect(userAccount, [0.2, 0.3, 0.5]).address;
        this.workHash = 'QmQU2gS4gZ7TpiTECjDUxdQFd9bBBEWxDxPPfhLfYHVuei';
        this.workName = localUtils.randomString(10);
        this.createdTime = localUtils.randomNumber(1577808000, 1593532800);
        this.publishedTime = localUtils.randomNumber(1593532800, 1609430400);
        this.workType = localUtils.randomSelect([0, 1, 2], [0.2, 0.3, 0.5]);
        this.workForm = localUtils.randomSelect([0, 1, 2], [0.2, 0.3, 0.5]);
        this.workField = localUtils.randomSelect([0, 1, 2], [0.2, 0.3, 0.5]);
    }
    else {
        Object.assign(this, arguments[0]);
    }

    this.sendReq = (async function sendReq() {
        let filter = [addr, workHash, workName, createdTime, publishedTime, workType, workForm, workField];
        let uploadReq = JSON.stringify(this, filter);
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
        await httpUtils.post('http://127.0.0.1:9001/uploadReq', uploadReq);
    }).bind(this);
}