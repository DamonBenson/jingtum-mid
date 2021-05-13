
/**
 * @description 自定义账户。
 */
export const userAccount = {

    // 必需用户，需要中间层保存
    authorizeAccount: {
        
    },
    midAccount: {

    },
    matchSystemAccount: {

    },

    // 模拟用户，仅用于测试阶段
    authenticateAccount: [
        {
            
        },
        {
            
        },
        {

        },
    ],
    buyPlatformAccount: [
        {

        },
        {

        },
        {

        },
    ],
    sellPlatformAccount: [
        {

        },
        {

        },
        {

        },
    ],
    normalAccount: [

    ],

};

/**
 * @description 底层链地址及系统账户。
 */
export const chains = [
    
    // chains[0]存证链
    {
        server: [
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
        },
    },

    // chains[1]交易链
    {
        server: [
            'ws://39.102.92.249:9030',
            'ws://39.102.90.153:9030',
            'ws://39.102.92.229:9030',
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

    // chains[2]权益链
    {
        server: [
            'ws://39.102.92.249:9030',
            'ws://39.102.90.153:9030',
            'ws://39.102.92.229:9030',
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
    copyright: 'rightToken',
    approve: 'approveToken',
};

/**
 * @description 各类合约地址。
 */
export const contractAddr = {
    buyOrder: [],
    sellOrder: [],
    authenticate: [],
};