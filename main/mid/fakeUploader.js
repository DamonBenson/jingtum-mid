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
            let workRes = await tx.buildPaymentTx(uploadRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, uploadSeq++, recvAddr, 0.000001, workInfo, true);

            let workId = workRes.tx_json.hash;
            let copyrightInfoArr = await generateCopyrightInfo();

            copyrightInfoArr.forEach(async (copyrightInfo, index) => {
                if(index != 0) return;
                copyrightInfo.workId = workId;
                copyrightInfo = copyrightInfo;
                let tokenId = sha256(workId + copyrightInfo.copyrightType).toString();
                console.log(copyrightInfo);
                let copyrightRes = await erc721.buildPubTokenTx(tokenRemote, fakeBaiduAuthorizeAddr, fakeBaiduAuthorizeSecr, tokenSeq++, recvAddr, tokenName.copyright, tokenId, copyrightInfo, true);
            })
            
            await localUtils.sleep(10000);

        }

    });

});


async function generateWorkInfo() {

    let workInfo = mimic.generateworkAuth();

    let fileInfoListHash = await ipfsUtils.add(workInfo.fileInfoList);
    let publishInfoHash = await ipfsUtils.add(workInfo.publishInfo);
    workInfo.fileInfoList = fileInfoListHash;
    workInfo.publishInfo = publishInfoHash;

    return workInfo; 

}

async function generateCopyrightInfo() {

    let copyrightInfoArr = mimic.generateworkCopyRight();

    for (let i = 0; i < copyrightInfoArr.length; i++) {

        let copyrightInfo = copyrightInfoArr[i];

        let copyrightHolder = {
            name: copyrightInfo.name,
            nation: copyrightInfo.nation,
            province: copyrightInfo.province,
            city: copyrightInfo.city,
            workSig: copyrightInfo.workSig,
        }
        let copyrightHolderHash = await ipfsUtils.add(copyrightHolder);
        copyrightInfo.copyrightHolder = copyrightHolderHash;

        delete copyrightInfo.name;
        delete copyrightInfo.nation;
        delete copyrightInfo.province;
        delete copyrightInfo.city;
        delete copyrightInfo.workSig;

        copyrightInfoArr[i] = copyrightInfo;
        
    }

    return copyrightInfoArr;
    
}

