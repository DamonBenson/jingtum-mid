/*----------授权发行通证----------*/

export function buildTokenIssueTx(a, s, r, seq, p, name, num, showRes) {

    let tx = r.buildTokenIssueTx({
        account: a,
        publisher: p,
        token: name,
        number: num
    });

    tx.setSecret(s);

    tx.setSequence(seq);

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTokenIssueTx:', result);
                }
                resolve(result);
            }
        });   
    });

}

/*----------转让通证----------*/

export function buildTransferTokenTx(s, r, seq, p, rcv, name, id, memos, showRes) {

    let tx = r.buildTransferTokenTx({
        publisher: p,
        receiver: rcv,
        token: name,
        tokenId: id,
        memos: memos
    });

    tx.setSecret(s);

    tx.setSequence(seq);

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    // console.log('buildTransferTokenTx:', result);
                    console.log('buildTransferTokenTx:', result.engine_result + "_" + result.engine_result_message + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/*----------查询通证信息----------*/

export function requestTokenInfo(r, tokenId, showRes) {

    let tx = r.requestTokenInfo({
        tokenId: tokenId
    });

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('requestTokenInfo:', result);
                }
                resolve(result);
            }
        });
    });

}