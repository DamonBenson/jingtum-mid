/*----------向IPFS上传数据----------*/

export function add(ipfs, buffer) {
    return new Promise((resolve, reject) => {
        try {
            ipfs.add(buffer, function(err, files) {
                if(err || typeof files == "undefined") {
                    reject(err);
                } else {
                    resolve(files[0].hash);
                }
            });
        } catch(e) {
            reject(e);
        }
    });
}

/*----------从IPFS获取数据----------*/

export function get(ipfs, hash) {
    return new Promise((resolve,reject) => {
        try {
            ipfs.get(hash, function(err, files) {
                if(err || typeof files == "undefined") {
                    reject(err);
                } else {
                    resolve(files[0].content);
                }
            });
        } catch(e) {
            reject(e);
        }
    });
}