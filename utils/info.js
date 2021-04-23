import fs from 'fs';

const picPath = './resource/test.jpg'; // 相对于当前命令行所在目录的相对位置
const pic = fs.readFileSync(picPath);
const userAccountIndex = {
    '智能预警系统发币账号': 0,
    '智能授权系统发币账号': 1,
    '版权局确权账号': 2,
    '买方平台账号': 3,
    '卖方平台账号': 4,
    '智能交易系统账号': 5,
    '用户1': 6,
    '用户2': 7,
    '用户3': 8,
    '中间层': 9,
    '用户4': 10,
    '用户5': 11,
    '用户6': 12,
    '买方平台2': 13,
    '卖方平台2': 14
    
};
const userAccount = [
    {
      secret: 'ssyYuua1z4J312TNVrz4pqaZLs7yG',
      address: 'j9uudceu9gX3DyLcTL7czGgUnfzP9fQxko'
    }, // a[0]--智能预警系统发币账号
    {
      secret: 'ssxNDn2zSdjXTDFkANWpKWctHYMHZ',
      address: 'jNPZMZxYx1Gj9rRYadiTfLG5ypQTJgmLAm'
    }, // a[1]--智能授权系统发币账号
    {
      secret: 'snj7uooT7AyWECSEFdtfgktaqYeA2',
      address: 'jBwyKkquJFXT3VMUxr71v7XxQHfqgAdUac'
    }, // a[2]--版权局确权账号
    {
      secret: 'snvrxFowqi2CbdsCAqRzqYnyUHkzU',
      address: 'jUXNAu8YrzNQ6Vf6EsJcJTjhHKgGzb29y4'
    }, // a[3]--买方平台账号 
    {
      secret: 'ssyfiS2TBDiJP5Vq7Lht7kityxuXz',
      address: 'jEY6Jr3qkDFnMcPZBig8jkdzTBt8ktMZA'
    }, // a[4]--卖方平台账号
    {
      secret: 'shQxyCmFp937mHNrHmqvCxEqhmDzr',
      address: 'jDg1GG5JpyFdrafjUcid99mKZeUXKHUptu'
    }, // a[5]--智能交易系统账号
    {
      secret: 'ss6x7sLB6dVLKTnA2WHgAZUrkduZC',
      address: 'jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC'
    }, // a[6]--用户1 百度
    {
      secret: 'ssAHHWR2WUVEfyN5VUzcFkVmtsnBj',
      address: 'jG1Y4G3omHCAbAWRuuYZ5zwcftXgvfmaX3'
    }, // a[7]--用户2 京东
    {
      secret: 'shC3KW3vZFtRCpquGFtiXwQvtsXJw',
      address: 'jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan'
    }, // a[8]--用户3
    {
      secret: 'shegH3jnyxLFFtCiZBgEALTkwvBjy',
      address: 'jGcNi9Bs4eddeeYZJfQMhXqgcyGYK5n8N9'
    }, // a[9]--中间层
    {
        secret: 'ssPFANF164Z84ua53bzbDZZJZKEXg',     
        address: 'jjhUAVFP9KSd743e4rT9dqDdxvBz6UDiEr'
    }, // a[10]--用户4
    {
        secret: 'sh8dSbthkQ44PYdX4avG4YbmBPucf',     
        address: 'j4azUzVJrwxyMfJLF4iWukNsNdCCijyzCX'
    }, // a[11]--用户5
    {
        secret: 'ssdP7cTLMs8psVJ6bQBee9HU5Fi5Y',
        address: 'jME7AuaJG2BSr91H5EUdtvAtMTU1zmDT4F'
    }, // a[12]--用户6
    {
        secret: 'snHD7qERQShUZFcKrspXDgMTX9e3L',
        address: 'jQDafXm7h7ajxVsuCDSeDFLg8EUgU4huXv'
    }, // a[13]--买方平台2
    {
        secret: 'ssws8fbpXADXyWPXq2szRrL2pntAG',
        address: 'jhQd4fAujjwyCQMpiMssUStRKgaaarYYFg'
    } // a[14]--卖方平台2
]

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
            'ws://39.102.91.224:9030',//因为闯祸临时修改，改到剩下那三个服务器也能跑
            'ws://39.102.92.249:9030',
            'ws://39.102.90.153:9030',
            'ws://39.102.92.229:9030'
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb'
            },
            charge: {
                address: 'jEx8qHwy2r5vMrVrbc7i4juWKmtsSm4DS9',
                secret: 'snQfZGdaR9sMe7D3uCcEHMvs4ocjA'
            },
            issuer: {
                address: 'jfCdDWueik3AsSjcfcaQsdpFjW8CyZYT76',
                secret: 'snjQmeX9gdwuVNHqvypxn2d663jKL'
            },
            a: userAccount
        }
    }
]

const userMemo = [
    {
        addr: userAccount[6].address,
        workName: 'm1_',
        createdTime: 1579017600,
        publishedTime: 1579017600,
        workType: 0,
        workForm: 0,
        workField: 0
    },
    {
        addr: userAccount[7].address,
        workName: 'm2_',
        createdTime: 1581696000,
        publishedTime: 1581696000,
        workType: 1,
        workForm: 1,
        workField: 1
    },
    {
        addr: userAccount[8].address,
        workName: 'm3_',
        createdTime: 1584201600,
        publishedTime: 1584201600,
        workType: 2,
        workForm: 2,
        workField: 2
    },
    {
        addr: userAccount[9].address,
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

const rightTokenName = 'rightToken';
const approveTokenName = 'approveToken';

const ipfsConf = {
    host: '39.102.93.47',
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

const buyOrderContractAddrs = ['jPV4U2huLRaqw9nV7QAkg5oCLb5iEmyZUF'];

const sellOrderContractAddrs = ['jDamHMfeuENdNDzyQciGjojGLuMmRnhifU', 'jBYqBLnr43Giqk7rZGN4fvvFXNW1yU1LcV'];

const availableSellAddrIndex = {
    "中间层":0,
    "用户3":1,
    "用户1":2,
};

const availableSellAddr = {
    0 : "jG1Y4G3omHCAbAWRuuYZ5zwcftXgvfmaX3",
    1 : "jUcCWXZAW9Pyg3vzmGcJ97qHghYE7Udqan",
    2 : "jw382C55JLbLbUJNu8iJtisaqb4TAoQDGC",
};
export {pic, chains, userAccount, userAccountIndex, userMemo, authMemo, rightTokenName, approveTokenName, ipfsConf, mysqlConf, debugMode, buyOrderContractAddrs, sellOrderContractAddrs, availableSellAddr};