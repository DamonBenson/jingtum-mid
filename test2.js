import * as localUtils from './utils/localUtils.js';

process.stdin.on('data', async function(chunk) {
    await localUtils.sleep(1000);
    // await setTimeout(() => console.log('aaa'), 1000);
    console.log('aaa');
});