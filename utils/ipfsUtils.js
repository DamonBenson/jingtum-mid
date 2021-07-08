import http from 'http';
import fs from 'fs';
import formData from 'form-data';
import {ipfsAddUrl, ipfsCatUrl} from './config/ipfs.js';

/**
 * @description 将可被JSON序列化的数据上传到IPFS。
 * @param {Objcet}obj 需要上传的对象
 * @returns {String} 上传对象的IPFS哈希标识
 */
export function add(obj) {

    let form = new formData();
    form.append('data', JSON.stringify(obj));

    let options = {
        host: ipfsAddUrl.hostname,
        port: ipfsAddUrl.port,
        path: ipfsAddUrl.pathname,
        method: 'POST',
        headers: form.getHeaders(),
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';
    
            res.on('data', chunk => {
                data += chunk;
            });
    
            res.on('end', () => {
                let cid = JSON.parse(data).cid['/'];
                resolve(cid);
            });
        
        });

        req.on('error', e => {
            reject(e.message);
        });

        req.write(form.getBuffer());
        req.end();        

    });
    
}

/**
 * @description 将数据上传到IPFS。比如一个图片。
 * @param {Objcet}obj 需要上传的对象
 * @returns {String} 上传对象的IPFS哈希标识
 */
export function addRaw(obj) {

    let form = new formData();
    form.append('data', obj);

    let options = {
        host: ipfsAddUrl.hostname,
        port: ipfsAddUrl.port,
        path: ipfsAddUrl.pathname,
        method: 'POST',
        headers: form.getHeaders(),
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                let cid = JSON.parse(data).cid['/'];
                resolve(cid);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });

        req.write(form.getBuffer());
        req.end();

    });

}

/**
 * @description 将文件上传到IPFS。
 * @param {String}filePath 需要上传的文件路径
 * @returns {String} 上传对象的IPFS哈希标识
 */
export function addFile(filePath) {

    let form = new formData();
    form.append('data', fs.readFileSync(filePath));

    let options = {
        host: ipfsAddUrl.hostname,
        port: ipfsAddUrl.port,
        path: ipfsAddUrl.pathname,
        method: 'POST',
        headers: form.getHeaders(),
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                let cid = JSON.parse(data).cid['/'];
                resolve(cid);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });
        req.write(form.getBuffer());
        req.end();

    });

}

/**
 * @description 通过哈希标识获取IPFS上存储的内容。
 * @param {String}hash 哈希标识
 * @returns {Object} IPFS哈希标识对应的存储内容
 */
export function get(hash) {

    let options = {
        host: ipfsCatUrl.hostname,
        port: ipfsCatUrl.port,
        path: ipfsCatUrl.pathname + '?arg=' + hash,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';
    
            res.on('data', chunk => {
                data += chunk;
            });
    
            res.on('end', () => {
                let parsedData = JSON.parse(data);
                resolve(parsedData);
            });
        
        });

        req.on('error', e => {
            reject(e.message);
        });

        req.write('');
        req.end();

    });
    
}

/**
 * @description 通过哈希标识获取IPFS上存储的内容。
 * @param {String}hash 哈希标识
 * @returns {Object} IPFS哈希标识对应的存储内容
 */
export function getFile(hash, filePath) {

    let options = {
        host: ipfsCatUrl.hostname,
        port: ipfsCatUrl.port,
        path: ipfsCatUrl.pathname + '?arg=' + hash,
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            let data = Buffer.from("");
    
            res.on('data', chunk => {
                data = Buffer.concat([data, chunk]);
            });
    
            res.on('end', () => {
                fs.writeFileSync(filePath, data, () => {});
                resolve("success");
            });
        
        });

        req.on('error', e => {
            reject(e.message);
        });

        req.write('');
        req.end();

    });
    
}