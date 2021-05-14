import fs from 'fs';
import fetch from 'node-fetch';
import formData from 'form-data';

import {ipfsAddAddr, ipfsCatAddr} from './config/ipfs.js';

/**
 * @description 将可被JSON序列化的数据上传到IPFS。
 * @param {Objcet}obj 需要上传的对象
 * @returns {String} 上传对象的IPFS哈希标识
 */
export function add(obj) {
    return new Promise((resolve, reject) => {
        let url = ipfsAddAddr + '/add';
        let form = new formData();
        form.append('data', JSON.stringify(obj));
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: form.getHeaders(),
            body: form,
        }).then(res => {
            let buf = res[Object.getOwnPropertySymbols(res)[0]].body._readableState.buffer.head.data;
            let hash = JSON.parse(Buffer.from(buf).toString()).cid['/'];
            resolve(hash);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

// export function addFile(file) {
//     return new Promise((resolve, reject) => {
//         let url = ipfsAddAddr + '/add';
//         fetch(url, {
//             method: 'POST',
//             body: file,
//             mode: 'cors',
//             headers: {
//                 "Accept":"application/json",
//                 "Content-Type":"multipart/form-data"
//             }
//         }).then(res => {
//             resolve(res);
//         }).catch(err => {
//             console.log(err);
//             reject(err);
//         });
//     });
// }

/**
 * @description 通过哈希标识获取IPFS上存储的内容。
 * @param {String}hash 哈希标识
 * @returns {String} 上传对象的IPFS哈希标识
 */
export function get(hash) {
    return new Promise((resolve, reject) => {
        let url = ipfsCatAddr + '/api/v0/cat?arg=' + hash;
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/x-www-form-urlencoded",
            }
        }).then(res => {
            let buf = res[Object.getOwnPropertySymbols(res)[0]].body._readableState.buffer.head.data;
            let data = JSON.parse(Buffer.from(buf).toString());
            resolve(data);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}
 
// export function getFile(hash) {
//     return new Promise((resolve, reject) => {
//         let url = ipfsCatAddr + '/api/v0/cat?arg=' + hash;
//         fetch(url, {
//             method: 'POST',
//             mode: 'cors',
//             headers: {
//                 "Accept":"application/json",
//                 "Content-Type":"application/x-www-form-urlencoded",
//             }
//         }).then(res => {
//             let buf = res[Object.getOwnPropertySymbols(res)[0]].body._readableState.buffer.head.data;
//             // let writeStream = fs.createWriteStream('./demo.jpg');
//             // writeStream.write(buf, 'base64');
//             // writeStream.end();
//             // writeStream.on('finish', function() {
//             //     resolve('success');
//             // });
//             resolve(buf);
//         }).catch(err => {
//             console.log(err);
//             reject(err);
//         });
//     });
// }


// /*----------向IPFS上传数据----------*/

// export function add(ipfs, buffer) {
//     return new Promise((resolve, reject) => {
//         try {
//             ipfs.add(buffer, function(err, files) {
//                 if(err || typeof files == "undefined") {
//                     reject(err);
//                 } else {
//                     resolve(files[0].hash);
//                 }
//             });
//         } catch(e) {
//             reject(e);
//         }
//     });
// }

// /*----------从IPFS获取数据----------*/

// export function get(ipfs, hash) {
//     return new Promise((resolve,reject) => {
//         try {
//             ipfs.get(hash, function(err, files) {
//                 if(err || typeof files == "undefined") {
//                     reject(err);
//                 } else {
//                     resolve(files[0].content);
//                 }
//             });
//         } catch(e) {
//             reject(e);
//         }
//     });
// }