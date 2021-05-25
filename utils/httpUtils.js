import http from 'http';
import querystring from 'querystring';

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