import * as kafka from 'kafka-node';
import {debugMode} from '../info.js';
export async function produceSellOrder(msg) {
    if (debugMode){console.time('produceSellOrder',msg);}; //debugMode
    try{
        var _msg = {
            topic:[produceTopic], 
            messages:[JSON.stringify({
                OrderId	            :'买单标识:0x57A689E'             ,	              //买单标识	Y
                SubBuyOrderList	    :'子买单:0x57A689D'          	    ,             //子买单	Y
                LimitPrice          :1500	          	    ,                 //限价	Y
                TradeStrategy	    :0   	        ,             //交易策略	Y
                AuthorizationInfo	:'授权信息:全授权'   	        ,         //授权信息	Y
                Side	            :1      	    ,                 //订单类型	Y
                BuyerAddr	        :'买方用户地址:0x04A689C'   	    ,            //买方用户地址	Y
                Contact	            :'买房用户联系方式:13505940287'     , 	              //买房用户联系方式	Y
                PlatformAddr	    :'买方平台地址:0x00B689C'    	    ,            //买方平台地址	Y
                TimeStamp	        :4654337   	                     //时间戳	Y
                })],
            key: 'theKey',
            partition: 0
        }

        console.log("会怎么样(´･ᆺ･`)");//尝试鼓励一下
        mq.mq_producers['common'].send([_msg], function (err, data){
            if(err == null)
                console.log("啊哈ヾ ^_^♪");//成功高兴一下
            else
            {
                console.log("err：",err);
                console.log("_msg：",_msg);
                console.log("出错啦(｡•́︿•̀｡)");//失败安慰一下
            }
            console.log("data：",data);
            console.log("..... ");
            })
    }
    catch{
        producer.createTopics([produceTopic], function (){
            console.log("主题造一下");});
        
    }
    
}

export async function produceSellerConfirmTxs(msg) {
    if (debugMode){console.time('produceSellerConfirmTxs',msg);}; //debugMode

}

export async function produceSellerConfirmTxs(msg) {
    if (debugMode){console.time('produceSellerConfirmTxs',msg);}; //debugMode

}
export async function postBuyerConfirmReq(msg) {

    console.time('buyerConfirmReq');
    //  处理消息队列的消息
    msg.value = JSON.parse(msg.value);
    let buyOrderInfo = msg.value.buyOrderInfo;
    let sellOrderInfo = msg.value.sellOrderInfo;
    let sellOrderAmount = sellOrderInfo.length;
    //  继续提取合约地址、卖单ID
    let contractAddrs = (new Array(sellOrderAmount)).fill(sellOrderContractAddr);
    let sellOrderIds = sellOrderInfo.map(order => {
        return order.orderId;
    })
    let expireTime = 86400;
    //  再生数据结构
    let confirmMsg = {
        contractAddrs: contractAddrs, // 合约列表
        addr: platformAddr,
        sellOrderId: sellOrderIds, // 订单列表
        expireTime: expireTime,
        buyOrderInfo: buyOrderInfo,
    }
    //  提交买单确认信息
    let buyerConfirmRes = await fetch.postData('http://127.0.0.1:9001/transaction/buyerConfirm', confirmMsg);
    //  解析出买单签名
    let buf = Buffer.from(buyerConfirmRes.body._readableState.buffer.head.data);
    let txsJson = JSON.parse(buf.toString());
    let signedTxPromises = txsJson.map(txJson => {
        let unsignedTx = {
            tx_json: txJson,
        };
        jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        let blob = unsignedTx.tx_json.blob;
        return fetch.postData('http://127.0.0.1:9001/transaction/signedBuyerConfirm/sellOrder', blob);
    })
    //  提交买单签名
    await Promise.all(signedTxPromises);

    console.timeEnd('buyerConfirmReq');
    console.log('--------------------');

}