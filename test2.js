// import jlib from 'jingtum-lib';

// import {chains, userMemo, ipfsConf, mysqlConf, debugMode} from './utils/info.js';


// /*----------创建链接(服务器3)----------*/

// var Remote = jlib.Remote;

// var r = new Remote({server: chains[0].server[0], local_sign: true});

// r.connect(function(err, result) {

//     process.stdout.write(JSON.stringify({
//         type: 'message',
//         payload: 'connect'
//     }));

//     // // 链接状态
//     // if(err) {
//     //     return console.log('err: ', err);
//     // }
//     // else if(result) {
//     //     console.log('result: ', result);
//     // }

//     process.stdin.on('data', (chunk) => {
//         let data = chunk.toString();
//         let message = JSON.parse(data);
//         switch (message.type) {
//           case 'handshake':
//             // 子进程-发
//             process.stdout.write(JSON.stringify({
//               type: 'message',
//               payload: message.payload + ' : hoho'
//             }));
//             break;
//           default:
//             break;
//         }
//       });

// });



// import jlib from 'jingtum-lib';

// import {chains, userMemo, ipfsConf, mysqlConf, debugMode} from './utils/info.js';

// import * as requestInfo from './utils/jingtum/requestInfo.js';


// /*----------创建链接(服务器3)----------*/

// var Remote = jlib.Remote;

// var r = new Remote({server: chains[0].server[0], local_sign: true});
// var r = new Remote({server: chains[0].server[0], local_sign: true});

// r.connect(async function() {await requestInfo.requestServerInfo(r, true)});


// r.connect(function() {
//     irrConn(chain.delete(r));
// });


import jlib from 'jingtum-lib';

import {chains} from './utils/info.js';

const uploadChain = chains[0];


/*----------创建链接(服务器3)----------*/

var Remote = jlib.Remote;
var r = new Remote({server: uploadChain.server[0], local_sign: true});

r.connect(async function(err, result) {

    // 链接状态
    if(err) {
        return console.log('err: ', err);
    }
    else if(result) {
        console.log('result: ', result);
    }

});