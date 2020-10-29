export default class ERC721 {

    buildTokenIssueTx(a, s, r, seq, p, name, num, showRes) {

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
    
    buildTransferTokenTx(s, r, seq, p, rcv, name, id, memos, showRes) {
    
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
                        console.log('buildTransferTokenTx:', result);
                    }
                    resolve(result);
                }
            });
            
        });
    
    }

    requestTokenInfo(r, tokenId, showRes) {
    
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

}