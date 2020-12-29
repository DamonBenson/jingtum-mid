// import {spawn} from 'child_process';
// import * as localUtils from './utils/localUtils.js';

// // 启动子进程
// const child = spawn('node', ['./test2.js']);

// global.count = 0;

// // 监听并打印子进程信息
// child.stdout.on('data', function(chunk) {
//     console.log(count++, chunk.toString());
// });

// child.stderr.on('data', function(chunk) {
//     console.log('child err', chunk.toString());
// });
 
// setInterval(async function() {
//     for(let i = 0; i < 100; i++) {
//         child.stdin.write('aaa');
//         await localUtils.sleep(1);
//     }
// }, 5000);

import sha256 from 'crypto-js/sha256.js';

let o = {};

for(let i = 0; i < 1000000; i++) {
    i = i.toString();
    o[sha256(i).toString()] = i;
}

console.log(o);