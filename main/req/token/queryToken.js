;import jlib from 'jingtum-lib';
import sha256 from 'crypto-js/sha256.js';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as tx from '../../../utils/jingtum/tx.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as tokenLayer from '../../../utils/jingtum/tokenLayer.js';
import * as localUtils from '../../../utils/localUtils.js';
import {userAccount, chains, tokenName} from '../../../utils/config/jingtum.js';
const u = jlib.utils;
const uploadChain = chains[0];
const tokenChain = chains[1];

const fakeBaiduAuthorizeAddr = userAccount.fakeBaiduAuthorizeAccount.address;
const fakeBaiduAuthorizeSecr = userAccount.fakeBaiduAuthorizeAccount.secret;


const Remote = jlib.Remote;
const uploadRemote = new Remote({server: uploadChain.server[2], local_sign: true});
const tokenRemote = new Remote({server: tokenChain.server[2], local_sign: true});
// workId                      2B888AEF7ACE902E4E07CF0003A425947CA3D172725A251AF2054AFA2D3C56A9
// 发布通证的 TxHash            E6092D1F30A12553CA3B12C11F525B6DC8621BB6CD25385AF652501E1B9E3349
// 发布通证的 CopyrightId       9A3EB0597A1154C15CCC018C9FA24328E2C7FB5EC6D7DEBAF2AA54AC19A5B253
// 查询通证信息
let copyrightId = "65D837913B37330D6ADFBE6FF32C56F71B97D87D57459328423262F4027B8770"

// 连接到通证链
tokenRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    
    // 按照copyrightId请求CopyrightToken
    let txInfo = await tokenLayer.requestCopyrightTokenInfoLayer(tokenRemote, copyrightId);

    let tokenInfos = txInfo.TokenInfo;
    // console.log('tokenInfosTokenTx...............');//接受的tokenObj
    // console.log('tokenInfosTokenTx:', tokenInfos);
    // let tokenInfosObj = localUtils.tokenInfos2obj(tokenInfos);
    let tokenInfosObj = tokenInfos;
    let copyrightInfo = Object();
    copyrightInfo = praseCopyrightToken(tokenInfosObj);

    // let processedTx = u.processTx(txInfo, userAccount.fakeBaiduAuthorizeAccount.address);
    // console.log(JSON.parse(processedTx.memos[0].MemoData));
    console.log("TokenInfo:", txInfo.TokenInfo);
    console.log("copyrightInfo:", copyrightInfo);
    console.log("authenticationInfos:", txInfo.TokenInfo.authenticationInfos);


});
function praseCopyrightToken(tokenInfosObj){
    let copyrightInfo = Object();
    // *** CopyrightToken *** //
    copyrightInfo.TokenId                               = tokenInfosObj.tokenId;
    copyrightInfo.adminAddress                          = tokenInfosObj.adminAddress;
    copyrightInfo.timestamp                             = tokenInfosObj.Timestamp;
    if(tokenInfosObj.authenticationInfo){
        copyrightInfo.authenticationInfo                = JSON.stringify(tokenInfosObj.authenticationInfos);                   
    }else{
        copyrightInfo.authenticationInfo                = JSON.stringify({"authenticationInstitudeName":"","authenticationId":"","authenticatedDate":""});                   
    }
    copyrightInfo.copyrightType                         = tokenInfosObj.copyrightType;
    copyrightInfo.copyrightGetType                      = tokenInfosObj.copyrightTypeGetType;
    copyrightInfo.copyrightUnit                         = JSON.stringify(tokenInfosObj.copyrightUnits);
    let copyrightConstraint = tokenInfosObj.copyrightConstraint[0];
    copyrightInfo.copyrightConstraint_copyrightLimit=copyrightConstraint.copyrightLimit;
    let apprConstraint = tokenInfosObj.apprConstraint[0];
    copyrightInfo.apprConstraint_channel=tokenInfosObj.apprConstraint[0].area;
    copyrightInfo.apprConstraint_area=apprConstraint.channel;
    copyrightInfo.apprConstraint_time=apprConstraint.time;
    copyrightInfo.apprConstraint_transferType=apprConstraint.reapproveType;
    copyrightInfo.apprConstraint_reapproveType=apprConstraint.transferType;
    let licenseConstraint = tokenInfosObj.licenseConstraint[0];
    copyrightInfo.licenseConstraint_type=licenseConstraint.type;
    copyrightInfo.licenseConstraint_area=licenseConstraint.area;
    copyrightInfo.licenseConstraint_time=licenseConstraint.time;
    copyrightInfo.constraintExplain=tokenInfosObj.constraintExplain;
    copyrightInfo.constraintExpand=tokenInfosObj.constraintExpand;
    copyrightInfo.workId=tokenInfosObj.workId;
    let copyrightStatus = tokenInfosObj.copyrightStatus[0];
    copyrightInfo.publishStatus = copyrightStatus.publishStatus;
    copyrightInfo.publishCity = copyrightStatus.publishCity;
    copyrightInfo.publishCountry = copyrightStatus.publishCountry;
    copyrightInfo.publishDate = copyrightStatus.publishDate;
    copyrightInfo.comeoutStatus = copyrightStatus.comeoutStatus;
    copyrightInfo.comeoutCity = copyrightStatus.domeoutCity;//TODO comeoutCity
    copyrightInfo.comeoutCountry = copyrightStatus.domeoutCountry;//TODO comeoutCountry
    copyrightInfo.comeoutDate = copyrightStatus.domeoutDate;//TODO  comeoutDate
    copyrightInfo.issueStatus = copyrightStatus.issueStatus;
    copyrightInfo.issueCity = copyrightStatus.issueCity;
    copyrightInfo.issueCountry = copyrightStatus.issueCountry;
    copyrightInfo.issueDate = copyrightStatus.issueDate;
    copyrightInfo.flag = tokenInfosObj.flag;

    return copyrightInfo;
}
