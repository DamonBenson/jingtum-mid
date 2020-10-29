export default class Tx {

    buildPaymentTx(a, s, r, seq, to, amount, memos, showRes) {

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
                        console.log('buildPaymentTx:', result);
                    }
                    resolve(result);
                }
            });
            
        });
    
    }

}