import fs from 'fs';
import crypto from 'crypto';
import sha256 from 'crypto-js/sha256.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import moment from 'moment';

import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as tokenLayer from '../../../utils/jingtum/tokenLayer.js';
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
import {downloadToIPFS} from "../../../utils/httpUtils.js";
import formData from "form-data";
import { materialType2materialName, workType2Suffix, idType2cardType } from '../../../utils/config/auth.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
setInterval(() => c.ping(), 600000);
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
export async function handleAuthState(contractRemote, seqObj, req) {

    console.time('handleAuthState');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    try {
        await authValidate.authStateReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.timeEnd('handleAuthState');
        console.log('--------------------');
        return resInfo;
    }

    // 方法体  
    let sql = sqlText.table('AuthenticationInfo').where({workId: body.workId}).select();
    let authInfo = await mysqlUtils.sql(c, sql);
    authInfo = authInfo[0];

    console.timeEnd('handleAuthState');
    console.log('--------------------');

    resInfo.data = authInfo;

    return resInfo;

}

/**
 * @description 不通过合约完成同步作品确权
 * @param {int}workId 作品标识
 * @param {String}address 确权用户地址
 * @returns {Object} 确权信息，包括：审核结果auditResult、确权标识authenticationId、登记确权证书索引licenseUrl、确权时间戳timestamp
 */
// export async function handleInnerWorkAuth(tokenRemote, seqObj, req) {

//     console.time('handleInnerWorkAuth');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = req.body;
//     console.log(body);
//     try {
//         await authValidate.innerWorkAuthReqSchema.validateAsync(body);
//     } catch(e) {
//         e.details.map((detail, index) => {
//             console.log('error message ' + index + ':', detail.message);
//         });
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = e;
//         console.log('/auth/innerWork:', resInfo.data);
//         console.timeEnd('handleInnerWorkAuth');
//         console.log('--------------------');
//         return resInfo;
//     }

//     // 方法体
//     let copyrightFilter = {
//         work_id: body.workId,
//         address: body.address,
//     }
//     let sql = sqlText.table('right_token_info').field('copyright_id').where(copyrightFilter).select();
//     let copyrightInfoArr = await mysqlUtils.sql(c, sql);
//     if(copyrightInfoArr.length == 0) {
//         resInfo.msg = 'no data',
//         resInfo.code = 6;
//         console.log('/auth/innerWork:', resInfo);
//         console.timeEnd('handleInnerWorkAuth');
//         console.log('--------------------');
//         return resInfo;
//     }
//     let copyrightIds = copyrightInfoArr.map(copyrightInfo => copyrightInfo.copyright_id);

//     // let auditResult = localUtils.randomSelect([true, false], [0.8, 0.2]);
//     let auditResult = true;
//     if(auditResult == false) {
//         resInfo.data.authenticationInfo = {
//             auditResult: false,
//         };
//         console.log('/auth/innerWork:', resInfo.data);
//         console.timeEnd('handleInnerWorkAuth');
//         console.log('--------------------');
//         return resInfo;
//     }

//     let authenticationId = 'DCI' + sha256(copyrightIds).toString().substring(0, 8);
//     let licenseUrl = 'http://118.190.39.87:5001/api/v0/cat?arg=QmW7AqqmFkzEmebuCe9MUvUpXMA4fYZgMvicvufi1NdBEF';
//     let authenticationInfo = {
//         authenticationId: authenticationId,
//         licenseUrl: licenseUrl,
//     };

//     let authenticatePromises = copyrightIds.map(copyrightId => {
//         return (erc721.buildTokenInfoChangeTx(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authenticationInfo, false));
//     });

//     let authenticateResArr = await Promise.all(authenticatePromises);

//     let txHash = authenticateResArr[0].tx_json.hash;
//     let txInfo = await requestInfo.requestTx(tokenRemote, txHash, true);
//     let timestamp = txInfo.Timestamp + 946684800;
//     authenticationInfo.auditResult = true;
//     authenticationInfo.timestamp = timestamp;

//     resInfo.data.authenticationInfo = authenticationInfo;
//     console.log('/auth/innerWork:', resInfo.data);

//     console.timeEnd('handleInnerWorkAuth');
//     console.log('--------------------');

//     return resInfo;

// }

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
 * @description 请求提交到版权局，完成异步确权
 * @param {Object}body 详见文档
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

    console.log('body:', body);

    // 身份注册
    let batchName = sha256(JSON.stringify(body)).toString();
    await userRegister(body, batchName);
    await setUsn(body);

    // step1

    let package1 = await genPackage1(body, batchName);
    let package1Path = basePath + "/authFiles/package/" + package1.params.package_token + ".json";
    let package1Hash = await localUtils.saveJson(package1, package1Path);

    let express1 = genExpress1(package1, package1Hash, batchName);
    let express1Path = basePath + "/authFiles/express/" + package1.params.package_token + ".json";
    let express1Hash = await localUtils.saveJson(express1, express1Path);

    let package1Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express1Path, package1Path]});

    // let package1Res = await httpUtils.postFiles("http://39.102.93.47:9003/test", {files: [package1Path, express1Path]});

    console.log("package1Res:", package1Res);

    let detSn1 = package1Res.data;

    await localUtils.sleep(5000);

    let check1Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn1});

    console.log("check1Res:", check1Res);

    await uploadFiles(check1Res, detSn1, package1Hash);

    // let doubleCheck = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn1});
    // let workPath = doubleCheck.data.package_list[0].file_list[0].works_path;

    // get batchNo

    await localUtils.sleep(5000);

    let batchRes = await httpUtils.get("http://117.107.213.242:8124/cr/reg/query/batch_no", {packageToken: package1.params.package_token});
-
    console.log("batchRes:", batchRes);

    let batchNo = batchRes.data.batchNo;

    // step2

    let package2 = await genPackage2(body, batchNo);
    let package2Path = basePath + "/authFiles/package/" + package2.params.package_token + ".json";
    let package2Hash = await localUtils.saveJson(package2, package2Path);

    let express2 = genExpress2(package2, package2Hash, batchName);
    let express2Path = basePath + "/authFiles/express/" + package2.params.package_token + ".json";
    let express2Hash = await localUtils.saveJson(express2, express2Path);

    let package2Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express2Path, package2Path]});

    console.log("package2Res:", package2Res);

    let detSn2 = package2Res.data;

    await localUtils.sleep(5000);

    let check2Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn2});

    console.log("check2Res:", check2Res);

    await uploadFiles(check2Res, detSn2, package2Hash);

    // step3

    let package3 = await genPackage3(body, package1, batchNo);
    let package3Path = basePath + "/authFiles/package/" + package3.params.package_token + ".json";
    let package3Hash = await localUtils.saveJson(package3, package3Path);

    let express3 = genExpress3(package3, package3Hash, batchName);
    let express3Path = basePath + "/authFiles/express/" + package3.params.package_token + ".json";
    let express3Hash = await localUtils.saveJson(express3, express3Path);

    let package3Res = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [express3Path, package3Path]});

    console.log("package3Res:", package3Res);

    let detSn3 = package3Res.data;

    await localUtils.sleep(5000);

    let check3Res = await httpUtils.postFiles("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn3});

    console.log("check3Res:", check3Res);

    await uploadFiles(check3Res, detSn3, package3Hash);

    // submit

    let submitInfo = {
        batchNo: batchNo,
        usn: body.submits,
    }
    console.log(submitInfo);
    let submitRes = await httpUtils.postFiles("http://117.107.213.242:8124/examine/result/submit", submitInfo);

    console.log("submitRes:", submitRes);

    let authInfo = {
        workId: body.object.workId,
        auditStatus: "",
        auditResult: false,
    }
    let sql = sqlText.table('AuthenticationInfo').data(authInfo).insert();
    await mysqlUtils.sql(c, sql);

    handleAuthResult(tokenRemote, seqObj, body.object.workId, batchNo);

    console.timeEnd('handleWorkAuth');
    console.log('--------------------');

    return true;

}

async function genPackage1(body, batchName) {

    let sql = sqlText.table('Token').where({baseInfo_workId: body.object.workId}).select();
    let workInfo = await mysqlUtils.sql(c, sql);
    workInfo = workInfo[0];

    // 作品类型相关信息
    let workType = workInfo.baseInfo_workType.toString(); //注意上链的对应关系是不是正确
    let suffix = workType2Suffix[workType];
    let workName = workInfo.baseInfo_workName + suffix;
    let workPath = workInfo.fileInfo_fileHash + suffix;
    
    // 文件相关信息
    let localWorkPath = basePath + "/authFiles/work/" + workPath;
    await ipfsUtils.getFile(workInfo.fileInfo_fileHash, localWorkPath);
    let workHash = localUtils.getFileHash(localWorkPath);
    let workSize = fs.statSync(localWorkPath).size.toString();
    let cover;
    let coverHash;
    if(workType == "10") {
        cover = localWorkPath;
        coverHash = workHash;
    }
    else {
        cover = "";
        coverHash = "";
    }

    // 主体信息
    let subjectInfo = body.subject.map((element) => {
        return {
            name: element.a1.name,
            type: element.a1.type,
            usn: element.a1.usn
        };
    });

    let packageToken = sha256(body.submits + moment().unix() + localUtils.randomNumber(0,9999)).toString();

    let package1 = {
        "name": batchName,
        "copyright_rights_get": "0",
        "cover": cover,
        "cover_hash": coverHash,
        "subject": subjectInfo,
        "object": [
            {
                "works_hash": workHash,
                "works_name": workName,
                "works_path": localWorkPath,
                "works_size": workSize,
                "works_type": workType,
                "file_type": workInfo.fileInfo_fileType.toString(),
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
            "submit_usn": body.submits,
            "works_count": "1"
        }
    }

    console.log(package1);
    // await localUtils.sleep(100000);
    
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

    // console.log(express1);
    // await localUtils.sleep(100000);

    return express1;

}

async function genPackage2(body, batchNo) {

    let addrRights = await getAddressRights(body.object.workId);
    body.subject.forEach((element) => {
        element.rights.forEach((rightUnit) => {
            localUtils.toMysqlObj(rightUnit);
        })
    })
    body.subject.filter((element) => {
        return element.hasOwnProperty("rights");
    }).forEach((element) => {
        if(addrRights.hasOwnProperty(element.a1.userAddress)) {
            addrRights[element.a1.userAddress] = addrRights[element.a1.userAddress].concat(element.rights);
        }
    });
    let rightsCategory = [];
    for(let addr in addrRights) {
        for(let i in body.subject) {
            if(body.subject[i].a1.userAddress == addr) {
                rightsCategory.push({
                    "rights_owner_name": body.subject[i].a1.name,
                    "rights_owner_type": body.subject[i].a1.type,
                    "rights_owner_usn": body.subject[i].a1.usn,
                    "rights": addrRights[addr],
                })
            }
        }
    }
    body.subject.filter((element) => {
        return element.hasOwnProperty("rights");
    }).forEach((element) => {
        if(!addrRights.hasOwnProperty(element.a1.userAddress)) {
            rightsCategory.push({
                "rights_owner_name": element.a1.name,
                "rights_owner_type": element.a1.type,
                "rights_owner_usn": element.a1.usn,
                "rights": element.rights,
            })
        }
    });
    
    
    
    let packageToken = sha256(body.submits + moment().unix() + localUtils.randomNumber(0,9999)).toString();

    let package2 = {
        "copyright_produce_mode": "0",
        "batch_no": batchNo,
        "rights_category": rightsCategory,
        "params": {
            "det_business_code": "C001_01_02",
            "submit_usn": body.submits,
            "package_token": packageToken,
            "step": "2"
        }
    }

    console.log(package2);
    // await localUtils.sleep(100000);

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

    // console.log(express2);
    // await localUtils.sleep(100000);

      
    return express2;

}

async function genPackage3(body, package1, batchNo) {

    let packageToken = sha256(body.submits + moment().unix() + localUtils.randomNumber(0,9999)).toString();
    
    let subject = body.subject.map(async(element) => {

        delete element.a1.userAddress;
        localUtils.toMysqlObj(element.a1);
        element.a1.address = element.a1.residence;
        delete element.a1.residence;
        delete element.a1.mobile;

        let idType = element.a1.id_type.toUpperCase();
        let nullSubjectInfo = {
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
        };
        let subjectCertificateType = ["A2", "A3", "A4", "A5", "A6"];
        for(let i in subjectCertificateType) {
            if(subjectCertificateType[i] != idType) {
                if(element.a1.type == '1' && subjectCertificateType[i] != 'A6') element[subjectCertificateType[i]] = nullSubjectInfo;
                if(element.a1.type == '100' && subjectCertificateType[i] == 'A6') element[subjectCertificateType[i]] = nullSubjectInfo;
            }
        }
        
        element[idType] = element[element.a1.id_type];
        delete element[element.a1.id_type];
        element[idType].address = element.a1.address;
        element[idType].idNumber = element.a1.id_number;
        element[idType].usn = element.a1.usn;
        element[idType].name = element.a1.name;
        element[idType].id = await getCredentialsId(element.a1.usn);
        localUtils.toMysqlObj(element[idType]);

        if(element.a1.type == '1') {
            delete element[idType].legal_representative;
            delete element[idType].ethnic;
        }

        let files = element[idType].files.map(async(fileInfo) => {
            let suffix = '.' + fileInfo.filePath.split('.').pop();
            let localFilePath = basePath + "/authFiles/subjectMaterials/" + packageToken + "-" + idType + fileInfo.fileType + suffix;
            await httpUtils.downloadFile(fileInfo.filePath, localFilePath);
            fileInfo.filePath = localFilePath;
            fileInfo.cardType = "1";
            fileInfo.fileHash = localUtils.getFileHash(localFilePath);
            fileInfo.fileName = idType + fileInfo.fileType + suffix;
            fileInfo.idCardNo = element.a1.id_number;
            fileInfo.credentialsId = await getCredentialsId(element.a1.usn);
            localUtils.toMysqlObj(fileInfo);
            return fileInfo;
        });

        files = await Promise.all(files);

        element[idType].files = files;
        element.A1 = element.a1;
        delete element.a1;
        delete element.rights;

        return element;

    });

    subject = await Promise.all(subject);

    let materialInfo = [];
    for(let type in body.material) {
        let num = body.material[type].length;
        let typeInfo = [];
        for(let i in body.material[type]) {
            let filePath = body.material[type][i];
            let suffix = '.' + filePath.split('.').pop();
            let localFilePath = basePath + "/authFiles/certificateMaterials/" + packageToken + "-" + type + suffix;
            await httpUtils.downloadFile(filePath, localFilePath);
            let materialName = materialType2materialName[type];
            let temp = {
                "material_type_name": materialName,
                "material_type": type.toUpperCase(),
                "material_list": [
                    {
                        "material_file_list": [
                            {
                                "file_name": type + suffix,
                                "file_path": localFilePath,
                                "file_type": "1",
                                "file_hash": localUtils.getFileHash(localFilePath),
                            }
                        ],
                        "material_name": materialName,
                    }
                ],
                "material_num": num,
            };
            typeInfo.push(temp);
        }
        materialInfo = materialInfo.concat(typeInfo);
    }

    let sql = sqlText.table('Token').where({baseInfo_workId: body.object.workId}).select();
    let workInfo = await mysqlUtils.sql(c, sql);
    workInfo = workInfo[0];

    body.object.authors.forEach((author) => {
        localUtils.toMysqlObj(author);
    });

    let package3 = {
        "is_complete": "1",
        "batch_no": batchNo,
        "subject": subject,
        "object": [
            {
                "works_type": package1.object[0].works_type,
                "works_path": package1.object[0].works_path,
                "works_creation_city": workInfo.extraInfo_createCity,
                "works_publish_status": "0",
                "works_creation_date": workInfo.extraInfo_createCity,
                "works_creation_desc": workInfo.extraInfo_createDate,
                "works_creation_country": workInfo.extraInfo_createCountry,
                "works_creation": "0",
                "works_name": package1.object[0].works_name,
                "works_hash": package1.object[0].works_hash,
                "authors": body.object.authors,
            }
        ],
        "material": materialInfo,
        "params": {
            "works_count": "1",
            "det_business_code": "C001_01_03",
            "step": "3",
            "package_token": packageToken,
            "submit_usn": body.submits
        }
    }

    console.log(package3);
    // await localUtils.sleep(100000);
    
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

    // console.log(express3);
    // await localUtils.sleep(100000);

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
async function queryAuthResult(tokenRemote, seqObj, workId, batchNo,randomNum) {
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
        let ipfsUrl = "http://182.92.178.101:5001/api/v0/cat?arg=" + ipfsHash;
        // 通证信息上链
        let sql = sqlText.table('CopyrightToken').field('TokenId').where({workId: workId}).select();
        let copyrightInfoArr = await mysqlUtils.sql(c, sql);
        if(copyrightInfoArr.length == 0) {
            console.log('no data.');
            return false;
        }
        let copyrightIds = copyrightInfoArr.map(copyrightInfo => copyrightInfo.copyright_id);
        let authenticationId = body.data.objectIdentityJson[0].works_hash;
        let authenticationInfo = {
            authenticationInstitudeName: "北京版权保护中心",
            authenticationId: authenticationId,
        };

        let authenticatePromises = copyrightIds.map(copyrightId => {
            return (tokenLayer.buildModifyAuthenticationInfoTxLayer(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authenticationInfo, false));
        });
        let authenticateResArr = await Promise.all(authenticatePromises);

        let txHash = authenticateResArr[0].tx_json.hash;
        let txInfo = await requestInfo.requestTx(tokenRemote, txHash, false);
        let timestamp = txInfo.Timestamp + 946684800;



        // 异步返回京东
        let auditResult;
        let examineMessage;
        try{
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
            authenticationInfo:{
                auditResult : auditResult,
                examineMessage : examineMessage,
                authenticationId : authenticationId,
                licenseUrl: ipfsUrl,
                timestamp: timestamp//确权信息填入通证链的链上时间戳,暂取首次
            }

        }
        console.log('authResult:', authResult);

        let authInfo = {
            auditStatus: true,
            auditResult: auditResult,
            examineMessage: examineMessage,
            authenticationId: authenticationId,
            licenseUrl: ipfsUrl,
            timestamp: timestamp,
        }
        sql = sqlText.table('AuthenticationInfo').data(authInfo).where({workId : workId}).update();
        await mysqlUtils.sql(c, sql);

        try {
            await authValidate.workAuthResSchema.validateAsync(authResult);
        } catch(e) {
            e.details.map((detail, index) => {
                console.log('error message ' + index + ':', detail.message);
            });
            return false;
        }
        // let Res = await httpUtils.post("http://116.196.114.120:8080/bupt/register/receiveWorkAuthenticationResult", authResult);
        // if (debugMode) {
        //     console.log('京东Res:', Res);
        // }
                
        // 清除定时器
        console.log('Interval Clear');
        clearInterval(IntervalId_AuthResult[randomNum]);

    }
}


async function userRegister(body, batchName) {

    let registParams = [];
    for(let i in body.subject) {
        let sql = sqlText.table('USN').where({Id: body.subject[i].a1.usn}).select();
        let res = await mysqlUtils.sql(c, sql);
        if(res.length == 0) registParams.push(body.subject[i])
    }
    
    registParams = registParams.map(async(e) => {
        let sql = sqlText.table('USN').data({Id: e.a1.usn}).insert();
        await mysqlUtils.sql(c, sql);
        if(e.a1.type == '1') {
            let idType = e.a1.idType;
            let files = e[idType].files.map(async(fileInfo) => {
                let suffix = '.' + fileInfo.filePath.split('.').pop();
                let localFilePath = basePath + "/authFiles/registerFile/" + e.a1.idNumber + "_" + idType + fileInfo.fileType + suffix;
                await httpUtils.downloadFile(fileInfo.filePath, localFilePath);
                let ret = {};
                ret.fileName = idType + fileInfo.fileType + suffix;
                ret.filePath = localFilePath;
                ret.fileHash = localUtils.getFileHash(localFilePath);
                ret.fileType = fileInfo.fileType;
                return ret;
            });
            files = await Promise.all(files);
            let registObj = {
                channel: '',
                mobile: e.a1.mobile,
                name: e.a1.name,
                idNumber: e.a1.idNumber,
                postcode: '1',
                cardType: idType2cardType[idType],
                sex: e[idType].sex,
                ethnic: e[idType].ethnic,
                birthDate: e[idType].birthday,
                nation: e[idType].nation,
                province: '',
                city: '',
                district: '',
                address: e.a1.residence,
                issueDate: e[idType].dateStart,
                expirationDate: e[idType].dateEnd,
                cardFileList: files,
                codeInfo: {
                    fromDevice: '',
                    fromOs: '',
                    fromTimestamp: new Date().getTime(),
                    fromMac: '',
                    fromIp: '',
                    hashSubject: '',
                    fromId: e.a1.idNumber,
                }
            };
            // let jsonPath = basePath + "/authFiles/registerJson/" + e.a1.idNumber + ".json";
            let filesPath = files.map(e => e.filePath);
            // await localUtils.saveJson(registObj, jsonPath);
            let sign = localUtils.getObjSign(registObj);
            return {
                userId: e.a1.usn,
                files: filesPath,
                userInfoString: registObj,
                sign: sign,
            };
        }
        else if(e.a1.type == '100') {
            let idType = e.a1.idType;
            let files = e[idType].files.map(async(fileInfo) => {
                let suffix = '.' + fileInfo.filePath.split('.').pop();
                let localFilePath = basePath + "/authFiles/registerFile/" + e.a1.idNumber + "/" + idType + fileInfo.fileType + suffix;
                await httpUtils.downloadFile(fileInfo.filePath, localFilePath);
                let ret = {};
                ret.fileName = idType + fileInfo.fileType + suffix;
                ret.filePath = localFilePath;
                ret.fileHash = localUtils.getFileHash(localFilePath);
                ret.fileType = fileInfo.fileType;
                return ret;
            });
            files = await Promise.all(files);
            let registObj = {
                channel: '',
                mobile: e.a1.mobile,
                name: e.a1.name,
                idNumber: e.a1.idNumber,
                postcode: '100',
                cardType: idType2cardType[idType],
                nation: e[idType].nation,
                province: '',
                city: '',
                district: '',
                address: e.a1.residence,
                legalRepresentative: '',
                enterpriseType: '',
                establishmentDate: '',
                registeredCapital: '',
                businessScope: '',
                issueDate: e[idType].dateStart,
                expirationDate: e[idType].dateEnd,
                cardFileList: files,
                codeInfo: {
                    fromDevice: '',
                    fromOs: '',
                    fromTimestamp: new Date().getTime(),
                    fromMac: '',
                    fromIp: '',
                    hashSubject: '',
                    fromId: e.a1.idNumber,
                }
            };
            // let jsonPath = basePath + "/authFiles/registerJson/" + e.a1.idNumber + ".json";
            let filesPath = files.map(e => e.filePath);
            // await localUtils.saveJson(registObj, jsonPath);
            let sign = localUtils.getObjSign(registObj);
            return {
                userId: e.a1.usn,
                files: filesPath,
                userInfoString: registObj,
                sign: sign,
            };
        }
    });
    registParams = await Promise.all(registParams);
    for(let i = 0; i < registParams.length; i++) {
        let uploadRes = await httpUtils.postFiles("http://117.107.213.242:8181/register/user/real/reg", {
            files: registParams[i].files,
            userInfoString: JSON.stringify(registParams[i].userInfoString),
            sign: registParams[i].sign
        });
        let usn = uploadRes.data.usn;
        let sql = sqlText.table('USN').data({usn: usn}).where({Id: registParams[i].userId}).update();
        await mysqlUtils.sql(c, sql);
        registParams[i].usn = usn;
    }
    while(registParams.length != 0) {
        for(let i = 0; i < registParams.length; i++) {
            let res = await httpUtils.postFiles("http://117.107.213.242:8181//userIdentity/queryPersonalIdentityInfo", {usn: registParams[i].usn});
            if(res.code == '200') {
                let sql = sqlText.table('USN').data({credentialsId: res.data.identityCard[0].credentialsId}).where({Id: registParams[i].userId}).update();
                await mysqlUtils.sql(c, sql);
                registParams.splice(i, i + 1);
                i--;
            }
        }
        localUtils.sleep(10000);
    }
    return;
}

async function setUsn(body) {
    body.submits = await getUsn(body.submits);
    for(let i in body.subject) {
        body.subject[i].a1.usn = await getUsn(body.subject[i].a1.usn);
    }
    for(let i in body.object.authors) {
        body.object.authors[i].usn = await getUsn(body.object.authors[i].usn);
    }
}

async function getUsn(userId) {
    let sql = sqlText.table('USN').field('usn').where({Id: userId}).select();
    let usnRes = await mysqlUtils.sql(c, sql);
    return usnRes[0].usn;
}

async function getCredentialsId(usn) {
    let sql = sqlText.table('USN').field('credentialsId').where({usn: usn}).select();
    let credentialsIdRes = await mysqlUtils.sql(c, sql);
    return credentialsIdRes[0].credentialsId;
}

async function getAddressRights(workId) {
    let sql = sqlText.table('CopyrightToken').where({workId: workId}).select();
    let copyrightInfoArr = await mysqlUtils.sql(c, sql);
    let addrRights = {};
    copyrightInfoArr.forEach((copyrightInfo) => {
        JSON.parse(copyrightInfo.copyrightUnit).forEach((unit) => {
            let right = {
                rights_category: copyrightInfo.copyrightType.toString(),
                rights_explain: unit.copyrightExplain,
            };
            if(!addrRights.hasOwnProperty(unit.address)) {
                addrRights[unit.address] = [right];
            } else {
                addrRights[unit.address].push(right);
            }
        })
    });
    return addrRights;
}