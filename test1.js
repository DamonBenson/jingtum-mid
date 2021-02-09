import jlib from 'jingtum-lib';
import {chains} from './utils/info.js';
var Remote = jlib.Remote;
var remote = new Remote({server: chains[1].server[0], local_sign:true});
remote.connect(function(err, result) {
    if (err) {
        return console.log('err:',err);
    }
    var tx = remote.buildPaymentTx({
        account: chains[1].account.issuer.address,
        to: chains[1].account.gate.address,
        amount: {
        "value": 5,
        "currency": "SWT",
        "issuer": ""
        }
    });
    tx.setSecret(chains[1].account.issuer.secret);
    tx.addMemo('支付5swt.');//可选
    tx.submit(function(err, result) {
        if(err) {console.log('err:',err);}
        else if(result){
            console.log('res:', result);
        }
    });
});
