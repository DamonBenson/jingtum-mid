import fetch from 'node-fetch';

export function postData(url, data) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/x-www-form-urlencoded"
            }
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

export function getData(url, data) {
    return new Promise((resolve, reject) => {
        let dataStr = '';
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&';
        });
        if(dataStr !== ''){
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url = url + '?' + dataStr;
        }
        fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/x-www-form-urlencoded"
            }
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}