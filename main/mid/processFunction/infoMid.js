import * as tx from '../../../utils/jingtum/tx.js';

import {userAccount} from '../../../utils/info.js';

// 中间层账号
const a9 = userAccount[9].address;
const s9 = userAccount[9].secret;

/*----------激活账号----------*/

export async function handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleActivateAccount');

    let body = JSON.parse(Object.keys(req.body)[0]);

    body.map(addr => {
        await tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, addr, 10000, 'Activate account.', true);
    })

    console.timeEnd('handleActivateAccount');
    console.log('--------------------');

}

/*----------查询作品信息----------*/

export async function handleWorkInfo(uploadRemote, seqObj, req, res) {

    console.time('handleWorkInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    body.map(addr => {
        await tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, addr, 10000, 'Activate account.', true);
    })

    console.timeEnd('handleWorkInfo');
    console.log('--------------------');

}

/*----------查询版权通证信息----------*/

export async function handleCopyrightInfo(tokenRemote, seqObj, req, res) {

    console.time('handleCopyrightInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    body.map(addr => {
        await tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, addr, 10000, 'Activate account.', true);
    })

    console.timeEnd('handleCopyrightInfo');
    console.log('--------------------');

}

/*----------查询许可通证信息----------*/

export async function handleApproveInfo(tokenRemote, seqObj, req, res) {

    console.time('handleApproveInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    body.map(addr => {
        await tx.buildPaymentTx(a9, s9, uploadRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, tokenRemote, seqObj.a9.token++, addr, 10000, 'Activate account.', true);
        await tx.buildPaymentTx(a9, s9, contractRemote, seqObj.a9.contract++, addr, 10000, 'Activate account.', true);
    })

    console.timeEnd('handleApproveInfo');
    console.log('--------------------');

}