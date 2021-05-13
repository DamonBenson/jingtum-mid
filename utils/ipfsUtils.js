import fetch from 'node-fetch';

import {ipfsAddAddr, ipfsCatAddr} from './config/ipfs.js';

/*----------向IPFS上传数据----------*/

export function addObject(obj) {
    return new Promise((resolve, reject) => {
        let url = ipfsAddAddr + '/add';
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(obj),
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"multipart/form-data;boundary='-----------------abcdef'"
            }
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

export function addFile(file) {
    return new Promise((resolve, reject) => {
        let url = ipfsAddAddr + '/add';
        fetch(url, {
            method: 'POST',
            body: file,
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"multipart/form-data"
            }
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

/*----------从IPFS获取数据----------*/

export function get(hash) {
    return new Promise((resolve, reject) => {
        let url = ipfsGetAddr + '/api/v0/cat?args=' + hash;
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/x-www-form-urlencoded",
            }
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}




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