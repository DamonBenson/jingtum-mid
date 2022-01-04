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
 * @param {boolean}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildTokenIssueTx(remote, publisher, seq, name, num, flag, flagAddrs, tokenInfosAddrs, refFlag, showRes = true) {

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

    return _returnPromise(tx,'buildTokenIssueTx:', showRes);

}

/**
 * @description 修改确权信息。
 * @param {Object}remote 底层链连接对象
 * @param {String}src 通证修改者的地址
 * @param {String}secret 通证修改者的私钥
 * @param {int}seq 通证修改者的交易序列号
 * @param {String}id 待修改通证的标识
 * @param {Object}tokenInfos 添加的通证信息
 * @param {boolean}showRes 是否显示结果
 * @returns {Object} 交易处理结果，具体格式见jingtum-lib文档
 */
export function buildModifyAuthenticationInfoTxLayer(remote, src, secret, seq, id, tokenInfos, showRes = true) {

    let tx = remote.buildModifyAuthenticationInfoTxLayer({
        account: src,
        tokenId: id,
        right: tokenInfos,
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    return _returnPromise(tx,'buildModifyAuthenticationInfoTxLayer:', showRes);
}


/**
 * @description 查看单个版权通证详情（V2）。
 * @param {Object}remote 底层链连接对象
 * @param {String}id 待查询通证的标识
 * @param {boolean}showRes 是否显示结果
 * @returns {Object} 查询结果，具体格式见jingtum-lib文档
 */
export function requestCopyrightTokenInfoLayer(remote, id, showRes= true) {

    let tx = remote.requestTokenInfo({
        tokenId: id,
    });

    return _returnPromise(tx,'requestTokenInfo:', showRes);

}

function _returnPromise(tx,funName, showRes){
    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject(err);
            }
            else if(result){
                if(showRes) {
                    console.log('buildModifyAuthenticationInfoTxLayer:', result);
                }
                else {
                    console.log('buildModifyAuthenticationInfoTxLayer:', result.engine_result + "_" + result.tx_json.Sequence);
                }
                resolve(result);
            }
        });
    });
}

