/**
 * @description 服务器公网IP。
 */
const publicServerAddr = [
    '39.102.92.249',
    '39.102.90.153',
    '39.102.92.229',
];

/**
 * @description 服务器私网IP。
 */
const privateServerAddr = [
    '172.31.43.240',
    '172.31.43.238',
    '172.31.43.239',
];

/**
 * @description 自定义账户。
 */
export const userAccount = {

    // 必需用户，需要中间层保存
    baiduAuthorizeAccount: {
        address: 'jB7rxgh43ncbTX4WeMoeadiGMfmfqY2xLZ',
        secret: '',
    },
    baiduMonitorAccount: {
        address: '',
        secret: '',
    },
    buptAuthorizeAccount: {
        address: 'jJB4YxZz3haRJ7Njh86SHtGd7nk7xtyPR6',
        secret: 'saBoC8kDkPMxR4Z4eom4LCprhopw8',
    },
    buptMonitorAccount: {
        address: 'jEuVbvfCXayJY79hbUZLxMaN6KrMuguMok',
        secret: 'ssrEKS2SZ5AweA8YRPofbSNJY7BYd',
    },
    midAccount: {
        address: 'j3Ztxf6SRsAmubze8i8sd1TWeadoazDpPz',
        secret: 'ssMENrDFyyoGSmnrKHfz3jLn714rq',
    },
    matchSystemAccount: {
        address: 'jJsvjvitGBnPSscTAtdqS3VYFzTffeKA7M',
        secret: 'ssc81hxJzNFK39zK7BLAVk5ZM5Y6X',
    },

    // 模拟用户，仅用于测试阶段
    fakeBaiduAuthorizeAccount: {
        address: 'jGt4jgACfyFaW7AkPb48PRsD64491M85GF',
        secret: 'spzH4oxRN1DhnkfYbohgbTyufQ43C',
    },
    fakeBaiduMonitorAccount: {
        address: 'jUGPB5wbeVCR2YqnPmRg2Ct6BVzPyexCzi',
        secret: 'sshHBqn6EcBiTmxrmhtwkZL8Ux8pq',
    },
    authenticateAccount: [
        {
            address: 'jJEu6rexDXzxcgZ9QJQLbmv8yVxCG6nsR7',
            secret: 'sneXVjunrxzhYhxDiBjsKktamqEkT',
        },
        {
            address: 'jHBcbQhMj9GJxsU21hJFnkXdsQQCRSLYZL',
            secret: 'ssjN4uXZabHDHh1ZHGkE3pcKCir8a',
        },
        {
            address: 'jLzeqpW9Dyi1hRTVcFTfg3etzsmkV2atsn',
            secret: 'snAA68npSXvfzP1e2C8ijWi6QNuca',
        },
    ],
    superviseAccount: [
        {
            address: 'j9evNeEWz4oGqwjNBmG1wTfS1tpyNhy3EW',
            secret: 'sajkSufoJay2TcJfxDKRdxdx7EayS',
        },
        {
            address: 'j4X6uBNtpy2SNTmWaJmzZ5vctauL5rB2MG',
            secret: 'shiMBzrVUJDaG1ZGcu9jQfvaurGvJ',
        },
        {
            address: 'jUuYkb47vBPjzr24Xa3tuaPc4W2fkeAE3h',
            secret: 'saszDK4gSFXJ8p83B3sr7x8m8q6si',
        },
    ],
    platformAccount: [
        {
            address: 'jppLWezdLH7an7Jd1wWcvRNtQEuMkPJN5G',
            secret: 'snrVmjunkyidZeGUDgWjvq1BjHnQu',
        }, // 模拟京东
        {
            address: 'jHa7hyXBe5v2qY6qMhb4SgoUmQqMYuX9Td',
            secret: 'shj2CXv1c36xM68UQGRfvnCRrMBbP',
        },
        {
            address: 'jwTRbQE2kXCJNKct1yjxjRvFaVYup2bA3W',
            secret: 'ssUCnrpk5bJS6sXpZpKWcZdmgz2XS',
        },
    ],
    // platformAccount: [
    //     {
    //         address: 'jJRtZaLZ28TFfRevGKXFVwGqwQ4YxdAhHr',
    //         secret: 'sh8MUA9X2sfaGsB7qXSbNg5yXf1xt',
    //     },
    //     {
    //         address: 'jEbDUTHNGCA1L6hYyShFn7o8coDHV7MYAy',
    //         secret: 'sn6mZDMWccNDChyoTfV7PmmVUeLAY',
    //     },
    //     {
    //         address: 'jMJJtctjcJ7GonDV8boFNSQvwitWyNbHJp',
    //         secret: 'spobuv7XaLfZuBP4GPDw2XprvGfrG',
    //     },
    // ],
    normalAccount: [
        {
            address: 'jnuf1Hrd5cMZaxDHBPYPzmLvgt4svvSpjG',
            secret: 'ssbDUUytaiEtdpcJMscRaJVcEoEQQ',
        }, // 0
        {
            address: 'j4M6Hb65iKUVyzRNVYCCvqnpB6q4j7TT9Q',
            secret: 'shzKzpESdq4GE7jhDMbRoYNsnwfH2',
        }, // 1
        {
            address: 'j9FCRZNximd3wJUNH3AiFj5giM5XbhWVSC',
            secret: 'sp6ywrLu31PkPejwN627cndecDcma',
        }, // 2
        {
            address: 'j323rBW8jC6TzkmpCAsR8JeRGx2mDCUaFa',
            secret: 'snqMbgtg9B8K4T1fYEaBG1xoSuU5B',
        }, // 3
        {
            address: 'j953BZNrVXF9Qec238zXpqYNdVFLbRDH8W',
            secret: 'snyvZNLY6orEQA6yEgRrXR6ryh9YV',
        }, // 4
        {
            address: 'jByJnnNXKcb5kzngJgPZe5JgtuQnoEfGCm',
            secret: 'shqfUo13UF2x6VX9EKmtaPLF6VSDm',
        }, // 5
        {
            address: 'jD3bw7vcW6jXtrwKxygYqkBCjEkXMGQRCp',
            secret: 'snRNqTpMZJFGXW33qi8qigUCAVW89',
        }, // 6
        {
            address: 'j9KoRbsda9VMoCKsaRsTYZHiRkdkXc8cHd',
            secret: 'snd9CB5qXnoqLCdEsLCTBrCs9F3kt',
        }, // 7
        {
            address: 'jKRmxgPUr4WGSNNUekWqi8oCkFD8bXZBY5',
            secret: 'snHpgAomPu4HeCv5ALVrppDKjTJkB',
        }, // 8
        {
            address: 'jft9cFxf2LjSTuqfGFMwiZG3qguaYAkepx',
            secret: 'snvHhnLwWihnXiuLD2LvcdAiyg3qy',
        }, // 9
    ],

};

/**
 * @description 底层链地址及系统账户。
 */
export const chains = [
    
    // chains[0]存证链
    {
        server: [
            'ws://' + publicServerAddr[0] + ':5020',
            'ws://' + publicServerAddr[1] + ':5020',
            'ws://' + publicServerAddr[2] + ':5020',
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
        },
    },

    // chains[1]交易链
    {
        server: [
            'ws://' + publicServerAddr[0] + ':6020',
            'ws://' + publicServerAddr[1] + ':6060',
            'ws://' + publicServerAddr[2] + ':6020',
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
        },
    },

    // chains[2]权益链
    {
        server: [
            'ws://' + publicServerAddr[0] + ':9030',
            'ws://' + publicServerAddr[1] + ':9030',
            'ws://' + publicServerAddr[2] + ':9030',
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
            },
            charge: {
                address: 'jEx8qHwy2r5vMrVrbc7i4juWKmtsSm4DS9',
                secret: 'snQfZGdaR9sMe7D3uCcEHMvs4ocjA',
            },
            issuer: {
                address: 'jfCdDWueik3AsSjcfcaQsdpFjW8CyZYT76',
                secret: 'snjQmeX9gdwuVNHqvypxn2d663jKL',
            },
        },
    },

];

/**
 * @description 各类通证名称。
 */
export const tokenName = {
    copyright: 'rightToken_test1',
    approve: 'approveToken_test1',
};

/**
 * @description 各类合约地址。
 */
export const contractAddr = {
    buyOrder: ['jpbMGH1VJTfdi8KHkEaqk5tr8hF3Q2Svnr'],
    sellOrder: ['jfmtPmUz9e5v9SfhFXzQZ8YiUC8vsVEz5H', 'j31Emyp5KUaoEyLhFUmp7xYfw9sdWP5byx'],
    authenticate: [],
};