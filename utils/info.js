import fs from 'fs';

const picPath = './resource/test.jpg';
const pic = fs.readFileSync(picPath);

const Account = {
    rootAccount: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
    rootSecret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
    chargeAccount: 'j7xQsY7aGJVoAaTGWYzyLoCLtGe9NwX7w',
    chargeSecret: 'ss1nxL1FkJAZmVtHzHJKAw52He8fB',
    issuerAccount: 'jaXFNVexGYnFALQzSHUkLakyVs1Lxs9ETJ',
    issuerSecret: 'spos4o8ghNw4FJgG3hCsNTfRn1TMn',
    gateAccount: 'jnjTbty9qpPu2d9mHUjH5kzq4TRcnpJsQr',
    gateSecret: 'snEsawU3xG6cthJ7ucg8dKFuHvpwk',
    a1Account: 'jLeSgeH96ocNpYxycyyNuSjxuqqka4yCcw',
    a1Secret: 'spv5YqzL96LBsTLENoJKqe7XPfM1Z',
    a2Account: 'j4UwUpue8KL6cMXTGBFURs68GwWmn62B4H',
    a2Secret: 'ssioeLtmJ4c7fUG8buvGa6tqKA9o7',
    a3Account: 'jUJzw8Y1eBKMchijfndBV6KFeD87uk64K7',
    a3Secret: 'spzCwHnjSdVDAR3yLzsgM4L5boo83',
};

const Server = {
    s1: 'ws://39.102.93.47:5020',
    s2: 'ws://39.102.91.224:5020',
    s3: 'ws://39.102.92.249:5020',
    s4: 'ws://39.102.90.153:5020',
    s5: 'ws://39.102.92.229:5020',
};

const userMemo = [
    {
        work: pic,
        workName: 'm1_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 0,
        workForm: 0,
        workField: 0
    },
    {
        work: pic,
        workName: 'm2_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 1,
        workForm: 1,
        workField: 1
    },
    {
        work: pic,
        workName: 'm3_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 2,
        workForm: 2,
        workField: 2
    },
    {
        work: pic,
        workName: 'm4_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 3,
        workForm: 3,
        workField: 3
    }
];

const authMemo = [
    {
        authCode: 'a0',
        authName: '天津版权局',
        certNum: 'c0',
        cert: pic
    },
    {
        authCode: 'a1',
        authName: '上海版权局',
        certNum: 'c1',
        cert: pic
    },
    {
        authCode: 'a2',
        authName: '北京版权保护中心',
        certNum: 'c2',
        cert: pic
    },
    {
        authCode: 'a3',
        authName: '国家版权局',
        certNum: 'c3',
        cert: pic
    }
];

const tokenName = 'test1'

export {Account, Server, userMemo, authMemo, tokenName};