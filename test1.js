import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import {userAccount, chains, auditSystemAccount, ipfsConf} from './utils/info.js';
import * as requestInfo from './utils/jingtum/requestInfo.js';
import * as tx from './utils/jingtum/tx.js';
import * as erc721 from './utils/jingtum/erc721.js';
import sha256 from 'crypto-js/sha256.js';
import * as ipfsUtils from './utils/ipfsUtils.js';
import * as localUtils from './utils/localUtils.js';
const ipfs = ipfsAPI(ipfsConf); // ipfs连接
var Remote = jlib.Remote;
var remote = new Remote({server: chains[0].server[0], local_sign:true});
// remote.connect(async function(err, result) {
//     let seq = (await requestInfo.requestAccountInfo(auditSystemAccount.address, remote, false)).account_data.Sequence;
//     let memos0 = JSON.stringify({
//         workName: 'a',
//         workType: 1,
//         fileInfoListHash: await ipfsUtils.add(ipfs, Buffer.from(JSON.stringify([
//             {fileHash:'a',fileType:1,fileAddress:'a'},
//             {fileHash:'a',fileType:1,fileAddress:'a'},
//         ]))),
//         creationType: 1,
//         createdTime: 11111111,
//         createdPlace: 'a',
//         publishStatus: 0,
//     });
//     let memos1 = JSON.stringify({
//         workName: 'a',
//         workType: 1,
        // fileInfoListHash: await ipfsUtils.add(ipfs, Buffer.from(JSON.stringify([
        //     {fileHash:'a',fileType:1,fileAddress:'a'},
        //     {fileHash:'a',fileType:1,fileAddress:'a'},
        // ]))),
//         creationType: 1,
//         createdTime: '11111111',
//         createdPlace: 'a',
//         publishStatus: 1,
//         publishInfoHash: await ipfsUtils.add(ipfs, Buffer.from(JSON.stringify({
//             publishedTime: '11111111',
//             publishedSite: 'a',
//         }))),
//     });
//     tx.buildPaymentTx(auditSystemAccount.address, auditSystemAccount.secret, remote, seq, userAccount[7].address, 0.0001, memos1, true);

// });

const issuer = userAccount[0];
var remote = new Remote({server: chains[0].server[0], local_sign:true});
remote.connect(async function(err, result) {
    if (err) {
        return console.log('err:',err);
    }
    let seq = (await requestInfo.requestAccountInfo(issuer.address, remote, false)).account_data.Sequence;
    let memos = {
        workId: 'a',
        copyrightType: 1,
        idType: 1,
        idNum: 'a',
        copyrightHolderHash: await ipfsUtils.add(ipfs, Buffer.from(JSON.stringify({
            name: 'a',
            nation: 'a',
            province: 'a',
            city: 'a',
            workSig: 'a',
        }))),
    }
    memos = localUtils.obj2memos(memos);
    erc721.buildIssueTokenTx(issuer.secret, remote, seq, issuer.address, userAccount[8].address, 'rightToken', sha256('b').toString(), memos, true);

});

