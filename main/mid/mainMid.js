import http from 'http';
import {spawn} from 'child_process';

import * as router from '../../utils/router.js';

// 启动子进程
const childUpload = spawn('node', ['./main/mid/uploadMid.js']); // 相对于当前命令行所在目录的相对位置
const childAuth = spawn('node', ['./main/mid/authMid.js']); // 相对于当前命令行所在目录的相对位置
const childTransfer = spawn('node', ['./main/mid/transferMid.js']); // 相对于当前命令行所在目录的相对位置

// 监听并打印子进程信息
childUpload.stdout.on('data', function(chunk) {
    console.log('childUpload', chunk.toString());
});
childAuth.stdout.on('data', function(chunk) {
    console.log('childAuth', chunk.toString());
});
childTransfer.stdout.on('data', function(chunk) {
    console.log('childTransfer', chunk.toString());
});

// 启动服务器
http.createServer(function(request, response) {
    
    // 设置请求url对应的处理函数
    router.register(request, response, [
        {
            'url': '/uploadReq',
            'handler': handleUpload
        },
        {
            'url': '/authReq',
            'handler': handleAuth
        },
        {
            'url': '/transferReq',
            'handler': handleTransfer
        }
    ]);

})
.listen(9001);

// 发送上传请求至子进程uploadMid.js
function handleUpload(request, response) {
    request.on('data', function(chunk) {
        childUpload.stdin.write(chunk);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('ok'); // 收到请求就返回ok信息，而非等待子进程处理完
    });
}

// 发送确权请求至子进程authMid.js
function handleAuth(request, response) {
    request.on('data', function(chunk) {
        childAuth.stdin.write(chunk);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('ok');
    });
}

// 发送转让请求至子进程transferMid.js
function handleTransfer(request, response) {
    request.on('data', function(chunk) {
        childTransfer.stdin.write(chunk);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('ok');
    });
}