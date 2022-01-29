import * as localUtils from '../localUtils.js';

import {chains} from '../config/jingtum.js';

const tokenChain = chains[1];
const issuerAddr = tokenChain.account.issuer.address;
const issuerSecr = tokenChain.account.issuer.secret;
/**
 * @description 发行通证（V2）。
 * @param {String}publisher 底层链连接对象
 * @param {String}receiver 待查询通证的标识
 * @param {String}token 是否显示结果
 * @param {Number}referenceFlag 是否显示结果
 * @param {Object}tokenObject 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
 export function buildIssueInfoModifyTxLayer(remote, secret, account,  publisher, token, flag, roles, showRes = false) {
    let tx = remote.buildPublishTokenTxLayer({
        account : account,
        publisher : publisher,
        token : token,
        flag : flag, 
        roles : roles
    });

    tx.setSecret(secret);
   
    return _returnPromise(tx,'buildPublishTokenTxLayer', showRes);

}

/**
 * @description 发行通证（V2）。
 * @param {String}publisher 底层链连接对象
 * @param {String}receiver 待查询通证的标识
 * @param {String}token 是否显示结果
 * @param {Number}referenceFlag 是否显示结果
 * @param {Object}tokenObject 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
 export function buildPublishTokenTxLayer(remote, secret, publisher, receiver, token, referenceFlag, tokenObject, showRes = false) {
    let tx = remote.buildPublishTokenTxLayer({
        publisher: publisher,
        receiver: receiver,
        token: token,
        referenceFlag: referenceFlag, 
        tokenObject: tokenObject,
    });

    tx.setSecret(secret);
   
    return _returnPromise(tx,'buildPublishTokenTxLayer', showRes);

}

/**
 * @description 发行通证（V2）。
 * @param {String}publisher 底层链连接对象
 * @param {String}receiver 待查询通证的标识
 * @param {String}token 是否显示结果
 * @param {Number}referenceFlag 是否显示结果
 * @param {Object}tokenObject 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
export function buildPublishTokenTxLayer(remote, secret, publisher, receiver, token, referenceFlag, tokenObject, showRes = false) {
    let tx = remote.buildPublishTokenTxLayer({
        publisher: publisher,
        receiver: receiver,
        token: token,
        referenceFlag: referenceFlag, 
        tokenObject: tokenObject,
    });

    tx.setSecret(secret);
   
    return _returnPromise(tx,'buildPublishTokenTxLayer', showRes);

}

/**
 * @description 修改确权信息。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 通证修改者的地址
 * @param {String}secret 通证修改者的私钥
 * @param {String}id 待修改通证的标识
 * @param {Object}tokenInfos 添加的通证信息
 * @param {boolean}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildModifyAuthenticationInfoTxLayer(remote , src , secret , id , authenticationInfo , showRes = true) {

    let tx = remote.buildModifyAuthenticationInfoTxLayer({
        // account: role1.address,
        // tokenId: 'A44B02EEB5DA7C0CA6A95921248949B88F34D1E6D23580B974CE309A048380D4'，
        // authenticationInfo: {
        //     authenticationInstitudeName: 'j3BS6rtKPmrD5WhMqWZuhmcwaH9f3Hdnh4', 
        //     authenticationId: 'rightId_003', 
        //     authenticatedDate:'2021-12-31'
        account: src,
        tokenId: id,
        authenticationInfo: authenticationInfo,
    });

    tx.setSecret(secret);
    return _returnPromise(tx,'buildModifyAuthenticationInfoTxLayer', showRes);
}


/**
 * @description 查看单个版权通证详情（V2）。
 * @param {Object}remote 底层链连接对象
 * @param {String}id 待查询通证的标识
 * @param {boolean}showRes 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
export function requestCopyrightTokenInfoLayer(remote, id, showRes = true) {

    let tx = remote.requestTokenInfo({
        // tokenId: 'AA4B02EEB5DA7C0CA6A95921248949B88F34D1E6D23580B974CE309A048380D3'
        tokenId: id,
    });

    return _returnPromise(tx ,'requestCopyrightTokenInfoLayer' , showRes);
}

function _returnPromise(tx, funName, showRes){
    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log(funName, 'tx:', tx);
                console.log('err:',err);
                reject(err);
            }
            else if(result){
                if(showRes) {
                    console.log('tx:', tx);
                    console.log('',funName,':', result);
                }
                else {
                    console.log('',funName,':',result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });
}

