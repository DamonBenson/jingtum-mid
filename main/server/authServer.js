import jlib from 'jingtum-lib';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as httpUtils from '../../utils/httpUtils.js';
import {getConsumer} from '../../utils/kafkaUtils/getConsumer.js';

import {userAccount, chains, contractAddr} from '../../utils/config/jingtum.js';
import {debugMode} from '../../utils/config/project.js';

const authenticateAddr = userAccount.authenticateAccount.address;
const authenticateSecr = userAccount.authenticateAccount.secret;

const Remote = jlib.Remote;
const contractChain = chains[2];
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(authenticateAddr, contractRemote, false)).account_data.Sequence;

    let mq = await getConsumer();
    mq.ConConsumer(undefined, [{'topic': contractAddr.authenticate[index] + '_AuthenticateReq'}], undefined, postAuthenticateReq);

});

async function postAuthenticateReq(msg) {

    console.time('postAuthenticateReq');

    msg.value = JSON.parse(msg.value);
    let authenticateMsg = await generateAuthenticateMsg(msg);

    if(debugMode) {
        console.log(authenticateMsg);
    }

    let txJson = await httpUtils.post('http://127.0.0.1:9001/auth/copyright', authenticateMsg);
    let unsignedTx = {
        tx_json: txJson,
    };
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, authenticateSecr);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;
    let submitRes = await httpUtils.post('http://127.0.0.1:9001/auth/signedCopyright', blob);

    if(debugMode) {
        console.log(submitRes);
    }

    console.timeEnd('postAuthenticateReq');
    console.log('--------------------');

}

async function generateAuthenticateMsg(msg) {

}