import readline from 'readline';

import * as httpUtils from '../../utils/httpUtils.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const body = {
    info: 'testInfo',
    code: 'testCode',
};

while(true) {
    try {
        await input();
    }
    catch(e) {}
}

async function input() {
    return new Promise((resolve, reject) => {
        rl.question('输入method: ', async(method) => {
            rl.question('输入url: ', async(url) => {
                switch(method) {
                    case 'get':
                        let getResInfo = await httpUtils.get('http://127.0.0.1:9001' + url, body);
                        console.log('resInfo:', getResInfo);
                        break;
                    case 'post':
                        let postResInfo = await httpUtils.post('http://127.0.0.1:9001' + url, body);
                        console.log('resInfo:', postResInfo);
                        break;
                    default:
                        console.log('wrong method!');
                        reject();
                }
                resolve();
            });
        });
    });
}
