import fs from 'fs';

const picPath = './resource/test.jpg';
const pic = fs.readFileSync(picPath);

const Account = {
    rootAccount: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
    rootSecret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
    chargeAccount: 'jfHQQqeja9i7CQdYLHbRFPs9sgaxY4S9Wr',
    chargeSecret: 'ssZwTGVwYY2KS2k8N7WskqAKLVSwD',
    issuerAccount: 'jJns7cetGGamKL1WekDgvzViPgEJohj9f2',
    issuerSecret: 'shWTVB7rWk5iip5vWRGiMo2LEkoKo',
    gateAccount: 'jdNdAv5chV3iN44SrxzSbyxBTuSXJXEKq',
    gateSecret: 'ssxpkgauMpf4sYT5CmNm3DXvoGkfN',
}

const Server = {
    s1: 'ws://39.96.5.207:6020',
    s2: 'ws://39.96.27.111:6020',
    s3: 'ws://39.107.124.25:6020',
    s4: 'ws://39.96.28.111:6020',
    s5: 'ws://39.107.113.240:6020',
}

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
]

const authMemo = [
    {
        authCode: 0,
        authName: '天津版权局',
        certNum: 0,
        cert: pic
    },
    {
        authCode: 1,
        authName: '上海版权局',
        certNum: 0,
        cert: pic
    },
    {
        authCode: 2,
        authName: '北京版权保护中心',
        certNum: 0,
        cert: pic
    },
    {
        authCode: 3,
        authName: '国家版权局',
        certNum: 0,
        cert: pic
    }
]

export {Account, Server, userMemo, authMemo};