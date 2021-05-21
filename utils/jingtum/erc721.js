import * as localUtils from '../localUtils.js';

import {chains} from '../config/jingtum.js';

const tokenChain = chains[1];
const issuerAddr = tokenChain.account.issuer.address;
const issuerSecr = tokenChain.account.issuer.secret;

/**
 * @description 设置发行权限。
 * @param {Object}remote 底层链连接对象
 * @param {String}publisher 被授权发行的地址
 * @param {int}seq 动态发币账号的交易序列号
 * @param {String}name 被授权发行的通证名称
 * @param {int}num 被授权发行的通证数量
 * @param {int}flag 被授权发行的通证冻结标识
 * @param {String[]}flagAddrs 拥有修改flag权限的地址数组
 * @param {String[]}tokenInfosAddrs 拥有修改tokenInfos权限的地址数组
 * @param {int}refFlag 0-一般通证（版权权利通证）；1-有引用关系的通证（版权许可通证）
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildTokenIssueTx(remote, publisher, seq, name, num, flag, flagAddrs, tokenInfosAddrs, refFlag, showRes) {

    let tx = remote.buildTokenIssueTx({
        account: issuerAddr,
        publisher: publisher,
        token: name,
        number: num,
        flag: flag,
        roles: localUtils.toRolesArr(flagAddrs, tokenInfosAddrs),
        referenceFlag: refFlag,
    });

    tx.setSecret(issuerSecr);

    if(seq) {
        tx.setSequence(seq);
    }

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:', err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTokenIssueTx:', result);
                }
                else {
                    console.log('buildTokenIssueTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });   
    });

}

/**
 * @description 发行一般通证。
 * @param {Object}remote 底层链连接对象
 * @param {String}publisher 发行通证账号的地址
 * @param {String}secret 发行通证账号的私钥
 * @param {int}seq 发行通证账号的交易序列号
 * @param {String}dest 获得通证的地址
 * @param {String}name 待发行通证的名称
 * @param {String}id 待发行通证的标识
 * @param {Object}tokenInfos 待发行通证的通证信息
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildPubTokenTx(remote, publisher, secret, seq, dest, name, id, tokenInfos, showRes) {

    let tx = remote.buildPubTokenTx({
        publisher: publisher,
        receiver: dest,
        token: name,
        tokenId: id,
        tokenInfos: localUtils.obj2tokenInfos(tokenInfos),
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildPubTokenTx:', result);
                }
                else {
                    console.log('buildPubTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 发行引用通证。
 * @param {Object}remote 底层链连接对象
 * @param {String}publisher 发行通证账号的地址
 * @param {String}secret 发行通证账号的私钥
 * @param {int}seq 发行通证账号的交易序列号
 * @param {String}dest 获得通证的地址
 * @param {String}name 待发行通证的名称
 * @param {String}id 待发行通证的标识
 * @param {Object}tokenInfos 发行的通证信息
 * @param {String}refId 待发行通证的被引用通证标识
 * @param {Object}refAddr 待发行通证的被引用通证所有者地址
 * @param {Object}refSecr 待发行通证的被引用通证所有者私钥
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildPubRefTokenTx(remote, publisher, secret, seq, dest, name, id, tokenInfos, refId, refAddr, refSecr, showRes) {

    let tx = remote.buildPubTokenTx({
        publisher: publisher,
        receiver: dest,
        token: name,
        tokenId: id,
        tokenInfos: localUtils.obj2tokenInfos(tokenInfos),
        referenceID: refId,
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    tx.ownerSign({
        account: refAddr,
        secret: refSecr,
    });

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildPubRefTokenTx:', result);
                }
                else {
                    console.log('buildPubRefTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 转让通证。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 通证所有者的地址
 * @param {String}secret 通证所有者的私钥
 * @param {int}seq 通证所有者的交易序列号
 * @param {String}dest 获得通证的地址
 * @param {String}id 待转让通证的标识
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildTransferTokenTx(remote, src, secret, seq, dest, id, showRes) {

    let tx = remote.buildTransferTokenTx({
        owner: src,
        receiver: dest,
        tokenId: id,
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTransferTokenTx:', result);
                }
                else {
                    console.log('buildTransferTokenTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 修改通证信息。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 通证修改者的地址
 * @param {String}secret 通证修改者的私钥
 * @param {int}seq 通证修改者的交易序列号
 * @param {String}id 待修改通证的标识
 * @param {Object}tokenInfos 添加的通证信息
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildTokenInfoChangeTx(remote, src, secret, seq, id, tokenInfos, showRes) {

    let tx = remote.buildTokenChangeTx({
        account: src,
        tokenId: id,
        tokenInfos: localUtils.obj2tokenInfos(tokenInfos),
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }
    
    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTokenInfoChangeTx:', result);
                }
                else {
                    console.log('buildTokenInfoChangeTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 冻结/解冻通证。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 通证修改者的地址
 * @param {String}secret 通证修改者的私钥
 * @param {int}seq 通证修改者的交易序列号
 * @param {String}id 待修改通证的标识
 * @param {int}flag 冻结标识
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
 export function buildTokenFlagChangeTx(remote, src, secret, seq, id, flag, showRes) {

    let tx = remote.buildTokenChangeTx({
        account: src,
        tokenId: id,
        flags: flag,
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('buildTokenFlagChangeTx:', result);
                }
                else {
                    console.log('buildTokenFlagChangeTx:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });

}

/**
 * @description 查询通证信息。
 * @param {Object}remote 底层链连接对象
 * @param {String}id 待查询通证的标识
 * @param {bool}showRes 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
export function requestTokenInfo(remote, id, showRes) {

    let req = remote.requestTokenInfo({
        tokenId: id,
    });

    return new Promise((resolve, reject) => {
        req.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject('err');
            }
            else if(result){
                if(showRes) {
                    console.log('requestTokenInfo:', result);
                }
                resolve(result);
            }
        });
    });

}