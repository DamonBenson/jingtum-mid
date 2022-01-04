import fs from 'fs';
import crypto from 'crypto';
import sha256 from 'crypto-js/sha256.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import moment from 'moment';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as authValidate from '../../../utils/validateUtils/auth.js';
import * as httpUtils from "../../../utils/httpUtils.js";
import * as ipfsUtils from "../../../utils/ipfsUtils.js";
import {userAccount} from '../../../utils/config/jingtum.js';
import {mysqlConf} from '../../../utils/config/mysql.js';
import {debugMode, ipfsConf} from "../../../utils/info.js";
import ipfsAPI from "ipfs-api";
import {addFile} from "../../../utils/ipfsUtils.js";
import {subjectInfo} from '../../../utils/config/auth.js';
import {downloadToIPFS} from "../../../utils/httpUtils.js";
import formData from "form-data";

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
setInterval(() => c.ping(err => console.log('MySQL ping err:', err)), 600000);
const ipfs = ipfsAPI(ipfsConf); // ipfs连接

const authenticateAddr = userAccount.authenticateAccount[0].address;
const authenticateSecr = userAccount.authenticateAccount[0].secret;
const basePath = ".";

// /*----------作品确权请求----------*/

// export async function handleWorkAuth(contractRemote, seqObj, req, res) {

//     console.time('handleWorkAuth');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = JSON.parse(Object.keys(req.body)[0]);
//     let [validateInfoRes, validateInfo] = await authValidate.validateWorkAuthReq(body);
//     if(!validateInfoRes) {
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = validateInfo;
//         return resInfo;
//     }

//     resInfo.data = body;
//     console.log('resInfo:', resInfo);

//     console.timeEnd('handleWorkAuth');
//     console.log('--------------------');
    
//     return resInfo;

// }

/**
 * @description 版权确权，平台签名
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}platformAddr 平台地址
 * @param {String}contractAddr 确权合约地址
 * @returns 
 */
// export async function handleCopyrightAuth(contractRemote, seqObj, req) {

//     console.time('handleCopyrightAuth');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = req.body;
//     try {
//         await authValidate.copyrightAuthReqSchema.validateAsync(body);
//     } catch(e) {
//         e.details.map((detail, index) => {
//             console.log('error message ' + index + ':', detail.message);
//         });
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = e;
//         console.timeEnd('handleCopyrightAuth');
//         console.log('--------------------');
//         return resInfo;
//     }

//     //方法体

//     console.timeEnd('handleCopyrightAuth');
//     console.log('--------------------');

//     return resInfo;

// }

/**
 * @description 查询审核情况，中间层签名
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}contractAddr 确权合约地址
 * @returns {Object[]} 审核情况列表，包括：审核状态auditStatus、审核结果copyrightStatus、确权标识authenticationId、确权证书索引licenseUrl
 */
// export async function handleAuthState(contractRemote, seqObj, req) {

//     console.time('handleAuthState');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = req.query;
//     try {
//         await authValidate.authStateReqSchema.validateAsync(body);
//     } catch(e) {
//         e.details.map((detail, index) => {
//             console.log('error message ' + index + ':', detail.message);
//         });
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = e;
//         console.timeEnd('handleAuthState');
//         console.log('--------------------');
//         return resInfo;
//     }

//     // 方法体  

//     console.timeEnd('handleAuthState');
//     console.log('--------------------');

//     resInfo.data.auditInfoList = auditInfoList;

//     return resInfo;

// }

/**
 * @description 不通过合约完成同步作品确权
 * @param {int}workId 作品标识
 * @param {String}address 确权用户地址
 * @returns {Object} 确权信息，包括：审核结果auditResult、确权标识authenticationId、登记确权证书索引licenseUrl、确权时间戳timestamp
 */
export async function handleInnerWorkAuth(tokenRemote, seqObj, req) {

    console.time('handleInnerWorkAuth');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    console.log(body);
    try {
        await authValidate.innerWorkAuthReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/auth/innerWork:', resInfo.data);
        console.timeEnd('handleInnerWorkAuth');
        console.log('--------------------');
        return resInfo;
    }

    // 方法体
    let copyrightFilter = {
        work_id: body.workId,
        address: body.address,
    }
    let sql = sqlText.table('right_token_info').field('copyright_id').where(copyrightFilter).select();
    let copyrightInfoArr = await mysqlUtils.sql(c, sql);
    if(copyrightInfoArr.length == 0) {
        resInfo.msg = 'no data',
        resInfo.code = 6;
        console.log('/auth/innerWork:', resInfo);
        console.timeEnd('handleInnerWorkAuth');
        console.log('--------------------');
        return resInfo;
    }
    let copyrightIds = copyrightInfoArr.map(copyrightInfo => copyrightInfo.copyright_id);

    // let auditResult = localUtils.randomSelect([true, false], [0.8, 0.2]);
    let auditResult = true;
    if(auditResult == false) {
        resInfo.data.authenticationInfo = {
            auditResult: false,
        };
        console.log('/auth/innerWork:', resInfo.data);
        console.timeEnd('handleInnerWorkAuth');
        console.log('--------------------');
        return resInfo;
    }

    let authenticationId = 'DCI' + sha256(copyrightIds).toString().substring(0, 8);
    let licenseUrl = 'http://118.190.39.87:5001/api/v0/cat?arg=QmW7AqqmFkzEmebuCe9MUvUpXMA4fYZgMvicvufi1NdBEF';
    let authenticationInfo = {
        authenticationId: authenticationId,
        licenseUrl: licenseUrl,
    };

    let authenticatePromises = copyrightIds.map(copyrightId => {
        return (erc721.buildTokenInfoChangeTx(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authenticationInfo, false));
    });

    let authenticateResArr = await Promise.all(authenticatePromises);

    let txHash = authenticateResArr[0].tx_json.hash;
    let txInfo = await requestInfo.requestTx(tokenRemote, txHash, true);
    let timestamp = txInfo.Timestamp + 946684800;
    authenticationInfo.auditResult = true;
    authenticationInfo.timestamp = timestamp;

    resInfo.data.authenticationInfo = authenticationInfo;
    console.log('/auth/innerWork:', resInfo.data);

    console.timeEnd('handleInnerWorkAuth');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 不通过合约完成同步版权确权
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @returns {Object[]} 确权信息列表，包括：版权权利通证标识copyrightId、审核结果auditResult、确权标识authenticationId、登记确权证书索引licenseUrl、确权时间戳timestamp
 */
// export async function handleInnerCopyrightAuth(tokenRemote, seqObj, req) {

//     console.time('handleInnerCopyrightAuth');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = req.body;
//     try {
//         await authValidate.innerCopyrightAuthReqSchema.validateAsync(body);
//     } catch(e) {
//         e.details.map((detail, index) => {
//             console.log('error message ' + index + ':', detail.message);
//         });
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = e;
//         console.timeEnd('handleInnerCopyrightAuth');
//         console.log('--------------------');
//         return resInfo;
//     }

//     //方法体
//     let copyrightIds = body.copyrightIds;
//     let authenticationInfoList = new Array(copyrightIds.length);
//     let authenticatePromises = copyrightIds.map((copyrightId, index) => {
//         let auditResult = localUtils.randomSelect([true, false], [0.8, 0.2]);
//         authenticationInfoList[index] = {
//             copyrightId: copyrightId,
//             auditResult: auditResult,
//         }
//         if(auditResult) {
//             let authenticationId = 'DCI' + copyrightId.substring(copyrightId.length - 8, copyrightId.length);
//             let licenseUrl = 'http://auth.com/' + authenticationId + '.pdf';
//             let authInfo = {
//                 authenticationId: authenticationId,
//                 licenseUrl: licenseUrl,
//             }
//             Object.assign(authenticationInfoList[index], authInfo);
//             return (erc721.buildTokenInfoChangeTx(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authInfo, false));
//         }
//         return null;
//     });

//     let authenticateResArr = await Promise.all(authenticatePromises);

//     let txInfoPromises = authenticateResArr.map(authenticateRes => {
//         if(authenticateRes) {
//             let txHash = authenticateRes.tx_json.hash;
//             return requestInfo.requestTx(tokenRemote, txHash, false);
//         }
//         return null;
//     });

//     let txInfoResArr = await Promise.all(txInfoPromises);

//     txInfoResArr.forEach((txInfoRes, index) => {
//         if(txInfoRes) {
//             authenticationInfoList[index].timestamp = txInfoRes.Timestamp + 946684800;
//         }
//     });

//     resInfo.data.authenticationInfoList = authenticationInfoList;
//     console.log('/auth/innerCopyright:', resInfo.data);

//     console.timeEnd('handleInnerCopyrightAuth');
//     console.log('--------------------');

//     return resInfo;

// }

/**
 * @description 不通过合约完成同步作品确权
 * @param {int}workId 作品标识
 * @param {String}address 确权用户地址
 */
export async function handleWorkAuth(tokenRemote, seqObj, req) {

    console.time('handleWorkAuth');

    let body = req.body;
    try {
        await authValidate.workAuthReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
            resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/auth/work:', resInfo.data);
        console.timeEnd('handleWorkAuth');
        console.log('--------------------');
        return resInfo;
    }

    // 解析报文
    console.log('body:', body);
    let workId = body.workId;
    let address = body.address;


    let batchName = sha256(workId + address).toString();

    // step1

    let package1 = await genPackage1(workId, address, batchName, arg1);
    let package1Path = basePath + "/authFiles/package/" + package1.params.package_token + ".json";
    let package1Hash = await localUtils.saveJson(package1, package1Path);

    let express1 = genExpress1(package1, package1Hash, batchName);
    let express1Path = basePath + "/authFiles/express/" + package1.params.package_token + ".json";
    let express1Hash = await localUtils.saveJson(express1, express1Path);

    let package1Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express1Path, package1Path]});

    // let package1Res = await httpUtils.postFiles("http://39.102.93.47:9003/test", {files: [package1Path, express1Path]});

    console.log(package1Res);

    let detSn1 = package1Res.data;

    await localUtils.sleep(5000);

    let check1Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn1});

    console.log(check1Res);

    await uploadFiles(check1Res, detSn1, package1Hash);

    // let doubleCheck = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn1});
    // let workPath = doubleCheck.data.package_list[0].file_list[0].works_path;

    // get batchNo

    await localUtils.sleep(5000);

    let batchRes = await httpUtils.get("http://117.107.213.242:8124/cr/reg/query/batch_no", {packageToken: package1.params.package_token});
-
    console.log(batchRes);

    let batchNo = batchRes.data.batchNo;

    // step2

    let package2 = await genPackage2(workId, address, batchNo);
    let package2Path = basePath + "/authFiles/package/" + package2.params.package_token + ".json";
    let package2Hash = await localUtils.saveJson(package2, package2Path);

    let express2 = genExpress2(package2, package2Hash, batchName);
    let express2Path = basePath + "/authFiles/express/" + package2.params.package_token + ".json";
    let express2Hash = await localUtils.saveJson(express2, express2Path);

    let package2Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express2Path, package2Path]});

    console.log(package2Res);

    let detSn2 = package2Res.data;

    await localUtils.sleep(5000);

    let check2Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn2});

    console.log(check2Res);

    await uploadFiles(check2Res, detSn2, package2Hash);

    // step3

    let package3 = await genPackage3(package1, batchNo);
    let package3Path = basePath + "/authFiles/package/" + package3.params.package_token + ".json";
    let package3Hash = await localUtils.saveJson(package3, package3Path);

    let express3 = genExpress3(package3, package3Hash, batchName);
    let express3Path = basePath + "/authFiles/express/" + package3.params.package_token + ".json";
    let express3Hash = await localUtils.saveJson(express3, express3Path);

    let package3Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express3Path, package3Path]});

    console.log(package3Res);

    let detSn3 = package3Res.data;

    await localUtils.sleep(5000);

    let check3Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn3});

    console.log(check3Res);

    await uploadFiles(check3Res, detSn3, package3Hash);

    // submit

    let submitInfo = {
        batchNo: batchNo,
        usn: subjectInfo.usn,
    }
    let submitRes = await httpUtils.postFiles("http://117.107.213.242:8124/examine/result/submit", submitInfo);

    console.log(submitRes);

    // let batchNo = "1413441800852471808";
    handleAuthResult(tokenRemote, seqObj, workId, address, batchNo);

    console.timeEnd('handleWorkAuth');
    console.log('--------------------');

    return true;

}
/*
 * @param null:
 * @return: arg1
 * @author: Bernard
 * @date: 2021/7/27 15:36
 * @description: 返回包裹单1需要的参数
 * @example:.
 *
 */
async function genPackage1arg(workId, address, batchName){
    let arg1 = {
        work_id : workId,
        address : address,
    }


    let copyrightFilter = {
        work_id: workId,
        address: address,
    }
    let sql = sqlText.table('work_info').where(copyrightFilter).select();
    let workInfo = await mysqlUtils.sql(c, sql);
    workInfo = workInfo[0];
    arg1.workInfo = workInfo[0];

    let fileInfo = JSON.parse(workInfo.file_info_list)[0];
    arg1.fileInfo = fileInfo;


    let workType = workInfo.work_type.toString();
    arg1.workType = workType;


    let suffix = '.' + fileInfo.fileAddress.split('.').pop();

    // 测试
    // workType = "1";

    let workName;
    switch (workType) {
        case "1":
            workName = workInfo.work_name + '.mp3';
            break;
        case "2":
            workName = workInfo.work_name + '.jpg';
            break;
        case "3":
            workName = workInfo.work_name + '.mp4';
            break;
        default:
            workName = workInfo.work_name;
            break;
    }
    arg1.workName = workName;


    // 测试
    // fileInfo.fileHash = 'QmUaP774nVud8HWZnhm4XARJrnswY35bMaKwCzMZLVMWhh';
    // fileInfo.fileHash = 'QmW7AqqmFkzEmebuCe9MUvUpXMA4fYZgMvicvufi1NdBEF';

    let workPath;
    switch (workType) {
        case "1":
            workPath = fileInfo.fileHash + '.mp3';
            break;
        case "2":
            workPath = fileInfo.fileHash + '.jpg';
            break;
        case "3":
            workPath = fileInfo.fileHash + '.mp4';
            break;
        default:
            workPath = fileInfo.fileHash;
            break;
    }
    arg1.workPath = workPath;


    let localWorkPath = basePath + "/authFiles/work/" + workPath;
    await ipfsUtils.getFile(fileInfo.fileHash, localWorkPath);
    let workHash = localUtils.getFileHash(localWorkPath);
    let workSize = fs.statSync(localWorkPath).size.toString();
    arg1.workHash = workHash;
    arg1.workSize = workSize;


    let cover;
    let coverHash;
    if(workType == "2") {
        cover = localWorkPath;
        coverHash = workHash;
    }
    else {
        cover = "";
        coverHash = "";
    }
    arg1.cover = cover;
    arg1.coverHash = coverHash;

    workType = convertWorkType(workType);
    arg1.workType = workType;

    let packageToken = sha256(subjectInfo.usn + moment().unix() + localUtils.randomNumber(0,9999)).toString();
    arg.packageToken = packageToken;

    return arg;
}
/*
 * @param arg : 包裹单需要的参数
 * @return: package1任务名称、权利取得⽅式、著作权⼈、作品⽂件
 * @author: Qiumufei
 * @date: 2021/7/7
 */
async function genPackage1(workId, address, batchName, arg) {
    let copyrightFilter = {
        work_id: workId,
        address: address,
    }
    let sql = sqlText.table('work_info').where(copyrightFilter).select();
    let workInfo = await mysqlUtils.sql(c, sql);
    workInfo = workInfo[0];

    let fileInfo = JSON.parse(workInfo.file_info_list)[0];

    let workType = workInfo.work_type.toString();

    // 测试
    // workType = "1";

    let workName;
    switch (workType) {
        case "1":
            workName = workInfo.work_name + '.mp3';
            break;
        case "2":
            workName = workInfo.work_name + '.jpg';
            break;
        case "3":
            workName = workInfo.work_name + '.mp4';
            break;
        default:
            workName = workInfo.work_name;
            break;
    }


    // 测试
    // fileInfo.fileHash = 'QmUaP774nVud8HWZnhm4XARJrnswY35bMaKwCzMZLVMWhh';
    // fileInfo.fileHash = 'QmW7AqqmFkzEmebuCe9MUvUpXMA4fYZgMvicvufi1NdBEF';

    let workPath;
    switch (workType) {
        case "1":
            workPath = fileInfo.fileHash + '.mp3';
            break;
        case "2":
            workPath = fileInfo.fileHash + '.jpg';
            break;
        case "3":
            workPath = fileInfo.fileHash + '.mp4';
            break;
        default:
            workPath = fileInfo.fileHash;
            break;
    }


    let localWorkPath = basePath + "/authFiles/work/" + workPath;
    await ipfsUtils.getFile(fileInfo.fileHash, localWorkPath);
    let workHash = localUtils.getFileHash(localWorkPath);
    let workSize = fs.statSync(localWorkPath).size.toString();


    let cover;
    let coverHash;
    if(workType == "2") {
        cover = localWorkPath;
        coverHash = workHash;
    }
    else {
        cover = "";
        coverHash = "";
    }

    workType = convertWorkType(workType);

    let packageToken = sha256(subjectInfo.usn + moment().unix() + localUtils.randomNumber(0,9999)).toString();

    let package1 = {
        "name": batchName,
        "copyright_rights_get": "0",
        "cover": cover,
        "cover_hash": coverHash,
        "subject": [
            {
                "name": subjectInfo.name,
                "type": subjectInfo.type,
                "usn": subjectInfo.usn
            }
        ],
        "object": [
            {
                "works_hash": workHash,
                "works_name": workName,
                "works_path": localWorkPath,
                "works_size": workSize,
                "works_type": workType,
                "file_type": "",
                "is_split": "0",
                "isSelect": false,
                "longSelect": false
            }
        ],
        "params": {
            "batch_name": batchName,
            "det_business_code": "C001_01_01",
            "package_token": packageToken,
            "step": "1",
            "submit_usn": subjectInfo.usn,
            "works_count": "1"
        }
    }
    
    return package1;

}

/*
 * @param package1 : 包裹单
 * @param arg : 快递单需要的参数
 * @return: express1任务名称、权利取得⽅式、著作权⼈、作品⽂件
 * @author: Qiumufei
 * @date: 2021/7/7
 */
function genExpress1(package1, package1Hash, batchName) {

    let detTime = moment().format('YYYY-MM-DD');
    let fromSpaceUser = package1.params.submit_usn;

    let packageToken = package1.params.package_token;

    let fileList = [];

    for(let i in package1.object) {

        let fileHash = package1.object[i].works_hash;
        let fileName = package1.object[i].works_name;
        let filePath = package1.object[i].works_path;
        let fileSize = package1.object[i].works_size;

        let file = {
            "file_hash": fileHash,
            "file_name": fileName,
            "file_path": filePath,
            "file_size": fileSize,
            "is_split": "0",
        }

        fileList.push(file);

    } 

    let express1 = {
        "det_business_code": "C001_01_01",
        "det_package_name": batchName,
        "det_package_num": "1",
        "det_time": detTime,
        "from_space_address": "",
        "from_space_device": "",
        "from_space_ip": "",
        "from_space_user": fromSpaceUser,
        "to_space_address": "",
        "to_space_user": "",
        "package_list": [
            {
                "package_hash": package1Hash,
                "package_name": batchName,
                "package_token": packageToken,
                "file_list": fileList
            }
        ]
    }

    return express1;

}

/*
 * @param arg : 包裹单需要的参数
 * @return: package2选择著作权产⽣⽅式、著作权⼈对应权利种类
 * @author: Qiumufei
 * @date: 2021/7/7
 */
async function genPackage2(workId, address, batchNo) {

    let copyrightFilter = {
        work_id: workId,
        address: address,
    };
    let sql = sqlText.table('right_token_info').where(copyrightFilter).select();
    let copyrightInfoArr = await mysqlUtils.sql(c, sql);
    let copyrightTypes = copyrightInfoArr.map(copyrightInfo => copyrightInfo.copyright_type + 4);

    copyrightTypes = [0, 1, 2, 3].concat(copyrightTypes);

    copyrightTypes.sort((a, b) => a - b);

    let rights = [];
    for(let i in copyrightTypes) {
        rights.push({
            rights_category: copyrightTypes[i].toString(),
            rights_explain: "",
        });
    }
    
    let packageToken = sha256(subjectInfo.usn + moment().unix() + localUtils.randomNumber(0,9999)).toString();

    let package2 = {
        "copyright_produce_mode": "0",
        "batch_no": batchNo,
        "rights_category": [
            {
                "rights_owner_name": subjectInfo.name,
                "rights_owner_type": subjectInfo.type,
                "rights_owner_usn": subjectInfo.usn,
                "rights": rights
            }
        ],
        "params": {
            "det_business_code": "C001_01_02",
            "submit_usn": subjectInfo.usn,
            "package_token": packageToken,
            "step": "2"
        }
    }

    return package2;

}

/*
 * @param package2 : 包裹单
 * @param arg : 快递单需要的参数
 * @return: express2选择著作权产⽣⽅式、著作权⼈对应权利种类
 * @author: Qiumufei
 * @date: 2021/7/7
 */
function genExpress2(package2, package2Hash, batchName) {

    let detTime = moment().format('YYYY-MM-DD');
    let fromSpaceUser = package2.params.submit_usn;

    let packageToken = package2.params.package_token;

    let express2 = {
        "det_business_code": "C001_01_02",
        // "det_package_name": batchName,
        "det_package_num": "1",
        "det_time": detTime,
        "from_space_address": "",
        "from_space_device": "",
        "from_space_ip": "",
        "from_space_user": fromSpaceUser,
        "to_space_address": "",
        "to_space_user": "",
        "package_list": [
            {
                "package_hash": package2Hash,
                "package_name": batchName,
                "package_token": packageToken,
                "file_list": []
            }
        ]
    };
      
    return express2;

}

/*
 * @param arg : 包裹单需要的参数
 * @return: package3著作权主体身份信息、著作权客体信息、权利证明⽂件
 * @author: Qiumufei
 * @date: 2021/7/7
 */
function genPackage3(package1, batchNo) {

    let A2Path1 = basePath + "/resource/A21.jpg";
    let A2Name1 = "A21.jpg";
    let A2Hash1 = localUtils.getFileHash(A2Path1);

    let A2Path2 = basePath + "/resource/A22.jpg";
    let A2Name2 = "A22.jpg";
    let A2Hash2 = localUtils.getFileHash(A2Path2);

    let worksCreationCity = "北京";
    let worksCreationDate = "2021-07-07";
    let worksCreationDesc = "原创";
    let worksCreationCountry = "中国";

    let C1Path = basePath + "/resource/C1.jpg";
    let C1Name = "C1.jpg"
    let C1Hash = localUtils.getFileHash(C1Path);

    let C3Path = basePath + "/resource/C3.jpg";
    let C3Name = "C3.jpg"
    let C3Hash = localUtils.getFileHash(C3Path);

    let C16Path = basePath + "/resource/C16.jpg";
    let C16Name = "C16.jpg"
    let C16Hash = localUtils.getFileHash(C16Path);

    let packageToken = sha256(subjectInfo.usn + moment().unix() + localUtils.randomNumber(0,9999)).toString();
    let package3 = {
        "is_complete": "1",
        "batch_no": batchNo,
        "subject": [
            {
                "A1": {
                    "id_type": "A2",
                    "type": subjectInfo.type,
                    "address": subjectInfo.address,
                    "name": subjectInfo.name,
                    "usn": subjectInfo.usn,
                    "id_number": subjectInfo.idNum
                },
                "A2": {
                    "files": [
                        {
                            "card_type": "1",
                            "file_path": A2Path1,
                            "file_type": "1",
                            "file_hash": A2Hash1,
                            "file_name": A2Name1,
                            "id_card_no": subjectInfo.idNum,
                            "credentials_id": subjectInfo.credentialsId
                        },
                        {
                            "card_type": "1",
                            "file_path": A2Path2,
                            "file_type": "2",
                            "file_hash": A2Hash2,
                            "file_name": A2Name2,
                            "id_card_no": subjectInfo.idNum,
                            "credentials_id": subjectInfo.credentialsId
                        }
                    ],
                    "id": subjectInfo.credentialsId,
                    "sex": subjectInfo.sex,
                    "date_end": subjectInfo.dateEnd,
                    "address": subjectInfo.address,
                    "name": subjectInfo.name,
                    "usn": subjectInfo.usn,
                    "birthday": subjectInfo.birthday,
                    "id_number": subjectInfo.idNum,
                    "nation": subjectInfo.nation,
                    "date_start": subjectInfo.dateStart
                },
                "A3": {
                    "id": "",
                    "sex": "",
                    "date_end": "",
                    "address": "",
                    "name": "",
                    "usn": "",
                    "birthday": "",
                    "id_number": "",
                    "nation": "",
                    "date_start": ""
                },
                "A4": {
                    "id": "",
                    "sex": "",
                    "date_end": "",
                    "address": "",
                    "name": "",
                    "usn": "",
                    "birthday": "",
                    "id_number": "",
                    "nation": "",
                    "date_start": ""
                },
                "A5": {
                    "id": "",
                    "sex": "",
                    "date_end": "",
                    "address": "",
                    "name": "",
                    "usn": "",
                    "birthday": "",
                    "id_number": "",
                    "nation": "",
                    "date_start": ""
                }
            }
        ],
        "object": [
            {
                "works_type": package1.object[0].works_type,
                "works_path": package1.object[0].works_path,
                "works_creation_city": worksCreationCity,
                "works_publish_status": "0",
                "works_creation_date": worksCreationDate,
                "works_creation_desc": worksCreationDesc,
                "works_creation_country": worksCreationCountry,
                "works_creation": "0",
                "works_name": package1.object[0].works_name,
                "works_hash": package1.object[0].works_hash,
                "authors": [
                    {
                        "sign_name": subjectInfo.name,
                        "sign_status": "1",
                        "name": subjectInfo.name,
                        "usn": subjectInfo.usn
                    }
                ]
            }
        ],
        "material": [
            {
                "material_type_name": "作品创作说明",
                "material_type": "C1",
                "material_list": [
                    {
                        "material_file_list": [
                            {
                                "file_name": C1Name,
                                "file_path": C1Path,
                                "file_type": "1",
                                "file_hash": C1Hash
                            }
                        ],
                        "material_name": "作品创作说明"
                    }
                ],
                "material_num": "1"
            },
            {
                "material_type_name": "作品权利保证书",
                "material_type": "C3",
                "material_list": [
                    {
                        "material_file_list": [
                            {
                                "file_name": C3Name,
                                "file_path": C3Path,
                                "file_type": "1",
                                "file_hash": C3Hash
                            }
                        ],
                        "material_name": "作品权利保证书"
                    }
                ],
                "material_num": "1"
            },
            {
                "material_type_name": "唯⼀著作权注册平台承诺书",
                "material_type": "C16",
                "material_list": [
                    {
                        "material_file_list": [
                            {
                                "file_name": C16Name,
                                "file_path": C16Path,
                                "file_type": "1",
                                "file_hash": C16Hash
                            }
                        ],
                        "material_name": "唯⼀著作权注册平台承诺书"
                    }
                ],
                "material_num": "1"
            }
        ],
        "params": {
            "works_count": "1",
            "det_business_code": "C001_01_03",
            "step": "3",
            "package_token": packageToken,
            "submit_usn": subjectInfo.usn
        }
    }
    
    return package3;

}

/*
 * @param package3 : 包裹单
 * @param arg : 快递单需要的参数
 * @return: express3著作权主体身份信息、著作权客体信息、权利证明⽂件
 * @author: Qiumufei
 * @date: 2021/7/7
 */
function genExpress3(package3, package3Hash, batchName) {

    let detTime = moment().format('YYYY-MM-DD');
    let fromSpaceUser = package3.params.submit_usn;
    let packageToken = package3.params.package_token;

    let fileList = [];

    for(let i in package3.material) {

        for(let j in package3.material[i].material_list) {

            for(let k in package3.material[i].material_list[j].material_file_list) {

                let fileHash = package3.material[i].material_list[j].material_file_list[k].file_hash;
                let fileName = package3.material[i].material_list[j].material_file_list[k].file_name;
                let filePath = package3.material[i].material_list[j].material_file_list[k].file_path;
                let fileSize = fs.statSync(filePath).size.toString();

                let file = {
                    "is_split": "0",
                    "file_hash": fileHash,
                    "file_name": fileName,
                    "file_path": filePath,
                    "file_size": fileSize
                }

                fileList.push(file);

            }
        }
    }

    let express3 = {
        "det_business_code": "C001_01_03",
        "det_package_name": batchName,
        "det_package_num": "1",
        "det_time": detTime,
        "from_space_address": "",
        "from_space_device": "",
        "from_space_ip": "",
        "from_space_user": fromSpaceUser,
        "to_space_address": "",
        "to_space_user": "",
        "package_list": [
            {
                "package_hash": package3Hash,
                "package_name": batchName,
                "package_token": packageToken,
                "file_list": fileList
            }
        ]
    }

    return express3;

}

/*
 * @param checkRes:
 * @param detSn:
 * @param packageHash: 包裹单哈希
 * @return: true 意味着正常
 * @author: Qiumufei
 * @date: 2021/7/7
 */
async function uploadFiles(checkRes, detSn, packageHash) {

    if(checkRes.data == null) {
        return true;
    }

    let filePathArr = checkRes.data.package_list[0].file_list.filter(fileInfo => {
        let isNeed = fileInfo.file_status == '0';
        return isNeed;
    }).map(fileInfo => {
        return fileInfo.file_path;
    });

    for(let i in filePathArr) {
        let uploadFileInfo = {
            files: [filePathArr[i]],
            det_sn: detSn,
            packageHash: packageHash,
            is_split: 0
        }
        let uploadRes = await httpUtils.postFiles("http://117.107.213.242:8888/spaceUpload/uploadDETFile", uploadFileInfo);
        console.log(uploadRes);
    }

    return true;

}

function convertWorkType(workType) {

    switch (workType) {
        case "1":
            return "3";
        case "2":
            return "10";
        case "3":
            return "12";
    }

}

let IntervalId_AuthResult = {};// 审核的定时器
/**
 * @description 查审核情况。
 */
export async function handleAuthResult(tokenRemote, seqObj, workId, address, batchNo) {
    // 启动定时器
    let randomNum = localUtils.randomNumber(1,999999);
    let Interval_ID = setInterval(queryAuthResult, 20000, tokenRemote, seqObj, workId, address, batchNo,randomNum);
    IntervalId_AuthResult[randomNum] = Interval_ID;
}

/**
 * @description 查询审核的轮询函数。
 */
async function queryAuthResult(tokenRemote, seqObj, workId, address, batchNo,randomNum) {
    console.log('workId:', workId);
    console.log('batchNo:', batchNo);
    // 请求接口
    let certificateRes = await httpUtils.postFiles('http://117.107.213.242:8124/examine/result/details', {"batchNo": batchNo});
    if (debugMode) {
        console.log('requestInfo:', certificateRes);
    }
    // TODO verify
    if (certificateRes.code === 200) {
        let body = certificateRes;// 确权请求

        /****获取证书后****/
        // 证书存入IPFS
        // const cerPath = "E:\\InputFile\\GitBase\\Mid\\main\\mid\\processFunction\\express_file.json";
        const cerPath = body.data.objectJson[0].cerPath;
        if(cerPath == "http://document.wespace.cnnull"){
            console.log('证书为空：',cerPath);
            return false;
        }
        console.log('证书地址：',cerPath);
        let ipfsHash;
        try{
            ipfsHash = await downloadToIPFS(cerPath);//
        }
        catch (e) {
            console.log('IPFS错误:', e);
            console.log('body.data:', body.data);
            return false;
        }
        let ipfsUrl = "http://118.190.39.87:5001/api/v0/cat?arg=" + ipfsHash;
        // 通证信息上链
        let copyrightFilter = {
            work_id: workId,
            address: address,
        }
        let sql = sqlText.table('right_token_info').field('copyright_id').where(copyrightFilter).select();
        let copyrightInfoArr = await mysqlUtils.sql(c, sql);
        if(copyrightInfoArr.length == 0) {
            console.log('no data.');
            return false;
        }
        let copyrightIds = copyrightInfoArr.map(copyrightInfo => copyrightInfo.copyright_id);
        let authenticationId = 'DCI' + sha256(copyrightIds).toString().substring(0, 8);
        let authenticationInfo = {
            authenticationId: authenticationId,
            licenseUrl: ipfsUrl,
        };

        let authenticatePromises = copyrightIds.map(copyrightId => {
            return (erc721.buildTokenInfoChangeTx(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authenticationInfo, false));
        });
        let authenticateResArr = await Promise.all(authenticatePromises);

        let txHash = authenticateResArr[0].tx_json.hash;
        let txInfo = await requestInfo.requestTx(tokenRemote, txHash, false);
        let timestamp = txInfo.Timestamp + 946684800;



        // 异步返回京东
        let workFileHash;
        let auditResult;
        let examineMessage;
        try{
            workFileHash = body.data.objectIdentityJson[0].works_hash;
            auditResult = body.data.objectIdentityJson[0].examine_status==1?true:false;
            examineMessage = body.data.objectIdentityJson[0].examine_message;
        }
        catch (e) {
            console.log('证书下载错误（已存IPFS、上链）:', e);
            console.log('body.data:', body.data);
            return false;
        }

        let authResult = {
            workId : workId,
            address : address,
            authenticationInfo:{
                auditResult : auditResult,
                examineMessage : examineMessage,
                authenticationId : workFileHash,
                licenseUrl: ipfsUrl,
                timestamp : timestamp//确权信息填入通证链的链上时间戳,暂取首次
            }

        }
        console.log('authResult:', authResult);

        let body = authResult;
        try {
            await authValidate.workAuthResSchema.validateAsync(body);
        } catch(e) {
            e.details.map((detail, index) => {
                console.log('error message ' + index + ':', detail.message);
            });
            return false;
        }
        let Res = await httpUtils.post("http://116.196.114.120:8080/bupt/register/receiveWorkAuthenticationResult", body);
        if (debugMode) {
            console.log('京东Res:', Res);
        }
                
        // 清除定时器
        console.log('Interval Clear');
        clearInterval(IntervalId_AuthResult[randomNum]);

    }
}
