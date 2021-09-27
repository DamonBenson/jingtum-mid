import jlib from 'jingtum-lib';
import Joi from 'joi';
import sha256 from 'crypto-js/sha256.js';

const u = jlib.utils;
const Remote = jlib.Remote;
const remote = new Remote({server: 'ws://ip:port', local_sign: false});

const publisher = {
    address: 'xxx',
    secret: 'xxx',
};

function genCopyrightToken(copyrightInfo) {

    const copyrightSchema = Joi.object().keys({
        address:
            jingtumCustom.jingtum().address().required(),
        copyrightUnit:
            Joi.array().items(Joi.object().keys({
                address: 
                    jingtumCustom.jingtum().address().required(),
                proportion:
                    Joi.number().min(0).max(100).required(),
                copyrightExplain:
                    Joi.string().required(),
            })).required(),
        workId:
            Joi.string().hex().length(64).required(),
        copyrightType:
            Joi.number().integer().min(0).max(16).required(),
        copyrightGetType:
            Joi.number().integer().min(0).max(5).required(),
    });

    try {
        copyrightSchema.validate(copyrightInfo);
    } catch(err) {
        err.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
    }

    let address = copyrightInfo.address;
    delete copyrightInfo.address;

    let defaultInfo = {
        authenticationInfo: [],
        copyrightStatus: 0,
    };
    copyrightInfo = Object.assign(copyrightInfo, defaultInfo);

    let tokenId = sha256(copyrightInfo.workId + copyrightInfo.copyrightType).toString();

    remote.connect(function(err, res) {

        if (err) {
            return console.log('err:',err);
        }

        let seq = (await requestAccountInfo(publisher.address, remote)).account_data.Sequence;

        await buildPubTokenTx(remote, publisher.address, publisher.secret, seq, address, 'copyrightToken', tokenId, copyrightInfo, true);

        remote.disconnect();

    });

}

function genApproveToken(approveInfo) {

    const approveSchema = Joi.object().keys({
        address:
            jingtumCustom.jingtum().address().required(),
        copyrightId:
            Joi.string().hex().length(64).required(),
        approveType:
            Joi.number().integer().min(0).max(2).required(),
        constraint:
            Joi.object().keys({
                approveChannel:
                    Joi.number().integer().min(0).max(4).required(),
                approveArea:
                    Joi.number().integer().min(0).max(2).required(),
                approveTime:
                    Joi.number().integer().min(0).max(3).required(),
                approveStatus:
                    Joi.number().integer().min(0).max(1).required(),
            }),
        duty:
            Joi.array().items(Joi.object().keys({
                stockInfo:
                    Joi.array().items(Joi.object().keys({
                        address:
                            jingtumCustom.jingtum().address().required(),
                        proportion:
                            Joi.number().min(0).max(100).required(),
                    })).required(),
                incomeDistribution:
                    Joi.array().items(Joi.object().keys({
                        distributionMethod:
                            Joi.number().integer().min(0).max(3).required(),
                        distributionDesc:
                            Joi.string().required(),
                        receivablePayment:
                            Joi.number().required(),
                        receivedPayment:
                            Joi.number().required(),
                        toReceivePayment:
                            Joi.number().required(),
                        balanceDate:
                            Joi.date().format('yyyy-MM-dd').required(),
                    })).required(),
            })),
        refAddress:
            jingtumCustom.jingtum().address().required(),
        refSecret:
            jingtumCustom.jingtum().secret().required(),
    });

    try {
        approveSchema.validate(approveInfo);
    } catch(err) {
        err.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
    }

    let address = approveInfo.address;
    let copyrightId = approveInfo.copyrightId;
    let refAddress = approveInfo.refAddress;
    let refSecret = approveInfo.refSecret;
    delete approveInfo.address;
    delete approveInfo.copyrightId;
    delete approveInfo.refAddress;
    delete approveInfo.refSecret;

    let tokenId = sha256(approveInfo).toString();

    remote.connect(function(err, res) {

        if (err) {
            return console.log('err:',err);
        }

        let seq = (await requestAccountInfo(publisher.address, remote)).account_data.Sequence;

        await buildPubRefTokenTx(remote, publisher.address, publisher.secret, seq, address, 'approveToken', tokenId, approveInfo, copyrightId, refAddress, refSecret, true);

        remote.disconnect();

    });

}

function genlicenseToken(licenseInfo) {

    const licenseSchema = Joi.object().keys({
        address:
            jingtumCustom.jingtum().address().required(),
        refId:
            Joi.string().hex().required(),
        licenseUnit:
            Joi.array().items(Joi.object().keys({
                right:
                    Joi.array().items(Joi.number().integer().min(0).max(10)).unique().required(),
                constraint:
                    Joi.object().keys({
                        spatial:
                            Joi.string().required(),
                        bounds:
                            Joi.object().keys({
                                count:
                                    Joi.number().integer().positive(),
                                range:
                                    Joi.object().keys({
                                        min:
                                            Joi.number(),
                                        max:
                                            Joi.number(),
                                    }),
                            }).required(),
                        temporal:
                            Joi.object().keys({
                                dateTime:
                                    Joi.object().keys({
                                        start:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                        end:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                        fixed:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                    }),
                                accumulated:
                                    Joi.number().integer().positive(),
                                interval:
                                    Joi.number().integer().positive(),
                                period:
                                    Joi.object().keys({
                                        periodType:
                                            Joi.number().integer().min(0).max(2).required(),
                                        start:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                        end:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                        fixed:
                                            Joi.date().format('yyyy-MM-dd HH:mm:ss'),
                                    }),
                            }).required(),
                        system:
                            Joi.object().keys({
                                cpu:
                                    Joi.array().items(Joi.string()),
                                screen:
                                    Joi.array().items(Joi.string()),
                                storeDevice:
                                    Joi.array().items(Joi.string()),
                                memory:
                                    Joi.array().items(Joi.string()),
                                printer:
                                    Joi.array().items(Joi.string()),
                                drmVersion:
                                    Joi.array().items(Joi.string()),
                                decVersion:
                                    Joi.array().items(Joi.string()),
                            }).required(),
                    }),
                duty:
                    Joi.object().keys({
                        paymentMethod:
                            Joi.object().keys({
                                paymentMethodType:
                                    Joi.number().integer().min(0).max(2).required(),
                                fee:
                                    Joi.object().keys({
                                        amount:
                                            Joi.number().positive().required(),
                                        currency:
                                            Joi.number().integer().required(),
                                        taxPercent:
                                            Joi.number().min(0).max(100),
                                        currency:
                                            Joi.number().integer(),
                                    }).required(),
                            }),
                        accept:
                            Joi.string(),
                        register:
                            Joi.string(),
                        tracked:
                            Joi.string(),
                    }),
            })).required(),
        refAddress:
            jingtumCustom.jingtum().address().required(),
        refSecret:
            jingtumCustom.jingtum().secret().required(),
    });

    try {
        licenseSchema.validate(licenseInfo);
    } catch(err) {
        err.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
    }

    let address = licenseInfo.address;
    let refId = licenseInfo.refId;
    let refAddress = licenseInfo.refAddress;
    let refSecret = licenseInfo.refSecret;
    delete licenseInfo.address;
    delete licenseInfo.refId;
    delete licenseInfo.refAddress;
    delete licenseInfo.refSecret;

    let tokenId = sha256(licenseInfo).toString();

    remote.connect(function(err, res) {

        if (err) {
            return console.log('err:',err);
        }

        let seq = (await requestAccountInfo(publisher.address, remote)).account_data.Sequence;

        await buildPubRefTokenTx(remote, publisher.address, publisher.secret, seq, address, 'licenseToken', tokenId, licenseInfo, refId, refAddress, refSecret, true);

        remote.disconnect();

    });

}

export function requestAccountInfo(a, r, showRes) {

    let req = r.requestAccountInfo({
        account: a
    });

    return new Promise((resolve, reject) => {
        req.submit(function(err, result) {
            if(err) {
                console.log('err:', err);
                reject(err);
            }
            else if(result) {
                if(showRes) {
                    console.log('requestAccountInfo', result);
                }
                resolve(result);
            }
        });
    });

}

function buildPubTokenTx(remote, publisher, secret, seq, dest, name, id, tokenInfos, showRes) {

    let tx = remote.buildPubTokenTx({
        publisher: publisher,
        receiver: dest,
        token: name,
        tokenId: id,
        tokenInfos: obj2tokenInfos(tokenInfos),
    });

    tx.setSecret(secret);

    if(seq) {
        tx.setSequence(seq);
    }

    return new Promise((resolve, reject) => {
        tx.submit(function(err, result) {
            if(err) {
                console.log('err:',err);
                reject(err);
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

function buildPubRefTokenTx(remote, publisher, secret, seq, dest, name, id, tokenInfos, refId, refAddr, refSecr, showRes) {

    let tx = remote.buildPubTokenTx({
        publisher: publisher,
        receiver: dest,
        token: name,
        tokenId: id,
        tokenInfos: obj2tokenInfos(tokenInfos),
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
                reject(err);
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

function obj2tokenInfos(obj) {
    let tokenInfos = [];
    for(let k in obj) {
        let tokenInfosObj = {
            type: k,
            data: obj[k].toString()
        };
        tokenInfos.push(tokenInfosObj);
    }
    return tokenInfos;
}

const jingtumCustom = Joi.extend((joi) => {

    return {
        type: 'jingtum',
        base: joi.string(),
        messages: {
            'jingtum.hash': '{{#label}} is not a valid hash',
            'jingtum.address': '{{#label}} is not a valid address',
            'jingtum.secret': '{{#label}} is not a valid secret',
        },
        rules: {
            hash: {
                validate(value, helpers) {
                    if(!u.isValidHash(value)) {
                        return helpers.error('jingtum.hash');
                    }
                }
            },
            address: {
                validate(value, helpers) {
                    if(!u.isValidAddress(value)) {
                        return helpers.error('jingtum.address');
                    }
                }
            },
            secret: {
                validate(value, helpers) {
                    if(!u.isValidSecret(value)) {
                        return helpers.error('jingtum.secret');
                    }
                }
            },
        },
    };

});