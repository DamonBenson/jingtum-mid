import sha256 from 'crypto-js/sha256.js';

import MysqlUtils from './utils/mysqlUtils.js';
const mysqlUtils = new MysqlUtils();

async function a() {
    await mysqlUtils.insert('work_info', {
        work_id: sha256('0').toString(),
        addr: '0',
        hash: sha256('1').toString()
    });
}

a();