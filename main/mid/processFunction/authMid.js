import fs from 'fs';
import crypto from 'crypto-js';
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

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
setInterval(() => c.ping(err => console.log('MySQL ping err:', err)), 60000);
const ipfs = ipfsAPI(ipfsConf); // ipfs连接

const authenticateAddr = userAccount.authenticateAccount[0].address;
const authenticateSecr = userAccount.authenticateAccount[0].secret;

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
 * @description 版权确权，平台签名。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}platformAddr 平台地址
 * @param {String}contractAddr 确权合约地址
 * @returns 无
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
 * @description 查询审核情况，中间层签名。
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
 * @description 不通过合约完成同步作品确权。
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
 * @description 不通过合约完成同步版权确权。
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
 * @description 不通过合约完成同步作品确权。
 * @param {int}workId 作品标识
 * @param {String}address 确权用户地址
 */
let IntervalId_1;// 第一步业务
let IntervalId_2;// 第二步业务
let IntervalId_3;// 第三步业务
export async function handleWorkAuth(tokenRemote, seqObj, req) {

    console.time('handleWorkAuth');

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
        console.log('/auth/work:', resInfo.data);
        console.timeEnd('handleWorkAuth');
        console.log('--------------------');
        return resInfo;
    }

    // 方法体
    let workId = body.workId;
    let address = body.address;

    let basePath = "";

    let package1 = await genPackage1(workId, address);
    let package1Path = basePath + "/authFiles/package/" + package1.params.package_token + ".json";
    let package1Hash = localUtils.saveJson(package1, package1Path);

    let express1 = genExpress1(package1, package1Hash);
    let express1Path = basePath + "/authFiles/express/" + package1.params.package_token + ".json";
    let express1Hash = localUtils.saveJson(express1, express1Path);

    let detSn = await httpUtils.postFiles("http://117.107.213.242:8888/spaceDET/uploadDET", {files: [package1Path, express1Path]});

    await localUtils.sleep(5000);

    let checkRes = await httpUtils.post("http://117.107.213.242:8888/check/checkKeyTostorage", {det_sn: detSn});

    let fileHashArr = getNeedUpload(checkRes);

    for(let i in fileHashArr) {
        let uploadFileInfo = {
            files: fileHashArr[i],
            det_sn: detSn,
            packageHash: package1Hash,
            is_split: 0
        }
        let uploadRes = await httpUtils.post("http://117.107.213.242:8888/spaceUpload/uploadDETFile", uploadFileInfo);
    }

    
    console.log('/auth/work:', resInfo);

    console.timeEnd('handleWorkAuth');
    console.log('--------------------');

    return resInfo;

}

async function genPackage1(workId, address) {

    let name = workId + address;

    let copyrightFilter = {
        work_id: body.workId,
        address: body.address,
    }

    let sql = sqlText.table('work_info').where(copyrightFilter).select();
    let workInfo = await mysqlUtils.sql(c, sql)[0];
    let fileInfo = workInfo.file_info_list[0];
    let workPath = fileInfo.fileHash;

    let localWorkPath = basePath + "/authFiles/work/" + workPath;
    await ipfsUtils.getFile(workPath, localWorkPath);

    let fd = fs.createReadStream(localWorkPath);
    let hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    fd.on('end', function() {
        
        hash.end();
        let workHash = hash.read();

        let package1 = {
            "cover": cover,
            "cover_hash": coverHash,
            "name": name,
            "subject": [
                {
                    "name": subjectName,
                    "type": subjectType,
                    "usn": subjectUsn
                }
            ],
            "object": [
                {
                    "is_split": 0,
                    "split_num": "",
                    "works_hash": workHash,
                    "works_name": workName,
                    "works_path": workPath,
                    "works_size": 0,
                    "works_type": workType
                }
            ],
            "copyright_rights_get": 0,
            "params": {
                "batch_name": name,
                "det_business_code": "C001_01_01",
                "package_token": packageToken,
                "step": 1,
                "submit_usn": subjectUsn,
                "works_count": 1
            }
        }
    
        return package1;

    });

    fd.pipe(hash);

    let workName = workInfo.work_name;
    let workType = fileInfo.work_type;

    let cover = base + "/resource/test.jpg";
    let coverHash = "017ec8060ae3cd8d7419b73f4f0bf77a7b963dd41a7af2deda1b4bf556835099";
    let subjectName = "";
    let subjectType = "";
    let subjectUsn = "";
    let packageToken = sha256(subjectUsn + moment().unix() + localUtils.randomNumber(0,9999)).toString();

}

function genExpress1(package1, package1Hash) {

    let detPackageName = package1.name;
    let detTime = moment().format('YYYY-MM-DD');
    let fromSpaceUser = package1.subject[0].usn;
    let fileHash1 = package1.object[0].workHash;
    let fileName1 = package1.object[0].workName;
    let filePath1 = package1.object[0].workPath;
    let fileSize1 = package1.object[0].workSize;
    let packageToken = package1.params.package_token;

    let express1 = {
        "det_business_code": "C001_01_01",
        "det_package_name": detPackageName,
        "det_package_num": 1,
        "det_time": detTime,
        "from_space_address": "",
        "from_space_device": "",
        "from_space_ip": "",
        "from_space_user": fromSpaceUser,
        "package_list": [
            {
                "file_list": [
                    {
                        "file_hash": fileHash1,
                        "file_name": fileName1,
                        "file_path": filePath1,
                        "file_size": fileSize1,
                        "is_split": 0,
                        "split_num": ""
                    }
                ],
                "package_hash": package1Hash,
                "package_name": detPackageName,
                "package_token": packageToken
            }
        ],
        "to_space_address": "",
        "to_space_user": ""
    }
      
    return express1;

}

function getNeedUpload(checkRes) {

    let fileHashArr = checkRes.data.package_list.file_list.map(fileInfo => {
        return {
            fileHash: fileInfo.file_hash,
            fileStatus: fileInfo.file_status,
        }
    }).filter(fileInfo => !fileInfo.fileStatus);

    return fileHashArr;
}

async function genPackage1(workId, address) {

    let name = workId + address;

    let copyrightFilter = {
        work_id: body.workId,
        address: body.address,
    }

    let sql = sqlText.table('work_info').where(copyrightFilter).select();
    let workInfo = await mysqlUtils.sql(c, sql)[0];
    let fileInfo = workInfo.file_info_list[0];
    let workPath = fileInfo.fileHash;

    let localWorkPath = basePath + "/authFiles/work/" + workPath;
    await ipfsUtils.getFile(workPath, localWorkPath);

    let fd = fs.createReadStream(localWorkPath);
    let hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    fd.on('end', function() {

        hash.end();
        let workHash = hash.read();

        let package1 = {
            "cover": cover,
            "cover_hash": coverHash,
            "name": name,
            "subject": [{
                "A1": {
                    "id_type": "A2",
                    "type": "1",
                    "address": "北京市海淀区京王坟2号楼1⻔1308",
                    "name": "裘牧非",
                    "usn": "48d8e39d453f9080ad1add77dd4de852b5e5ad0896606482af96e59f2b28ff33",
                    "id_number": "110108199808215411",
                },
                "A2": {
                    "files": [
                        {
                            "card_type": "1",
                            "file_path": "/mnt/savepath/userIdentity/1625639256802/1625639256804.png",
                            "file_type": "1",
                            "file_hash": "e0ee43735705f926041622740843aa11",
                            "file_name": "20210707142852.png",
                            "id_card_no": "110108199808215411",
                            "credentials_id": "8f81491f-0585-4453-9f3a-59fe7ccd6419"
                        },
                        {
                            "card_type": "1",
                            "file_path": "/mnt/savepath/userIdentity/1625639256802/1625639256932.png",
                            "file_type": "2",
                            "file_hash": "878ebe5347f44ab6629fb5fa73d95cb4",
                            "file_name": "20210707142856.png",
                            "id_card_no": "110108199808215411",
                            "credentials_id": "8f81491f-0585-4453-9f3a-59fe7ccd6419"
                        }
                    ],
                    "id": "8f81491f-0585-4453-9f3a-59fe7ccd6419",
                    "sex": "男",
                    "date_end": "2025-07-27",
                    "address": "北京市海淀区京王坟2号楼1⻔1308",
                    "name": "裘牧非",
                    "usn": "48d8e39d453f9080ad1add77dd4de852b5e5ad0896606482af96e59f2b28ff33",
                    "birthday": "1999-08-21",
                    "id_number": "110108199808215411",
                    "nation": "中国",
                    "date_start": "2015-07-27"
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
            }],
            "is_complete": "1",
            "material": [
                {
                    "material_type_name": "作品创作说明",
                    "material_type": "C1",
                    "material_list": [
                        {
                            "material_file_list": [
                                {
                                    "file_name": "202107071545280.png",
                                    "file_path": "tmp/202107071545280.png",
                                    "file_type": "1",
                                    "file_hash": "1825a1b7fa0478e27805e9f2d213ea6dca01175f9aeb46a71776602bbaf5aa29"
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
                                    "file_name": "202107071545350.png",
                                    "file_path": "tmp/202107071545350.png",
                                    "file_type": "1",
                                    "file_hash": "92357001589797414e67f6e4ab790f4437615f11f7d8d4a7e6fcd6609f9e14a8"
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
                                    "file_name": "202107071545410.png",
                                    "file_path": "tmp/202107071545410.png",
                                    "file_type": "1",
                                    "file_hash": "cfe7b0b9612176d699cc8731acc106d2e4f4c98c802914d871b7d2181c45c647"
                                }
                            ],
                            "material_name": "唯⼀著作权注册平台承诺书"
                        }
                    ],
                    "material_num": "1"
                }
            ],
            "params": {
                "works_count": "2",
                "det_business_code": "C001_01_03",
                "step": "3",
                "package_token": "d8dc75dcb3b979f3c9129e2e6157772d18903a37d80656c50cc015efdaff7d24",
                "submit_usn": "48d8e39d453f9080ad1add77dd4de852b5e5ad0896606482af96e59f2b28ff33"
            },
            "object": [
                {
                    "works_type": "10",
                    "works_path": "/mnt/savepath/trueFile/2021-07-07/330f09b16c8232f3fa304d49333db7809a98982e86694f29545826f302264622/d890ac9ca237977f77c148b02e56e0e96c763802ac5c2ff391825adc3f11c24f.png",
                    "works_creation_city": "北京",
                    "works_publish_status": "0",
                    "works_creation_date": "2021-07-07",
                    "works_creation_desc": "原创",
                    "works_creation_country": "中国",
                    "works_creation": "0",
                    "works_name": "fengjing2",
                    "works_hash": "d890ac9ca237977f77c148b02e56e0e96c763802ac5c2ff391825adc3f11c24f",
                    "authors": [
                        {
                            "sign_name": "裘牧非",
                            "sign_status": "1",
                            "name": "裘牧非",
                            "usn": "48d8e39d453f9080ad1add77dd4de852b5e5ad0896606482af96e59f2b28ff33"
                        }
                    ]
                },
                {
                    "works_type": "10",
                    "works_path": "/mnt/savepath/trueFile/2021-07-07/330f09b16c8232f3fa304d49333db7809a98982e86694f29545826f302264622/df44dad5df203abc3c564e3aa3db9a1b3a3309e843f41d6e67a59c425c47b986.png",
                    "works_creation_city": "北京",
                    "works_publish_status": "0",
                    "works_creation_date": "2021-07-07",
                    "works_creation_desc": "原创",
                    "works_creation_country": "中国",
                    "works_creation": "0",
                    "works_name": "fengjing1",
                    "works_hash": "df44dad5df203abc3c564e3aa3db9a1b3a3309e843f41d6e67a59c425c47b986",
                    "authors": [
                        {
                            "sign_name": "裘牧非",
                            "sign_status": "1",
                            "name": "裘牧非",
                            "usn": "48d8e39d453f9080ad1add77dd4de852b5e5ad0896606482af96e59f2b28ff33"
                        }
                    ]
                }
            ],
            "batch_no": "1412676675753213952"
        }
        return package1;

    });

    fd.pipe(hash);

    let workName = workInfo.work_name;
    let workType = fileInfo.work_type;

    let cover = base + "/resource/test.jpg";
    let coverHash = "017ec8060ae3cd8d7419b73f4f0bf77a7b963dd41a7af2deda1b4bf556835099";
    let subjectName = "";
    let subjectType = "";
    let subjectUsn = "";
    let packageToken = sha256(subjectUsn + moment().unix() + localUtils.randomNumber(0,9999)).toString();

}

function genExpress1(package1, package1Hash) {

    let detPackageName = package1.name;
    let detTime = moment().format('YYYY-MM-DD');
    let fromSpaceUser = package1.subject[0].usn;
    let fileHash1 = package1.object[0].workHash;
    let fileName1 = package1.object[0].workName;
    let filePath1 = package1.object[0].workPath;
    let fileSize1 = package1.object[0].workSize;
    let packageToken = package1.params.package_token;

    let express1 = {
        "det_business_code": "C001_01_01",
        "det_package_name": detPackageName,
        "det_package_num": 1,
        "det_time": detTime,
        "from_space_address": "",
        "from_space_device": "",
        "from_space_ip": "",
        "from_space_user": fromSpaceUser,
        "package_list": [
            {
                "file_list": [
                    {
                        "file_hash": fileHash1,
                        "file_name": fileName1,
                        "file_path": filePath1,
                        "file_size": fileSize1,
                        "is_split": 0,
                        "split_num": ""
                    }
                ],
                "package_hash": package1Hash,
                "package_name": detPackageName,
                "package_token": packageToken
            }
        ],
        "to_space_address": "",
        "to_space_user": ""
    }

    return express1;

}
let IntervalId_AuthResult;// 审核的定时器
export async function handleAuthResult(tokenRemote, seqObj, req) {
    /****           查审核情况           ****/
    // 启动定时器
    IntervalId_AuthResult = setInterval(queryAuthResult,3000,[]);
}
/**
 * @description 查询审核的轮询函数。
 */
async function queryAuthResult(tokenRemote, seqObj, req, workId, address) {
    // 请求接口
    let batchNo = 0;
    let certificateRes = await httpUtils.post('http://117.107.213.242:8124/examine/result/details', {"batchNo": batchNo});
    if (debugMode) {
        console.log('requestInfo:', certificateRes.body);
    }
    // TODO verify
    if (certificateRes.code === 200) {
        let body = req.body;// 确权请求
        // 清除定时器
        clearInterval(IntervalId_AuthResult);
        /****获取证书后****/
        // 证书存入IPFS
        const workFilePath = "E:\\InputFile\\GitBase\\Mid\\main\\mid\\processFunction\\express_file.json";
        let ipfsUrl = await ipfsUtils.addFile(workFilePath);

        // 通证信息上链
        let copyrightFilter = {
            work_id: body.workId,
            address: body.address,
        }
        let sql = sqlText.table('right_token_info').field('copyright_id').where(copyrightFilter).select();
        let copyrightInfoArr = await mysqlUtils.sql(c, sql);
        if(copyrightInfoArr.length == 0) {
            let resInfo = {};
            resInfo.msg = 'no data',
                resInfo.code = 6;
            console.log('/auth/innerWork:', resInfo);
            console.timeEnd('handleInnerWorkAuth');
            console.log('--------------------');
            return resInfo;
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
        let txInfo = await requestInfo.requestTx(tokenRemote, txHash, true);
        let timestamp = txInfo.Timestamp + 946684800;

        // 异步返回京东
        let authResult = {
            workId : workId,
            address : address,
            authenticateInfo:{
                auditResult : true,
                examineMessage : null,
                authenticationId : workFileHash,
                licenseUrl: ipfsUrl,
                timestamp:timestamp//确权信息填入通证链的链上时间戳,暂取首次
            }

        }
        // TODO 京东接口
        let Res = await httpUtils.post('', authResult);
        if (debugMode) {
            console.log('Res:', Res.data);
        }

    }
}