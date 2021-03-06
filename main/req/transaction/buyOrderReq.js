import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as httpUtils from '../../../utils/httpUtils.js';
import util from 'util';
import * as OrderGenerate from './OrderGenerate.js';

import {userAccount, chains} from '../../../utils/config/jingtum.js';
import {debugMode} from '../../../utils/config/project.js';

const ip = 'localhost';
const msPerBuyOrder = 5000;
// const subBuyOrderListAmount = 3; 随机个数
const platformAddr = userAccount.platformAccount[0].address; // 平台账号
const platformSecret = userAccount.platformAccount[0].secret;
const buyerAddr = userAccount.normalAccount.map(acc => acc.address);


// setInterval(postBuyOrderReq, msPerBuyOrder);

const contractChain = chains[2];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});
const outband = false;
// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
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
    if(BUYORDER != null) {
        buyOrder = BUYORDER;
    }
    // 无参时：构造
    else {
        if(outband == true){
            buyOrder = OrderGenerate.generateBuyOrderOutBand();

            console.log('generateBuyOrderOutBand');
        }
        else {
            buyOrder = OrderGenerate.generateBuyOrder();
            
            console.log('generateBuyOrder');
        }
    }

    if(debugMode) {
        console.log('buyOrder:', buyOrder);
    }

    let unsignedResInfo = await httpUtils.post(util.format('http://%s:9001/transaction/buy', ip), buyOrder);
    console.log(unsignedResInfo);
    let txJson = unsignedResInfo.data.unsignedTx;
    let unsignedTx = {
        tx_json: txJson,
    };
    if(debugMode) {
        console.log('unsigned buy order:', unsignedResInfo.data.unsignedTx);
    }
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;

    let resInfo = await httpUtils.post(util.format('http://%s:9001/transaction/signedBuy', ip), {blob: blob});
    if(debugMode) {
        console.log('signed buy order:', resInfo);
    }

    console.timeEnd('buyOrderReq');
    console.log('--------------------');

}