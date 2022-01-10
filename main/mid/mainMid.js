import jlib from 'jingtum-lib';
import express from 'express';
import bodyParser from 'body-parser';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as uploadMid from './processFunction/old/uploadMid.js';
import * as infoMid from './processFunction/infoMid.js';
import * as authMid from './processFunction/authMid.js';
import * as transactionMid from './processFunction/transactionMid.js';
import * as contractMid from './processFunction/contractMid.js';
import * as serviceMid from './processFunction/serviceMid.js';
import * as signedTxMid from './processFunction/signedTxMid.js';
import * as monitorMid from './processFunction/monitorMid.js';

import {userAccount, chains} from '../../utils/config/jingtum.js';

const uploadChain = chains[0]; // 存证链
const tokenChain = chains[1]; // 交易链
const contractChain = chains[2]; // 权益链

const authorizeAddr = userAccount.buptAuthorizeAccount.address; // 智能授权系统（中间层部分）
const matchSystemAddr = userAccount.matchSystemAccount.address; // 智能交易系统
const midAddr = userAccount.midAccount.address; // 中间层
const monitorAddr = userAccount.buptMonitorAccount.address; // 中间层-监测

const Remote = jlib.Remote;
const uploadRemote = new Remote({server: uploadChain.server[0], local_sign: false});
const tokenRemote = new Remote({server: tokenChain.server[0], local_sign: false});
const contractRemote = new Remote({server: contractChain.server[0], local_sign: false});

// 连接到存证链
uploadRemote.connect(async function(err, res) {

    if(err) {
        return console.log('connect err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }

    // 连接到交易链
    tokenRemote.connect(async function(err, res) {

        if(err) {
            return console.log('connect err: ', err);
        }
        else if(res) {
            console.log('connect: ', res);
        }

        // 连接到权益链
        contractRemote.connect(async function(err, res) {

            if(err) {
                return console.log('connect err: ', err);
            }
            else if(res) {
                console.log('connect: ', res);
            }

            const app = express();
            const port = 9001;

            app.use(bodyParser.urlencoded({
                extended:false,
                limit: '50mb',
            }));
            app.use(bodyParser.json({
                limit: '50mb',
            }));

            // 获取账号在每条链上的序列号
            let seqObj = {
                authorize: {},
                matchSystem: {},
                mid: {},
                monitor: {},
            };
            seqObj.authorize.upload = (await requestInfo.requestAccountInfo(authorizeAddr, uploadRemote, false)).account_data.Sequence;
            seqObj.authorize.token = (await requestInfo.requestAccountInfo(authorizeAddr, tokenRemote, false)).account_data.Sequence;
            seqObj.authorize.contract = (await requestInfo.requestAccountInfo(authorizeAddr, contractRemote, false)).account_data.Sequence;
            seqObj.matchSystem.upload = (await requestInfo.requestAccountInfo(matchSystemAddr, uploadRemote, false)).account_data.Sequence;
            seqObj.matchSystem.token = (await requestInfo.requestAccountInfo(matchSystemAddr, tokenRemote, false)).account_data.Sequence;
            seqObj.matchSystem.contract = (await requestInfo.requestAccountInfo(matchSystemAddr, contractRemote, false)).account_data.Sequence;
            seqObj.mid.upload = (await requestInfo.requestAccountInfo(midAddr, uploadRemote, false)).account_data.Sequence;
            seqObj.mid.token = (await requestInfo.requestAccountInfo(midAddr, tokenRemote, false)).account_data.Sequence;
            seqObj.mid.contract = (await requestInfo.requestAccountInfo(midAddr, contractRemote, false)).account_data.Sequence;
            seqObj.monitor.upload = (await requestInfo.requestAccountInfo(monitorAddr, uploadRemote, false)).account_data.Sequence;
            seqObj.monitor.token = (await requestInfo.requestAccountInfo(monitorAddr, tokenRemote, false)).account_data.Sequence;
            seqObj.monitor.contract = (await requestInfo.requestAccountInfo(monitorAddr, contractRemote, false)).account_data.Sequence;
            console.log('seq:', seqObj);

            let filter = (req, res, next) => {
                try {
                    next();
                } catch(e) {
                    resInfo = {
                        msg: 'inner error',
                        code: 3,
                        data: {},
                    };
                    res.send(resInfo);
                }
            }

            app.use(filter);

            /**
             * @description 信息查询相关请求路由。
             */
            const infoRouter = express.Router();

            // 激活账户
            infoRouter.post('/activateAccount', async function(req, res) {
                let resInfo = await infoMid.handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req);
                res.send(resInfo);
            });

            // 作品信息查询
            infoRouter.get('/work', async function(req, res) {
                let resInfo = await infoMid.handleWorkInfo(req);
                res.send(resInfo);
            });

            // 版权信息查询
            infoRouter.get('/copyright', async function(req, res) {
                let resInfo = await infoMid.handleCopyrightInfo(req);
                res.send(resInfo);
            });

            // 许可信息查询
            infoRouter.get('/approve', async function(req, res) {
                let resInfo = await infoMid.handleApproveInfo(req);
                res.send(resInfo);
            });

            // 用户的所有作品信息查询
            infoRouter.get('/user/work', async function(req, res) {
                let resInfo = await infoMid.handleWorkInfoOfUser(req);
                res.send(resInfo);
            });

            // 用户作品的许可发放信息查询
            infoRouter.get('/user/work/issueApprove', async function(req, res) {
                let resInfo = await infoMid.handleIssueApproveInfoOfWork(req);
                res.send(resInfo);
            });

            // 用户作品的许可获得信息查询
            infoRouter.get('/user/work/ownApprove', async function(req, res) {
                let resInfo = await infoMid.handleOwnApproveInfoOfWork(req);
                res.send(resInfo);
            });

            /**
             * @description 确权相关请求路由。
             */
            const authRouter = express.Router();

            // 作品确权请求
            authRouter.post('/work', async function(req, res) {
                let resInfo = {
                    msg: 'success',
                    code: 0,
                    data: {},
                };
                res.send(resInfo);
                authMid.handleWorkAuth(tokenRemote, seqObj, req, res);
            });

            // authRouter.post('/signedWork', async function(req, res) {
            //     let resInfo = await authMid.handleSignedWorkAuth(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 版权确权请求
            // authRouter.post('/copyright', async function(req, res) {
            //     let resInfo = await authMid.handleCopyrightAuth(contractRemote, seqObj, req);
            //     res.send(resInfo);
            // });

            // authRouter.post('/signedCopyright', async function(req, res) {
            //     let resInfo = await authMid.handleSignedCopyrightAuth(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 确权状态查询
            authRouter.get('/state', async function(req, res) {
                let resInfo = await authMid.handleAuthState(contractRemote, seqObj, req);
                res.send(resInfo);
            });

            // 内部版权确权请求
            // authRouter.post('/innerWork', async function(req, res) {
            //     let resInfo = await authMid.handleInnerWorkAuth(tokenRemote, seqObj, req);
            //     res.send(resInfo);
            // });

            // // 内部版权确权请求
            // authRouter.post('/innerCopyright', async function(req, res) {
            //     let resInfo = await authMid.handleInnerCopyrightAuth(tokenRemote, seqObj, req);
            //     res.send(resInfo);
            // });

            /**
             * @description 交易相关请求路由。
             */
            const transactionRouter = express.Router();

            // 提交买单
            transactionRouter.post('/buy', async function(req, res) {
                let unsignedTx = await transactionMid.handleBuyOrder(contractRemote, seqObj, req);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedBuy', async function(req, res) {
                let resInfo = await transactionMid.handleSignedBuyOrder(contractRemote, req);
                res.send(resInfo);
            });

            // 买单接受
            transactionRouter.post('/buyAccept', async function(req, res) { // 智能交易系统签名由中间层模拟
                let unsignedTx = await transactionMid.handleBuyOrderAccept(contractRemote, seqObj, req);
                res.send(unsignedTx);
            });

            // 提交卖单
            transactionRouter.post('/sell', async function(req, res) {
                let unsignedTx = await transactionMid.handleSellOrder(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedSell', async function(req, res) {
                let resInfo = await transactionMid.handleSignedSellOrder(contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            // 提交撮合结果
            transactionRouter.post('/match', async function(req, res) { // 智能交易系统签名由中间层模拟
                let unsignedTx = await transactionMid.handleMatch(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            // 获取匹配结果
            // transactionRouter.get('/matchInfo', async function(req, res) {
            //     let resInfo = await transactionMid.handleMatchInfo(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 提交买方确认
            // transactionRouter.post('/buyerConfirm', async function(req, res) {
            //     let unsignedTxs = await transactionMid.handleBuyerConfirm(contractRemote, seqObj, req, res); // 返回的是需要签名的交易数组，因为需要将买方的确认写入所有相关合约
            //     res.send(unsignedTxs);
            // });

            // transactionRouter.post('/signedBuyerConfirm/buyOrder', async function(req, res) {
            //     let resInfo = await transactionMid.handleSignedBuyerConfirmForBuyOrder(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // transactionRouter.post('/signedBuyerConfirm/sellOrder', async function(req, res) {
            //     let resInfo = await transactionMid.handleSignedBuyerConfirmForSellOrder(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 卖方转让确认
            // transactionRouter.post('/sellerTransferConfirm', async function(req, res) {
            //     let unsignedTxs = await transactionMid.handleSellerTransferConfirm(tokenRemote, contractRemote, seqObj, req, res);
            //     res.send(unsignedTxs);
            // });

            // transactionRouter.post('/signedSellerTransferConfirm/sellOrder', async function(req, res) {
            //     let resInfo = await transactionMid.handleSignedSellerTransferConfirmForSellOrder(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // transactionRouter.post('/signedSellerTransferConfirm/transfer', async function(req, res) {
            //     let resInfo = await transactionMid.handleSignedSellerTransferConfirmForToken(tokenRemote, contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 卖方许可确认
            // transactionRouter.post('/sellerApproveConfirm', async function(req, res) {
            //     let unsignedTx = await transactionMid.handleSellerApproveConfirm(tokenRemote, contractRemote, seqObj, req, res);
            //     res.send(unsignedTx);
            // });

            // transactionRouter.post('/signedSellerApproveConfirm', async function(req, res) {
            //     let resInfo = await transactionMid.handleSignedSellerApproveConfirm(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 许可通证生成（对于平台内部匹配的交易）
            transactionRouter.post('/approveConfirm', async function(req, res) {
                let resInfo = await transactionMid.handleApproveConfirm(tokenRemote, seqObj, req);
                res.send(resInfo);
            });

            /**
             * @description 服务合约相关请求路由。
             */
            const contractRouter = express.Router();

            // 部署服务合约
            // contractRouter.post('/deploy', async function(req, res) {
            //     let unsignedTx = await contractMid.handleDeployContract(contractRemote, seqObj, req, res);
            //     res.send(unsignedTx);
            // });

            // contractRouter.post('/signedDeploy', async function(req, res) {
            //     let resInfo = await contractMid.handleSignedDeployContract(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 查询服务合约地址
            // contractRouter.get('/addr', async function(req, res) {
            //     let resInfo = await contractMid.handleContractAddr(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // 查询服务合约信息
            // contractRouter.get('/info', async function(req, res) {
            //     let resInfo = await contractMid.handleContractInfo(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            /**
             * @description 跨平台服务请求路由。
             */
            const serviceRouter = express.Router();

            // // 服务调用
            // serviceRouter.post('/call', async function(req, res) {
            //     let resInfo = await serviceMid.handleServiceCall(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            // serviceRouter.post('/result', async function(req, res) {
            //     let resInfo = await serviceMid.handleServiceResult(contractRemote, seqObj, req, res);
            //     res.send(resInfo);
            // });

            /**
             * @description 音乐监测相关请求路由。
             */
            const monitorRouter = express.Router();

            // 证据上链
            monitorRouter.post('/evidence', async function(req, res) {
                let resInfo = await monitorMid.handleEvidence(uploadRemote, seqObj, req);
                res.send(resInfo);
            })



            // /*----------提交已签名交易----------*/

            // app.post('/signedTx', async function(req, res) {
            //     let resInfo = await signedTxMid.handleSignedTx(uploadRemote, tokenRemote, contractRemote, req, res);
            //     res.send(resInfo);
            // });

            /*----------http服务器配置----------*/

            app.use('/info', infoRouter);
            app.use('/auth', authRouter);
            app.use('/transaction', transactionRouter);
            app.use('/contract', contractRouter);
            app.use('/service', serviceRouter);
            app.use('/monitor', monitorRouter);

            /*----------启动http服务器----------*/

            app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

        });

    });

});