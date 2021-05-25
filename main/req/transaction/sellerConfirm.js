import jlib from 'jingtum-lib';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as httpUtils from '../../../utils/httpUtils.js';
import {getConsumer} from '../../../utils/kafkaUtils/getConsumer.js';

import {chains, userAccount, sellOrderContractAddrs, debugMode} from '../../../utils/info.js';

const platformAddr = userAccount[5].address;
const platformSecret = userAccount[5].secret;

const contractChain = chains[1];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    let mq = await getConsumer();
    mq.ConConsumer(undefined, [{'topic': 'SellOrderContractAddr_BuyerConfirmTxs'}], undefined, postSellerConfirmReq);

});

async function postSellerConfirmReq(msg) {

    console.time('sellerConfirmReq');

    msg.value = JSON.parse(msg.value);
    let sellOrderId = msg.value.sellOrderId;
    let buyOrderInfo = msg.value.buyOrderInfo;

    let confirmMsg = {
        contractAddr: sellOrderContractAddrs[0],
        platformAddr: platformAddr,
        sellOrderId: sellOrderId,
        buyOrderInfo: buyOrderInfo,
    }

    let sellerConfirmRes = await httpUtils.post('http://127.0.0.1:9001/transaction/sellerApproveConfirm', confirmMsg);
    let buf = Buffer.from(sellerConfirmRes.body._readableState.buffer.head.data);
    let txJson = JSON.parse(buf.toString());
    let unsignedTx = {
        tx_json: txJson,
    };
    jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
    jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
    jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
    let blob = unsignedTx.tx_json.blob;
    await httpUtils.post('http://127.0.0.1:9001/transaction/signedSellerApproveConfirm', blob);

    console.timeEnd('sellerConfirmReq');
    console.log('--------------------');

}