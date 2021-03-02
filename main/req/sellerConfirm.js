// 获取买方确认推送

let confirmMsg = {
    contractAddr: contractAddr,
    addr: platformAddr,
    sellOrderId: sellOrderId,
    buyOrderInfo: buyOrderInfo,
}

let unsignedTx = await fetch.postData('http://127.0.0.1:9001/transaction/sellerApproveConfirm', sellOrder);
unsignedTx.setSecret(platformSecret);
unsignedTx.sign();
let blob = signedTx.blob;
await fetch.postData('http://127.0.0.1:9001/transaction/signedSellerApproveConfirm', blob);