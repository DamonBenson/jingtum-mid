import jlib from 'jingtum-lib';
import {chains} from './utils/info.js';
var Remote = jlib.Remote;
var remote = new Remote({server: chains[0].server[0], local_sign:true});
remote.connect(function(err, result) {
    if (err) {
        return console.log('err:',err);
    }
    var publisher = {address: 'jLHYmgoFht8ZdhN5VJvLnfvZzgcExxPLhH', secret: 'sawN72RR3pPmw8GnAwETKtYhrPGvb' }//发行账号
    var tx = remote.buildTransferTokenTx({publisher: publisher.address,
        receiver: 'jDAqZ7uAE9vzwDZwqzuiDCasS31Hz8w8aB',
        token: 'testToken1',
        tokenId: 'D6B37CEE5E28AFC11C504F61367060FABF6D4552BA3FF50A884C5FAFE58C6EE9',
        memos:[
            {type: 'name', data: '北京'},
            {type: 'color', data: 'red'}
        ]
    });
    tx.setSecret(publisher.secret);
    tx.submit(function(err, result) {
       if(err) {console.log('err:',err);}
       else if(result){
           console.log('res:', result);
   }});

});

