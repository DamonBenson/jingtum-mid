/**
 * @description 提交已签名交易。
 * @param {Object}remote 底层链连接对象
 * @param {String}blob 已签名交易
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildSignedTx(remote, blob, showRes) {

    let options = {blob: blob};

    let tx = remote.buildSignTx(options);

    return new Promise((resolve, reject) => { 
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    // console.log('buildSignTx:', result);
                    console.log('buildSignTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 支付。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 付款方的地址
 * @param {String}secret 付款方的私钥
 * @param {int}seq 付款方的交易序列号
 * @param {String}dest 收款方的地址
 * @param {int}amount 支付数量
 * @param {String}memos 支付备注
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */export function buildPaymentTx(remote, src, secret, seq, dest, amount, memos, showRes) {

    let tx = remote.buildPaymentTx({
        account: src,
        to: dest,
        amount: {
            "value": amount,
            "currency": "SWT",
            "issuer": ""
        }
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    tx.addMemo(memos);

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    // console.log('buildPaymentTx:', result);
                    console.log('buildPaymentTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}