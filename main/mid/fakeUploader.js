import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as tx from '../../utils/jingtum/tx.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as tokenLayer from '../../utils/jingtum/tokenLayer.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as localUtils from '../../utils/localUtils.js';
import * as mimic from './backendProcessor/MimicAuthInsert.js';

import {userAccount, chains, tokenName} from '../../utils/config/jingtum.js';
const u = jlib.utils;
const uploadChain = chains[0];
const tokenChain = chains[1];

const fakeBaiduAuthorizeAddr = userAccount.fakeBaiduAuthorizeAccount.address;
const fakeBaiduAuthorizeSecr = userAccount.fakeBaiduAuthorizeAccount.secret;

const Remote = jlib.Remote;
const uploadRemote = new Remote({server: uploadChain.server[2], local_sign: true});
const tokenRemote = new Remote({server: tokenChain.server[2], local_sign: true});

// 连接到存证链
uploadRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }

    // 连接到通证链
    tokenRemote.connect(async function(err, res) {

        if(err) {
            return console.log('connect err: ', err);
        }
        else if(res) {
            console.log('connect: ', res);
        }

        let uploadSeq = (await requestInfo.requestAccountInfo(fakeBaiduAuthorizeAddr, uploadRemote, false)).account_data.Sequence;
        let tokenSeq = (await requestInfo.requestAccountInfo(fakeBaiduAuthorizeAddr, tokenRemote, false)).account_data.Sequence;    

        while(true) {
            let recvAddr = userAccount.normalAccount[0].address;
            recvAddr = "jKD1vQRwHTLxZvMWvHRbfAsXecNHKQp8C8";
            recvAddr = "jfSQTDDZoqVTMwEQwb5FffSyeZ2PDBdVDK";
            recvAddr = "ja1Zt6ixoFuwLap2xx7sTD7sjEYqK3vwyz";
            recvAddr = "jLTh5ddGwmvLxrqgPBWY4r1pbJCy9cNmJE";
            // recvAddr = userAccount.authenticateAccount.address;// 测试地址是否合法

            // ***作品存证    Mock***//
            await PublishWork(uploadRemote, uploadSeq, recvAddr);
            await localUtils.sleep(10000);
            let workInfo = JSON.stringify(await generateWorkInfo());
            let TXRes = await tx.buildPaymentTx(uploadRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, uploadSeq++, recvAddr, 0.000001, workInfo, false);
            console.log("TXRes:", TXRes)
            let workId = TXRes.tx_json.hash;
            // let txInfo = await requestInfo.requestTx(uploadRemote, workId, false);
            // let processedTx = u.processTx(txInfo, userAccount.fakeBaiduAuthorizeAccount.address);
            // console.log(JSON.parse(processedTx.memos[0].MemoData));
            uploadSeq++;
            await localUtils.sleep(1000);

            // ***版权通证发行 Mock***//
            let tokenId = await PublishToken(tokenRemote, workId, tokenSeq, recvAddr);
            tokenSeq++;
            await localUtils.sleep(10000);

            // ***版权通证确权 Mock***//
            await ModifyAuthInfo(tokenRemote, tokenSeq, tokenId);
            tokenSeq++;
            await localUtils.sleep(10000);
        }

    });

});

/**
 * @description 作品存证。
 * @param {String}uploadRemote 存证链的连接对象
 * @param {String}uploadSeq 存证链的交易序列号
 * @param {String}recvAddr 通证接受者
 */
async function  PublishWork(uploadRemote, uploadSeq , recvAddr) {
    let workInfo = JSON.stringify(await generateWorkInfo());
    let TXRes = await tx.buildPaymentTx(uploadRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, uploadSeq++, recvAddr, 0.000001, workInfo, false);
    let workId = TXRes.tx_json.hash;
    console.log("workId:", workId)
    let txInfo = await requestInfo.requestTx(uploadRemote, workId, false);
    let processedTx = u.processTx(txInfo, userAccount.fakeBaiduAuthorizeAccount.address);
    console.log(JSON.parse(processedTx.memos[0].MemoData));
    console.log("TXRes:", TXRes)
    await localUtils.sleep(1000);
}

/**
 * @description 版权通证发行。
 * @param {String}tokenRemote 存证链的连接对象
 * @param {String}tokenSeq 存证链的交易序列号
 * @param {String}recvAddr 通证接受者
 */
async function  PublishToken(tokenRemote, workId, tokenSeq, recvAddr) {

    // let recvAddr = userAccount.normalAccount[0].address;
    // // ***版权通证发行 Mock***//
    // let tokenObject = JSON.stringify(await generatecopyrightTokenInfo());
    // console.log("tokenObject",tokenObject);
    // // let tokenId = sha256(workId + copyrightInfo.copyrightType).toString();
    // // let rightTokenId = sha256(workId).toString();
    // let TXRes = tokenLayer.buildPublishTokenTxLayer(tokenRemote, 
    //     fakeBaiduAuthorizeSecr, 
    //     fakeBaiduAuthorizeAddr, 
    //     recvAddr, 
    //     tokenName.copyright, 
    //     1, 
    //     tokenObject
    // );
    // console.log("TXRes:",TXRes);
    // let TXId = TXRes.tx_json.hash;
    // let txInfo = await requestInfo.requestTx(uploadRemote, TXId, false);
    // let processedTx = u.processTx(txInfo, userAccount.fakeBaiduAuthorizeAccount.address);
    // console.log(JSON.parse(processedTx.memos[0].MemoData));
    // console.log("TXRes:", TXRes);

    let Issuer = userAccount.baiduAuthorizeAccount;
    let role1 = {secret: 'sntaa5cuniAWUSKgKTHZm4BVyZq1p',address: 'jwaygG953qSq4dc5mwoTWubWUFmpyvhAYN'};
    let publisherSecr = Issuer.secret;
    let publisher = Issuer.address;
    let token = tokenName.copyright;
    let referenceFlag = 1; //通证标识：1表示版权通证，2表示授权通证，3表示操作许可通证。
    let tokenObject = {
        flag: 0,
        tokenId: sha256( localUtils.randomNumber(100, 2000000000).toString() + workId ).toString(),
        copyrightType: 1,
        copyrightGetType: 2,
        workId: workId,
        authenticationInfos: [],
        copyrightUnits: [
            {address: role1.address, proportion: '1', copyrightExplain:'20%' }
        ],
        copyrightConstraint: [{
              copyrightLimit: 1
        }],
        apprConstraint: [{
              channel:'11111',
              area:'beijing',
              time: '2021-12-31',
              transferType: '1',
              reapproveType: '1'
        }],
        licenseConstraint: [{
              type:'1',
              area:'shanghai',
              time: '2021-12-31'
        }],
        constraintExplain: 'explain',
        constraintExpand: '123456',           
        copyrightStatus: [{
            publishStatus: 0,
            publishCity: 'beijing',
            publishCountry: 'zhongguom',
            publishDate: '2021-12-31',
            comeoutStatus: 0,
            comeoutCity: 'beijing',
            comeoutCountry: 'zhongguo',
            comeoutDate: '2021-12-31',
            issueStatus: 0,
            issueCity: 'beijing',
            issueCountry: 'zhongguo',
            issueDate: '2021-12-31'
        }]
    };
    console.log("tokenObject：",tokenObject);

    let resInfo = await tokenLayer.buildPublishTokenTxLayer(tokenRemote, 
      publisherSecr, 
      publisher, 
      recvAddr, 
      token, 
      referenceFlag, 
      tokenObject
    );
    // console.log("resInfo:",resInfo);
    let txHash = resInfo.tx_json.hash;
    console.log("txHash:", txHash)
    return tokenObject.tokenId;
}

/**
 * @description 版权通证确权。
 * @param {String}tokenRemote 存证链的连接对象
 * @param {String}tokenSeq 存证链的交易序列号
 * @param {String}tokenId 待修改通证的标识
 * @todo  invalid receiver address  authenticateAccount.address
 */
async function  ModifyAuthInfo(tokenRemote, tokenSeq, tokenId) {
    let authenticateAccount = userAccount.authenticateAccount[0];//版权通证确权的确权账号
    let authenticationInfo = {
		authenticationInstitudeName: 'j3BS6rtKPmrD5WhMqWZuhmcwaH9f3Hdnh4', 
		authenticationId: 'rightId_003', 
		authenticatedDate:'2021-12-31'
	};
    let resInfo = await tokenLayer.buildModifyAuthenticationInfoTxLayer(//remote , secret , src , id , authenticationInfo
        tokenRemote,
        authenticateAccount.secret,
        authenticateAccount.address,
        tokenId,
        authenticationInfo
    );
    // let txHash = resInfo.tx_json.hash;
    // console.log("txHash:", txHash)
    console.log("resInfo:",resInfo);
}

async function generateWorkInfo() {

    // let workInfo = mimic.generateworkAuth();

    // let fileInfoListHash = await ipfsUtils.add(workInfo.fileInfoList);
    // let publishInfoHash = null;
    // if (workInfo.publishStatus == "Published"){
    //     publishInfoHash = await ipfsUtils.add(workInfo.publishInfo);
    // }
    // workInfo.fileInfoList = fileInfoListHash;
    // workInfo.publishInfo = publishInfoHash;
    let workInfo = {
        "baseInfo": {
            "workName": "12333",
            "workType": 10,
            "copyrightCreateType": 1,
            "fileInfo": {
                "fileType": 2,
                "fileSize": 423040,
                "fileHash": "QmVVhSjNQ7ZHn8SRwNxtLmQLoj4obH3zKYSH9VxftoAXCV"
            }
        },
        "authorInfo": [
            {
                "idHash": "176666666727",
                "signName": "张三"
            }
        ],
        "extraInfo": {
            "createType": 0,
            "createCity": 130200,
            "createCountry": 0,
            "createDate": "2021-01-01",
            "createDesc": ""
        }
    };
    console.log("workInfo",workInfo);
    return workInfo; 

}

async function generatecopyrightTokenInfo() {

    // let copyrightInfoArr = mimic.generateworkCopyRight();

    // for (let i = 0; i < copyrightInfoArr.length; i++) {

    //     let copyrightInfo = copyrightInfoArr[i];

    //     let copyrightHolder = {
    //         name: copyrightInfo.name,
    //         nation: copyrightInfo.nation,
    //         province: copyrightInfo.province,
    //         city: copyrightInfo.city,
    //         workSig: copyrightInfo.workSig,
    //     }
    //     let copyrightHolderHash = await ipfsUtils.add(copyrightHolder);
    //     copyrightInfo.copyrightHolderHash = copyrightHolderHash;

    //     delete copyrightInfo.name;
    //     delete copyrightInfo.nation;
    //     delete copyrightInfo.province;
    //     delete copyrightInfo.city;
    //     delete copyrightInfo.workSig;

    //     copyrightInfoArr[i] = copyrightInfo;
        
    // }
    // let copyrightInfoArr = 
    // { 
    //     flag: 0,
    //     tokenId:
    //      '7a20311cf7a4b222d436424480bc65dd0f9d2cefcbbb1fa148ca0d7e1d5bb55a',
    //     copyrightType: 16,
    //     copyrightTypeGetType: 1,
    //     workId: 3,
    //     authenticationInfo:
    //      [ { authenticationInstitudeName: 'jfSQTDDZoqVTMwEQwb5FffSyeZ2PDBdVDK',
    //          authenticationId: 'rightId001',
    //          authenticatedDate: '2021-12-31' } ],
    //     copyrightUnits:
    //      [ { address: 'jLiDHBMyBQr2oSTQca887wsGjZ5PwfGqnJ',
    //          proportion: '59.9',
    //          copyrightExplain: '权利说明' },
    //        { address: 'jP27V7BqmT3NsfeEu9pN7K76ANYrxy9HGe',
    //          proportion: '40.1',
    //          copyrightExplain: '权利说明' } ],
    //     copyrightConstraint: [ { copyrightLimit: 11 } ],
    //     apprConstraint:
    //      [ { channel: '1',
    //          area: '0',
    //          time: '1',
    //          transferType: 1,
    //          reapproveType: 1 } ],
    //     licenseConstraint: [ { type: '0', area: '0', time: '0' } ],
    //     constraintExplain: 'aaaa',
    //     constraintExpand: 1,
    //     copyrightStatus:
    //      [ { publishStatus: 0,
    //          publishCity: '天津市',
    //          publishCountry: '中国',
    //          publishDate: '2022-01-14',
    //          comeoutStatus: 0,
    //          comeoutCity: '',
    //          comeoutCountry: '中国',
    //          comeoutDate: '',
    //          issueStatus: 0,
    //          issueCity: '',
    //          issueCountry: '中国',
    //          issueDate: '' } ] 
    // };
    let root = {secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'};
    let Issuer = userAccount.baiduAuthorizeAccount;
    let role1 = {secret: 'sntaa5cuniAWUSKgKTHZm4BVyZq1p',address: 'jwaygG953qSq4dc5mwoTWubWUFmpyvhAYN'};
    let role2 = {secret: 'shepnxJaoR7xXjA8GfmS3A5e4UGUD',address: 'jLiDHBMyBQr2oSTQca887wsGjZ5PwfGqnJ' };
    let publisherSecr = Issuer.secret;
    let publisher = Issuer.address;
    let receiver = role1.address;
    let token = 'AAA';
    let referenceFlag = 1; //通证标识：1表示版权通证，2表示授权通证，3表示操作许可通证。
    let tokenObject = {
        flag: 0,
        tokenId: 'AA4B02EEB5DA7C0CA6A95921248949B88F34D1E6D23580B974CE309A048380D1',
        copyrightType: 1,
        copyrightsGetType: 2,
        workId: '0xA5DE6EE35AB5C4B5E87BE58100058E6030C10ABBE2DAC300FDFBEF315B97546F',
        authenticationInfos: [{
                authenticationInstitudeName: role1.address, 
                authenticationId: 'rightId001', 
                authenticatedDate:'2021-12-31 07:10:00' }],
        copyrightUnits: [
            {address: role1.address, proportion: '0.2', copyrightExplain:'20%' }
        ],
        copyrightConstraint: [{
              copyrightLimit: 1
        }],
        apprConstraint: [{
              channel:'11111',
              area:'beijing',
              time: '2021-12-31',
              transferType: '1',
              reapproveType: '1'
        }],
        licenseConstraint: [{
              type:'1',
              area:'shanghai',
              time: '2021-12-31'
        }],
        constraintExplain: 'explain',
        constraintExpand: '123456',           
        copyrightStatus: [{
            publishStatus: 0,
            publishCity: 'beijing',
            publishCountry: 'zhongguom',
            publishDate: '2021-12-31',
            comeoutStatus: 0,
            comeoutCity: 'beijing',
            comeoutCountry: 'zhongguo',
            comeoutDate: '2021-12-31',
            issueStatus: 0,
            issueCity: 'beijing',
            issueCountry: 'zhongguo',
            issueDate: '2021-12-31'
        }]
    };
    // console.log("copyrightInfoArr",copyrightInfoArr);
    return tokenObject ;
    
}

