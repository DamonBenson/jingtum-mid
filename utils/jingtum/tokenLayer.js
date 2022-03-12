import * as localUtils from '../localUtils.js';

import {chains} from '../config/jingtum.js';

const tokenChain = chains[1];
const issuerAddr = tokenChain.account.issuer.address;
const issuerSecr = tokenChain.account.issuer.secret;
/**
 * @description 修改发行信息（修改冻结标志或者roles列表）。
 * @param {String}account 权限账号
 * @param {String}publisher 发行账号
 * @param {String}token 发行名称
 * @param {Number}referenceFlag 流通标志位
 * @param {Array}roles 控制token权限列表
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
 export function buildIssueInfoModifyTxLayer(remote, secret, account,  publisher, token, flag, roles, IsShowRes = false) {
    let tx = remote.buildIssueInfoModifyTx({
        account : account,
        publisher : publisher,
        token : token,
        flag : flag, 
        roles : roles
    });

    tx.setSecret(secret);
   
    return _returnPromise(tx,'buildIssueInfoModifyTxLayer', IsShowRes);

}

/**
 * @description 发行通证（V2）。
 * @param {String}secret 发行主体的密钥
 * @param {String}publisher 发行主体
 * @param {String}receiver 通证接受者
 * @param {String}token 通证名称
 * @param {Number}referenceFlag 通证标识
 * @param {Object}tokenObject 通证结构体
 * @param {boolean}IsShowRes 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
 export function buildPublishTokenTxLayer(remote, secret, publisher, receiver, token, referenceFlag, tokenObject, IsShowRes = false) {
    let tx = remote.buildPublishTokenTxLayer({
        publisher: publisher,
        receiver: receiver,
        token: token,
        referenceFlag: referenceFlag, 
        tokenObject: tokenObject,
    });

    tx.setSecret(secret);
   
    return _returnPromise(tx,'buildPublishTokenTxLayer', IsShowRes);

}


/**
 * @description 修改确权信息。
 * @param {Object}remote 底层链连接对象
 * @param {String}secret 通证修改者的私钥
 * @param {String}src 通证修改者的地址
 * @param {String}id 待修改通证的标识
 * @param {Object}authenticationInfo 添加的通证信息
 * @param {boolean}IsShowRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildModifyAuthenticationInfoTxLayer(remote , secret , src , id , authenticationInfo , IsShowRes = true) {

    // console.log(authenticationInfo);
    
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
    return _returnPromise(tx,'buildModifyAuthenticationInfoTxLayer', IsShowRes);
}


/**
 * @description 查看单个版权通证详情（V2）。
 * @param {Object}remote 底层链连接对象
 * @param {String}id 待查询通证的标识
 * @param {boolean}IsShowRes 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
export function requestCopyrightTokenInfoLayer(remote, id, IsShowRes = true) {

    let tx = remote.requestTokenInfo({
        // tokenId: 'AA4B02EEB5DA7C0CA6A95921248949B88F34D1E6D23580B974CE309A048380D3'
        tokenId: id,
    });

    return _returnPromise(tx ,'requestCopyrightTokenInfoLayer' , IsShowRes);
}

function _returnPromise(tx, funName, IsShowRes){
    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('交易错误:');
                console.log(funName, 'tx:', tx);
                console.log('err:',err);
                reject(err);
            }
            else if(result){
                console.log('交易正确:');
                if(IsShowRes) {
                    console.log('tx:', tx);
                    console.log('',funName,':', result.tx_json);
                }
                else {
                    console.log('',funName,':',result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });
}

