import jlib from 'jingtum-lib';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as tx from '../utils/jingtum/tx.js';

import {chains} from '../utils/config/jingtum.js';

const Remote = jlib.Remote;

const accounts = [
    'jfSQTDDZoqVTMwEQwb5FffSyeZ2PDBdVDK',
    'jhcSBJPB3T6UjiBWHf4riU8PSfxfDCnNsn',
    'jpY9octvfwBXPNTRqLbYK3ALQBCZkwEFir',
    'jniu3438U7HxGbghhtxEP5vLeiJZYQRfjX',
    'jN1rtJiDV741WvbhPs2yTgpGXCBatiB569',
    'jGs7gYsPX5W3ACBNPCHTxPdzqo7huJLmWs',
    'jENEFBGLZjSaDzdFyoBvrZirvKrp9jvq1d',
    'jspBKDq9qFi2LLeX9izpNoJDZdw6jaN7km',
    'jfmpVMtkTGSm5GZWF7GXuVSdajxi5GsMHa',
    'jHFA9BhCDFUvtgeCMi6r8RYf3QUr5bncgf'
];

for(let i = chains.length - 1; i >= 0; i--) {

    let chain = chains[i];
    let rootAddr = chain.account.root.address;
    let rootSecr = chain.account.root.secret;
    let chargeAddr = chain.account.charge.address;
    let issuerAddr = chain.account.issuer.address;

    let r = new Remote({server: chain.server[2], local_sign: true});
    r.connect(async function(err, result) {

        /*---------链接状态----------*/
    
        if(err) {
            return console.log('connect err: ', err);
        }
        else if(result) {
            console.log('connect: ', result);
        }
    
        /*----------转账激活账号----------*/
    
        let accountInfo = await requestInfo.requestAccountInfo(rootAddr, r, true);
        let seq = accountInfo.account_data.Sequence;
    
        // await tx.buildPaymentTx(r, rootAddr, rootSecr, seq++, chargeAddr, 100000000, 'setup', true);
        // await tx.buildPaymentTx(r, rootAddr, rootSecr, seq++, issuerAddr, 100000000, 'setup', true);

        for (let i = 0; i < accounts.length; i++) {
            const addr = accounts[i];
            await tx.buildPaymentTx(r, rootAddr, rootSecr, seq++, addr, 100000000, 'setup', true);
        }
    
        r.disconnect();
    
    });

}