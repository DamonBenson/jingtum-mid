import {chains} from '../info.js';

const tokenChain = chains[1];
const ai = tokenChain.account.issuer.address;
const si = tokenChain.account.issuer.secret;
const ag = tokenChain.account.gate.address;
const sg = tokenChain.account.gate.secret;

/*----------授权发行通证----------*/

export function buildTokenIssueReq(r, seq, name, num, showRes) {

    let tx = r.buildTokenIssueTx({
        account: ai,
        publisher: ag,
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

export function buildIssueTokenTx(r, seq, name, id, memos, showRes) {

    let tx = r.buildTransferTokenTx({
        publisher: ag,
        receiver: ag,
        token: name,
        tokenId: id,
        memos: memos
    });

    tx.setSecret(sg);

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

/*----------授予通证----------*/

export function buildAuthTokenTx(r, seq, rcv, name, id, showRes) {

    let tx = r.buildTransferTokenTx({
        publisher: ag,
        receiver: rcv,
        token: name,
        tokenId: id,
        memos: []
    });

    tx.setSecret(sg);

    tx.setSequence(seq);

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    // console.log('buildAuthTokenTx:', result);
                    console.log('buildAuthTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

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