import fs from 'fs';

const picPath = './resource/test.jpg'; // 相对于当前命令行所在目录的相对位置
const pic = fs.readFileSync(picPath);

const userAccount = [
    {
        address: 'jDAUJMj9WrxspX5uZDAM5UxUReTT8Fm8V3',
        secret: 'snVDk8Gx9L32cXbrj1XeXhjZokApA'
    }, // a[0]--智能预警系统发币账号
    {
        address: 'j9pouNtZbErrTfLHF1PwJ4thmTFkk2oRGX',
        secret: 'shw9MXFmcZg7H7AS3LFKQCfFwAJSG'
    }, // a[1]--智能授权系统发币账号
    {
        address: 'jUy7sbmrwaphoPdACnZnxeKAAEqG46WkCC',
        secret: 'snQrY7QH65NYYvvSkReUwn64AR4ad'
    }, // a[2]--版权局确权账号
    {
        address: 'jE8kjQZT6cfP7pqofqHNiiM3doQu5SvsGX',
        secret: 'ssneHKG9VxLwtvmZCAZHhkUZqo3Qd'
    }, // a[3]--用户1
    {
        address: 'jGgEkVqoJEgX4BDnpPDmcX69xd3BqpbmCM',
        secret: 'snneqRWvKt72A8i5XkWw7H4woX6MB'
    }, // a[4]--用户2
    {
        address: 'jDG6K4JTptGi7hz3iAaqB8guaJZbpn5EcQ',
        secret: 'sn45ujQacJpjPtQp6HkrPbj3F6zxY'
    }, // a[5]--平台
];

const chains = [
    {
        server: [
            'ws://39.102.91.224:5020',
            'ws://39.102.92.249:5020',
            'ws://39.102.90.153:5020',
            'ws://39.102.92.229:5020'
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb'
            },
            charge: {
                address: 'j7xQsY7aGJVoAaTGWYzyLoCLtGe9NwX7w',
                secret: 'ss1nxL1FkJAZmVtHzHJKAw52He8fB'
            },
            issuer: {
                address: 'jaXFNVexGYnFALQzSHUkLakyVs1Lxs9ETJ',
                secret: 'spos4o8ghNw4FJgG3hCsNTfRn1TMn'
            },
            gate: {
                address: 'jnjTbty9qpPu2d9mHUjH5kzq4TRcnpJsQr',
                secret: 'snEsawU3xG6cthJ7ucg8dKFuHvpwk'
            },
            a: userAccount
        }
    },
    {
        server: [
            'ws://39.102.91.224:6030',
            'ws://39.102.92.249:6030',
            'ws://39.102.90.153:6030',
            'ws://39.102.92.229:6030'
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb'
            },
            charge: {
                address: 'jsUXopMd8RAYX2GEK5u7qw6xNny7sgfKAS',
                secret: 'sntpWAgCpioVbJEr4UwA9J6DRbhbM'
            },
            issuer: {
                address: 'jJVzfzdpXvZYeMADkhKJvPhu3nT55eKSUE',
                secret: 'sh4qJui9Tm8i59vrh1FYtBJVeZGoB'
            },
            gate: {
                address: 'jLLNL25iY8Adta2oknGiQwN9TTWCL7P469',
                secret: 'sn5LBvoLSd86T7mCXDNQD5qoFCNGv'
            },
            a: userAccount
        }
    }
]

const userMemo = [
    {
        addr: userAccount[2].address,
        workName: 'm1_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 0,
        workForm: 0,
        workField: 0
    },
    {
        addr: userAccount[3].address,
        workName: 'm2_',
        createdTime: 1581696000,
        publishedTime: 1581696000,
        workType: 1,
        workForm: 1,
        workField: 1
    },
    {
        addr: userAccount[4].address,
        workName: 'm3_',
        createdTime: 1584201600,
        publishedTime: 1584201600,
        workType: 2,
        workForm: 2,
        workField: 2
    },
    {
        addr: userAccount[5].address,
        workName: 'm4_',
        createdTime: 1586880000,
        publishedTime: 1586880000,
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
    },
    {
        authCode: 'a1',
        authName: '上海版权局',
        certNum: 'c1',
    },
    {
        authCode: 'a2',
        authName: '北京版权保护中心',
        certNum: 'c2',
    },
    {
        authCode: 'a3',
        authName: '国家版权局',
        certNum: 'c3',
    }
];

const rightTokenName = 'test10';
const approveTokenName = 'test11';

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

const debugMode = true;

export {pic, chains, userAccount, userMemo, authMemo, rightTokenName, ipfsConf, mysqlConf, debugMode};