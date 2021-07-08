import http from 'http';
import fs from 'fs';
import querystring from 'querystring';
import formData from 'form-data';

export function get(url, data) {

    url = new URL(url);

    let dataStr = querystring.stringify(data);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname + '?' + dataStr,
        method: 'GET',
    };

    return new Promise((resolve, reject) => {

        let req = http.get(options, function(res) {

            res.setEncoding('utf8');
            let data = '';
    
            res.on('data', chunk => {
                data += chunk;
            });
    
            res.on('end', function(){
                let parsedData = JSON.parse(data);
                resolve(parsedData);
            });
        
        });

        req.on('error', function(e) {
            reject(e.message);
        });

    });

}

export function post(url, data) {

    url = new URL(url);

    data = JSON.stringify(data);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
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

        req.write(data);
        req.end();        

    });

}

export function postFiles(url, fileInfo) {

    url = new URL(url);

    let form = new formData();
    for(let key in fileInfo) {
        if(Array.isArray(fileInfo[key])) {
            for(let i in fileInfo[key]) {
                form.append(key, fs.readFileSync(fileInfo[key][i]));
            }
        }
        else {
            form.append(key, fileInfo[key]);
        }
    }
    let headers = form.getHeaders();

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: headers,
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

        req.write(form.getBuffer());
        req.end();        

    });

}