import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as fetch from '../../../utils/fetch.js';
import util from 'util';
import * as OrderGenerate from './OrderGenerate.js';


import {chains, userAccount, userAccountIndex, buyOrderContractAddrs, debugMode} from '../../../utils/info.js';
const MidIP = '39.102.93.47';// 中间层服务器IP
// const MidIP = 'localhost';// 本地IP
const msPerBuyOrder = 5000;
// const subBuyOrderListAmount = 3; 随机个数
const platformAddr = userAccount[userAccountIndex['买方平台账号']].address; // 平台账号
const platformSecret = userAccount[userAccountIndex['买方平台账号']].secret;
const buyerAddr = [ userAccount[userAccountIndex['用户1']].address,
                    userAccount[userAccountIndex['用户2']].address,
                    userAccount[userAccountIndex['用户3']].address,
                    userAccount[userAccountIndex['用户4']].address,
                    userAccount[userAccountIndex['用户5']].address,
                    userAccount[userAccountIndex['用户6']].address,];


// setInterval(postBuyOrderReq, msPerBuyOrder);

const contractChain = chains[1];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});
const outband = false;
// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    // setInterval(postBuyOrderReq, msPerBuyOrder);
    postBuyOrderReq();
    // localUtils.sleep(5000)
    // exit();

});

async function postBuyOrderReq(BUYORDER = null) {

    console.time('buyOrderReq');
    
    let buyOrder = null;
    if(BUYORDER != null){
        buyOrder = BUYORDER;
    }
    // 无参时：构造
    else{
        if(outband == true){
            buyOrder = OrderGenerate.generateBuyOrderOutBand();

            console.log('generateBuyOrderOutBand');
        }
        else{
            buyOrder = OrderGenerate.generateBuyOrder();
            
            console.log('generateBuyOrder');
        }
    }

    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }

    let unsignedRes = await fetch.postData(util.format('http://%s:9001/transaction/buy', MidIP), buyOrder);
    let unsignedResInfo = JSON.parse(Buffer.from(unsignedRes.body._readableState.buffer.head.data).toString());
    let txJson = unsignedResInfo.data.tx_json;
    let unsignedTx = {
        tx_json: txJson,
    };
    if(debugMode) {
        console.log('unsigned buy order:', unsignedResInfo);
    }
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;

    let signedRes = await fetch.postData(util.format('http://%s:9001/transaction/signedBuy', MidIP), blob);
    if(debugMode) {
        let resInfo = JSON.parse(Buffer.from(signedRes.body._readableState.buffer.head.data).toString());
        console.log('signed buy order:', resInfo);
    }

    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}