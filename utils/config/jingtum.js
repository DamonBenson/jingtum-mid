/**
 * @description 服务器公网IP。
 */
const publicServerAddr = [
    '101.200.197.36',
    '123.57.151.96',
    '182.92.178.101',
    '123.57.149.176',
    '123.56.145.14'
];

/**
 * @description 服务器私网IP。
 */
const privateServerAddr = [
    '172.23.234.81',
    '172.23.234.80',
    '172.23.234.78',
    '172.23.234.79',
    '172.23.234.77',
];

/**
 * @description 自定义账户。
 */
export const userAccount = {

    // 必需用户，需要中间层保存
    baiduAuthorizeAccount: {
        address: 'jfSQTDDZoqVTMwEQwb5FffSyeZ2PDBdVDK',
        secret: 'spxaAv7yVmtd37dPTeFRHksXg2X6q',
    },
    baiduMonitorAccount: {
        address: '',
        secret: '',
    },
    buptAuthorizeAccount: {
        address: 'jhcSBJPB3T6UjiBWHf4riU8PSfxfDCnNsn',
        secret: 'snF4QDLvBCqBs1SfRgBi4ysMoWJYK',
    },
    buptMonitorAccount: {
        address: '',
        secret: '',
    },
    midAccount: {
        address: 'jpY9octvfwBXPNTRqLbYK3ALQBCZkwEFir',
        secret: 'sh5G3N9hYy4xCiQUg5QdVndB2AVFJ',
    },
    matchSystemAccount: {
        address: '',
        secret: '',
    },

    // 模拟用户，仅用于测试阶段
    fakeBaiduAuthorizeAccount: {
        address: 'jniu3438U7HxGbghhtxEP5vLeiJZYQRfjX',
        secret: 'snCeZqbhLqaDUZSWTDjj4GwUVcxcX',
    },
    fakeBaiduMonitorAccount: {
        address: '',
        secret: '',
    },
    authenticateAccount: [
        {
            address: 'jN1rtJiDV741WvbhPs2yTgpGXCBatiB569',
            secret: 'sneqmMbpYGfK9qxSeNUjPKZeRibZR',
        },
        // {
        //     address: '',
        //     secret: '',
        // },
        // {
        //     address: '',
        //     secret: '',
        // },
    ],
    superviseAccount: [
        // {
        //     address: '',
        //     secret: '',
        // },
        // {
        //     address: '',
        //     secret: '',
        // },
        // {
        //     address: '',
        //     secret: '',
        // },
    ],
    platformAccount: [
        {
            address: '',
            secret: '',
        }, // 模拟京东
        {
            address: '',
            secret: '',
        },
        {
            address: '',
            secret: '',
        },
    ],
    normalAccount: [
        {
            secret: 'spmFfWBCZr1sQnMJMshJuz2H2rmxf',
            address: 'jGs7gYsPX5W3ACBNPCHTxPdzqo7huJLmWs'
        }, // 0
        {
            secret: 'snWi7W9rfizrXYedYnewBiBphgivt',
            address: 'jENEFBGLZjSaDzdFyoBvrZirvKrp9jvq1d'
        }, // 1
        {
            secret: 'snxsBHYyNH5TWmYH94ESUNkSz73zL',
            address: 'jspBKDq9qFi2LLeX9izpNoJDZdw6jaN7km'
        }, // 2
        {
            secret: 'sszb1Qqg7Unfa4Cq9jLBwQ21mtzUf',
            address: 'jfmpVMtkTGSm5GZWF7GXuVSdajxi5GsMHa'
        }, // 3
        {
            secret: 'shxWKQ2xDErAg1Nyt5vGr8gQe1CL9',
            address: 'jHFA9BhCDFUvtgeCMi6r8RYf3QUr5bncgf'
        }, // 4
        {
            address: '',
            secret: '',
        }, // 5
        {
            address: '',
            secret: '',
        }, // 6
        {
            address: '',
            secret: '',
        }, // 7
        {
            address: '',
            secret: '',
        }, // 8
        {
            address: '',
            secret: '',
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
            'ws://' + publicServerAddr[2] + ':6020',
            'ws://' + publicServerAddr[3] + ':6020',
            'ws://' + publicServerAddr[4] + ':6020',
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
            },
            charge: {
                address: 'jaW747YSNv8rYcFTr4R6Vd45E1ZhReTxcv',
                secret: 'ssdHzCrubJrJSt2MdPdiwmZdNFvRA',
            },
            admin:{
                address: 'jaZ18NFrvzLuDS8vgFkYD5CoMgZQLXGet4',
                secret: 'sprHsZERKkdm38o7vat8P4y3edMrP',    
            },
            issuer: {
                address: 'jM9ZWv152Zto3EiKfipZW4Gn7w5BcVjLte',
                secret: 'sshdwShymUM38WMuN4RQ6cVHV7j89',
            },
        },
    },

    // chains[1]交易链
    {
        server: [
            'ws://' + publicServerAddr[2] + ':5020',
            'ws://' + publicServerAddr[3] + ':5020',
            'ws://' + publicServerAddr[4] + ':5020',
        ],
        account: {
            root: {
                address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
                secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
            },
            charge: {
                address: 'jhawUYDkdffERMFJvL5TmUtXUuU8NdY6t3',
                secret: 'shzwobQJQGerCefaFR5dEC3vkcnTK',
            },
            admin:{
                address: 'jMqcqm5ENUfwAXv2uSnx4cBYS9DqKkxHEk',
                secret: 'shnDXBA84eojCqipjCK8H3noRpe7F',    
            },
            issuer: {
                address: 'jUrheBTC7N3hCfzY4QJe1jMiqzQXTepwr4',
                secret: 'sh8nBGKfX3bnU5Usc8d3gsyc5uUpB',
            },
        },
    },

    // chains[2]权益链
    // {
    //     server: [
    //         'ws://' + publicServerAddr[0] + ':9030',
    //         'ws://' + publicServerAddr[1] + ':9030',
    //         'ws://' + publicServerAddr[2] + ':9030',
    //     ],
    //     account: {
    //         root: {
    //             address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
    //             secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
    //         },
    //         charge: {
    //             address: 'jEx8qHwy2r5vMrVrbc7i4juWKmtsSm4DS9',
    //             secret: 'snQfZGdaR9sMe7D3uCcEHMvs4ocjA',
    //         },
    //         issuer: {
    //             address: 'jfCdDWueik3AsSjcfcaQsdpFjW8CyZYT76',
    //             secret: 'snjQmeX9gdwuVNHqvypxn2d663jKL',
    //         },
    //     },
    // },

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
    buyOrder: [],
    sellOrder: [],
    authenticate: [],
};