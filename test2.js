import * as fetch from './utils/fetch.js';

let data = {
    info: 'testInfo',
    code: 'testCode',
}

let dataBuf = Buffer.from(JSON.stringify(data))

let res = await fetch.postData('http://118.190.39.87:9094/add', dataBuf);

console.log(res);

// let buf = res[Object.getOwnPropertySymbols(res)[0]].body._readableState.buffer.head.data;

// let body = JSON.parse(Buffer.from(buf).toString());

// console.log(body);