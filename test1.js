// import http from 'http';
// import {spawn} from 'child_process';

// import * as router from './utils/router.js';

// const childUpload = spawn('node', ['./test2.js']);



// // 启动服务器
// http.createServer(function(request, response) {

//     childUpload.stdout.on('data', function(chunk) {
//         console.log('childUpload', chunk);
//     });
    
//     router.register(request, response, [
//         {
//             'url': '/uploadReq',
//             'handler': handleUpload
//         },
//     ]);

// })
// .listen(9001);

// function handleUpload(request, response) {
//     console.log('on upload');
//     request.on('data', async function(chunk) {
//         childUpload.stdin.write(chunk);
//     });
// }

import {spawn} from 'child_process';

const childUpload = spawn('node', ['../test2.js']);

childUpload.stdout.on('data', function(chunk) {
    console.log('childUpload', chunk.toString());
});