export default class RequestInfo {

    /*----------获取账户信息----------*/

    requestAccountInfo(a, r, showRes) {

        let req = r.requestAccountInfo({account: a});

        return new Promise((resolve, reject) => {

            req.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('requestAccountInfo', result);
                    }
                    resolve(result);
                }
            });

        });

    }

    /*----------获取最新账本信息----------*/

    requestLedgerClosed(r, showRes) {

        let req = r.requestLedgerClosed();

        return new Promise((resolve, reject) => {

            req.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('requestLedgerClosed:', result);
                    }
                    resolve(result);
                }
            });

        })

    }

    /*----------获取服务器信息----------*/

    requestServerInfo(r, showRes) {

        let req = r.requestServerInfo();

        return new Promise((resolve, reject) => {

            req.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('requestServerInfo:', result);
                    }
                    resolve(result);
                }
            });

        })

    }

    /*----------获取账本信息----------*/

    requestLedger(r, index, tx, showRes) {

        let req = r.requestLedger({
            ledger_index: index, 
            transactions: tx,
        });

        return new Promise((resolve, reject) => {

            req.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('requestLedger:', result);
                    }
                    resolve(result);
                }
            });

        })

    }

    /*----------获取交易信息----------*/

    requestTx(r, hash, showRes) {

        let req = r.requestTx({
            hash: hash
        });

        return new Promise((resolve, reject) => {

            req.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('requestTx:', result);
                    }
                    resolve(result);
                }
            });
            
        });

    }

}