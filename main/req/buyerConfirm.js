// 获取匹配结果推送

let confirmMsg = {
    contractAddrs: contractAddrs, // 合约列表
    addr: platformAddr,
    sellOrderId: sellOrderIds, // 订单列表
    expireTime: expireTime,
    buyOrderInfo: buyOrderInfo,
}

let unsignedTxs = await fetch.postData('http://127.0.0.1:9001/transaction/buyerConfirm', sellOrder);
// 对于每个unsignedTx
unsignedTx.setSecret(platformSecret);
unsignedTx.sign();
let blob = signedTx.blob;
await fetch.postData('http://127.0.0.1:9001/transaction/signedBuyerConfirm/sellOrder', blob);