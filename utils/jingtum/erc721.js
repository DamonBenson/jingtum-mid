import {chains} from '../info.js';

const tokenChain = chains[0];
const ai = tokenChain.account.issuer.address;
const si = tokenChain.account.issuer.secret;

/*----------授权发行通证----------*/

export function buildTokenIssueReq(r, addr, seq, name, num, showRes) {

    let tx = r.buildTokenIssueTx({
        account: ai,
        publisher: addr,
        token: name,
        number: num
    });

    tx.setSecret(si);

    tx.setSequence(seq);

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTokenIssueReq:', result);
                }
                resolve(result);
            }
        });   
    });

}

/*----------发行通证----------*/

export function buildIssueTokenTx(s, r, seq, p, addr, name, id, memos, showRes) {

    let tx = r.buildTransferTokenTx({
        publisher: p,
        receiver: addr,
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
                    // console.log('buildIssueTokenTx:', result);
                    console.log('buildIssueTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

// /*----------授予通证----------*/

// export function buildAuthTokenTx(s, r, seq, p, rcv, name, id, showRes) {

//     let tx = r.buildTransferTokenTx({
//         publisher: p,
//         receiver: rcv,
//         token: name,
//         tokenId: id,
//         memos: []
//     });

//     tx.setSecret(s);

//     tx.setSequence(seq);

//     return new Promise((resolve, reject) => {
//         tx.submit(function(err, result) {
//             if(err) {
//                 console.log('err:',err);
//                 reject('err');
//             }
//             else if(result){
//                 if(showRes) {
//                     // console.log('buildAuthTokenTx:', result);
//                     console.log('buildAuthTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
//                 }
//                 resolve(result);
//             }
//         });
//     });

// }

/*----------转让通证----------*/

export function buildTransferTokenTx(s, r, seq, p, rcv, name, id, showRes) {

    let tx = r.buildTransferTokenTx({
        publisher: p,
        receiver: rcv,
        token: name,
        tokenId: id,
        memos: []
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
                    console.log('buildTransferTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
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