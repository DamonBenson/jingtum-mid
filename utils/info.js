import fs from 'fs';

const picPath = './resource/test.jpg';
const pic = fs.readFileSync(picPath);

const chains = [
    {
        server: [
            'ws://39.102.91.224:5020',
            'ws://39.102.92.249:5020',
            'ws://39.102.90.153:5020',
            'ws://39.102.92.229:5020',
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
            },
            charge: {
                address: 'j7xQsY7aGJVoAaTGWYzyLoCLtGe9NwX7w',
                secret: 'ss1nxL1FkJAZmVtHzHJKAw52He8fB',
            },
            issuer: {
                address: 'jaXFNVexGYnFALQzSHUkLakyVs1Lxs9ETJ',
                secret: 'spos4o8ghNw4FJgG3hCsNTfRn1TMn',
            },
            gate: {
                address: 'jnjTbty9qpPu2d9mHUjH5kzq4TRcnpJsQr',
                secret: 'snEsawU3xG6cthJ7ucg8dKFuHvpwk',
            },
            a: [
                {
                    address: 'jLeSgeH96ocNpYxycyyNuSjxuqqka4yCcw',
                    secret: 'spv5YqzL96LBsTLENoJKqe7XPfM1Z',
                },
                {
                    address: 'j4UwUpue8KL6cMXTGBFURs68GwWmn62B4H',
                    secret: 'ssioeLtmJ4c7fUG8buvGa6tqKA9o7',
                },
                {
                    address: 'jUJzw8Y1eBKMchijfndBV6KFeD87uk64K7',
                    secret: 'spzCwHnjSdVDAR3yLzsgM4L5boo83',
                },
            ],
        },
    },
    {
        server: [
            'ws://39.102.91.224:6030',
            'ws://39.102.92.249:6030',
            'ws://39.102.90.153:6030',
            'ws://39.102.92.229:6030',
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
            },
            charge: {
                address: 'jsUXopMd8RAYX2GEK5u7qw6xNny7sgfKAS',
                secret: 'sntpWAgCpioVbJEr4UwA9J6DRbhbM',
            },
            issuer: {
                address: 'jJVzfzdpXvZYeMADkhKJvPhu3nT55eKSUE',
                secret: 'sh4qJui9Tm8i59vrh1FYtBJVeZGoB',
            },
            gate: {
                address: 'jLLNL25iY8Adta2oknGiQwN9TTWCL7P469',
                secret: 'sn5LBvoLSd86T7mCXDNQD5qoFCNGv',
            },
            a: [
                {
                    address: 'jP5eN3N7fMGLEtYgfMUDtUYmkAc8UZMT3Y',
                    secret: 'ssTA226mQcY8ZWovfK38DM9n35fdz',
                },
                {
                    address: 'jf4D11eo2pNKVfR4TNUsR87cURyhaoQfSw',
                    secret: 'shXBqhXZs1BdRv3GPbBcPi3aiTqLf',
                },
                {
                    address: 'jn3dGnngMBLXU2GPH8BbCS7qRmXvJFY2ZJ',
                    secret: 'sn4DpEn8e9Fykephih8GzgTsnJ9xc',
                },
            ],
        },
    },
]

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

const ipfsConf = {
    host: '127.0.0.1',
    port: '5001',
    protocol: 'http'
}

const mysqlConf = {
    host: '39.102.93.47',       
    user: 'root',              
    password: 'bykyl626',       
    port: '3306',                   
    database: 'jingtum'
}

const debugMode = false;

export {chains, userMemo, authMemo, tokenName, ipfsConf, mysqlConf, debugMode};