import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as tx from '../../utils/jingtum/tx.js';
import * as erc721 from '../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../utils/ipfsUtils.js';
import * as localUtils from '../../utils/localUtils.js';
import * as mimic from './backendProcessor/MimicAuthInsert.js';

import {userAccount, chains, tokenName} from '../../utils/config/jingtum.js';

const uploadChain = chains[0];
const tokenChain = chains[1];

const fakeBaiduAuthorizeAddr = userAccount.fakeBaiduAuthorizeAccount.address;
const fakeBaiduAuthorizeSecr = userAccount.fakeBaiduAuthorizeAccount.secret;

const Remote = jlib.Remote;
const uploadRemote = new Remote({server: uploadChain.server[0], local_sign: true});
const tokenRemote = new Remote({server: tokenChain.server[0], local_sign: true});

// 连接到存证链
uploadRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }

    // 连接到交易链
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

            let workInfo = JSON.stringify(await generateWorkInfo());
            let recvAddr = userAccount.normalAccount[0].address;
            let workRes = await tx.buildPaymentTx(uploadRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, uploadSeq++, recvAddr, 0.000001, workInfo, false);

            // let workId = workRes.tx_json.hash;
            // let copyrightInfoArr = await generateCopyrightInfo();

            // copyrightInfoArr.forEach(async (copyrightInfo, index) => {
            //     console.log("index",index);
            //     console.log("copyrightInfo.workId",workId)
            //     copyrightInfo.workId = workId;
            //     copyrightInfo = copyrightInfo;
            //     let tokenId = sha256(workId + copyrightInfo.copyrightType).toString();
            //     // console.log(copyrightInfo);
            //     let copyrightRes = await erc721.buildPubTokenTx(tokenRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, tokenSeq++, recvAddr, tokenName.copyright, tokenId, copyrightInfo, false);
            // })
            console.log("workRes:", workRes)
            await localUtils.sleep(10000);

        }

    });

});


async function generateWorkInfo() {

    // let workInfo = mimic.generateworkAuth();

    let fileInfoListHash = await ipfsUtils.add(workInfo.fileInfoList);
    // let publishInfoHash = null;
    // if (workInfo.publishStatus == "Published"){
    //     publishInfoHash = await ipfsUtils.add(workInfo.publishInfo);
    // }
    workInfo.fileInfoList = fileInfoListHash;
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

async function generateCopyrightInfo() {

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
    let copyrightInfoArr = 
    { 
        flag: 0,
        tokenId:
         '7a20311cf7a4b222d436424480bc65dd0f9d2cefcbbb1fa148ca0d7e1d5bb55a',
        copyrightType: 16,
        copyrightTypeGetType: 1,
        workId: 3,
        authenticationInfo:
         [ { authenticationInstitudeName: 'jfSQTDDZoqVTMwEQwb5FffSyeZ2PDBdVDK',
             authenticationId: 'rightId001',
             authenticatedDate: '2021-12-31' } ],
        copyrightUnits:
         [ { address: 'jLiDHBMyBQr2oSTQca887wsGjZ5PwfGqnJ',
             proportion: '59.9',
             copyrightExplain: '权利说明' },
           { address: 'jP27V7BqmT3NsfeEu9pN7K76ANYrxy9HGe',
             proportion: '40.1',
             copyrightExplain: '权利说明' } ],
        copyrightConstraint: [ { copyrightLimit: 11 } ],
        apprConstraint:
         [ { channel: '1',
             area: '0',
             time: '1',
             transferType: 1,
             reapproveType: 1 } ],
        licenseConstraint: [ { type: '0', area: '0', time: '0' } ],
        constraintExplain: 'aaaa',
        constraintExpand: 1,
        copyrightStatus:
         [ { publishStatus: 0,
             publishCity: '天津市',
             publishCountry: '中国',
             publishDate: '2022-01-14',
             comeoutStatus: 0,
             comeoutCity: '',
             comeoutCountry: '中国',
             comeoutDate: '',
             issueStatus: 0,
             issueCity: '',
             issueCountry: '中国',
             issueDate: '' } ] 
    };
    return copyrightInfoArr;
    
}

