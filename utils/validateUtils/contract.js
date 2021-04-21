import Joi from 'joi';

/*----------数据验证格式定义----------*/

// 合约部署
const deployContractReqSchema = Joi.any();

// 合约地址查询
const contractAddrReqSchema = Joi.any();

// 合约信息查询
const contractInfoReqSchema = Joi.any();

/*----------数据格式验证函数----------*/

// 作品确权
export async function validateDeployContractReq(body) {

    try {
        await deployContractReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 版权确权
export async function validateContractAddrReq(body) {

    try {
        await contractAddrReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 确权状态查询
export async function validateContractInfoReq(body) {

    try {
        await contractInfoReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}