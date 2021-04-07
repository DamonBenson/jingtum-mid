/*----------提交已完成签名的交易----------*/

export function buildSignedTx(r, b, showRes) {

    let options = {blob: b};

    let tx = r.buildSignTx(options);

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

/*----------转账----------*/

export function buildPaymentTx(a, s, r, seq, to, amount, memos, showRes) {

    let tx = r.buildPaymentTx({
        account: a,
        to: to,
        amount: {
            "value": amount,
            "currency": "SWT",
            "issuer": ""
        }
    });

    tx.setSecret(s);

    tx.setSequence(seq);

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