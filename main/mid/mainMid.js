import jlib from 'jingtum-lib';
import express from 'express';
import bodyParser from 'body-parser';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';

import {chains} from '../../utils/info.js';
import * as uploadMid from './processFunction/uploadMid.js';
import * as infoMid from './processFunction/infoMid.js';
import * as contractMid from './processFunction/contractMid.js';
import * as transactionMid from './processFunction/transactionMid.js';

const uploadChain = chains[0]; // 存证链
const tokenChain = chains[0]; // 交易链 复用
const contractChain = chains[1]; // 权益链

const upload_a0 = uploadChain.account.a[0].address;
const token_a0 = tokenChain.account.a[0].address;
const contract_a0 = contractChain.account.a[0].address;
const upload_a1 = uploadChain.account.a[1].address;
const token_a1 = tokenChain.account.a[1].address;
const contract_a1 = contractChain.account.a[1].address;

// 卖方平台账号（模拟京东平台层）
const upload_a4 = uploadChain.account.a[4].address;
const token_a4 = tokenChain.account.a[4].address;
const contract_a4 = contractChain.account.a[4].address;

// 智能交易系统
const upload_a5 = uploadChain.account.a[5].address;
const token_a5 = tokenChain.account.a[5].address;
const contract_a5 = contractChain.account.a[5].address;

// 中间层
const upload_a9 = uploadChain.account.a[9].address;
const token_a9 = tokenChain.account.a[9].address;
const contract_a9 = contractChain.account.a[9].address;

// 卖方平台2
const upload_a14 = uploadChain.account.a[14].address;
const token_a14 = tokenChain.account.a[14].address;
const contract_a14 = contractChain.account.a[14].address;

const Remote = jlib.Remote;
const uploadRemote = new Remote({server: uploadChain.server[0], local_sign: true});
const tokenRemote = new Remote({server: tokenChain.server[0], local_sign: true});
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

// 连接到存证链
uploadRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }

    // 连接到交易链
    tokenRemote.connect(async function(err, res) {

        if(err) {
            return console.log('err: ', err);
        }
        else if(res) {
            console.log('connect: ', res);
        }

        // 连接到权益链
        contractRemote.connect(async function(err, res) {

            if(err) {
                return console.log('err: ', err);
            }
            else if(res) {
                console.log('connect: ', res);
            }

            // 获取中间层账号在每条链上的序列号
            let seqObj = {
                a0: {},
                a1: {},
                a4: {},
                a5: {},
                a9: {},
                a14: {},
            };
            // 目前upload同token，不能分开计数
            // seqObj.a0.upload = (await requestInfo.requestAccountInfo(upload_a0, uploadRemote, false)).account_data.Sequence;
            seqObj.a0.token = (await requestInfo.requestAccountInfo(token_a0, tokenRemote, false)).account_data.Sequence;
            seqObj.a0.contract = (await requestInfo.requestAccountInfo(contract_a0, contractRemote, false)).account_data.Sequence;
            // seqObj.a1.upload = (await requestInfo.requestAccountInfo(upload_a1, uploadRemote, false)).account_data.Sequence;
            seqObj.a1.token = (await requestInfo.requestAccountInfo(token_a1, tokenRemote, false)).account_data.Sequence;
            seqObj.a1.contract = (await requestInfo.requestAccountInfo(contract_a1, contractRemote, false)).account_data.Sequence;
            // seqObj.a4.upload = (await requestInfo.requestAccountInfo(upload_a4, uploadRemote, false)).account_data.Sequence;
            seqObj.a4.token = (await requestInfo.requestAccountInfo(token_a4, tokenRemote, false)).account_data.Sequence;
            seqObj.a4.contract = (await requestInfo.requestAccountInfo(contract_a4, contractRemote, false)).account_data.Sequence;
            // seqObj.a5.upload = (await requestInfo.requestAccountInfo(upload_a5, uploadRemote, false)).account_data.Sequence;
            seqObj.a5.token = (await requestInfo.requestAccountInfo(token_a5, tokenRemote, false)).account_data.Sequence;
            seqObj.a5.contract = (await requestInfo.requestAccountInfo(contract_a5, contractRemote, false)).account_data.Sequence;
            // seqObj.a9.upload = (await requestInfo.requestAccountInfo(upload_a9, uploadRemote, false)).account_data.Sequence;
            seqObj.a9.token = (await requestInfo.requestAccountInfo(token_a9, tokenRemote, false)).account_data.Sequence;
            seqObj.a9.contract = (await requestInfo.requestAccountInfo(contract_a9, contractRemote, false)).account_data.Sequence;
            // seqObj.a14.upload = (await requestInfo.requestAccountInfo(upload_a14, uploadRemote, false)).account_data.Sequence;
            seqObj.a14.token = (await requestInfo.requestAccountInfo(token_a14, tokenRemote, false)).account_data.Sequence;
            seqObj.a14.contract = (await requestInfo.requestAccountInfo(contract_a14, contractRemote, false)).account_data.Sequence;

            /*----------存证请求路由配置----------*/

            const uploadRouter = express.Router();

            uploadRouter.post('/init', async function(req, res) {
                let [addr, workId] = await uploadMid.handleUpload(uploadRemote, seqObj, req, res);
                uploadMid.handleRightTokenIssue(tokenRemote, seqObj, addr, workId, req, res);
                res.send(workId);
            });

            /*----------信息查询请求路由配置----------*/

            const infoRouter = express.Router();

            infoRouter.post('/activateAccount', async function(req, res) {
                let resInfo = await infoMid.handleActivateAccount(uploadRemote, tokenRemote, contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            infoRouter.post('/work', async function(req, res) {
                let resInfo = await infoMid.handleWorkInfo(req, res);
                res.send(resInfo);
            });

            infoRouter.post('/copyright', async function(req, res) {
                let resInfo = await infoMid.handleCopyrightInfo(req, res);
                res.send(resInfo);
            });

            infoRouter.post('/approve', async function(req, res) {
                let resInfo = await infoMid.handleApproveInfo(req, res);
                res.send(resInfo);
            });

            /*----------服务合约请求路由配置----------*/

            const contractRouter = express.Router();

            // 部署服务合约
            contractRouter.post('/deploy', async function(req, res) {
                let unsignedTx = await contractMid.handleInitContract(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            contractRouter.post('/signedDeploy', async function(req, res) {
                let contractAddr = await contractMid.handleSignedInitContract(contractRemote, seqObj, req, res);
                res.send(contractAddr);
            });

            // 查询服务合约
            contractRouter.get('/info', async function(req, res) {
                let contractAddr = await contractMid.handleContractQuery(contractRemote, seqObj, req, res);
                let contractInfo = await contractMid.handleContractInfo(contractRemote, seqObj, contractAddr, req, res);
                res.send(contractInfo);
            });

            /*----------交易请求路由配置----------*/

            const transactionRouter = express.Router();

            // 提交买单
            transactionRouter.post('/buy', async function(req, res) {
                let resInfo = await transactionMid.handleBuyOrder(contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            transactionRouter.post('/signedBuy', async function(req, res) {
                let resInfo = await transactionMid.handleSignedBuyOrder(contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            transactionRouter.post('/buyOrderConfirm', async function(req, res) { // 智能交易系统签名由中间层模拟，暂时不需要
                let unsignedTx = await transactionMid.handleBuyOrderConfirm(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedBuyOrderConfirm', async function(req, res) { 
                await transactionMid.handleSignedBuyOrderComfirm(contractRemote, seqObj, req, res);
                res.send('success');
            });

            // 提交卖单
            transactionRouter.post('/sell', async function(req, res) {
                let unsignedTx = await transactionMid.handleSellOrder(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedSell', async function(req, res) { // 京东平台签名由中间层模拟，暂时不需要
                let resInfo = await transactionMid.handleSignedSellOrder(contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            // 提交交易服务结果
            transactionRouter.post('/match', async function(req, res) {
                let unsignedTx = await transactionMid.handleMatch(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedMatch', async function(req, res) { // 智能交易系统签名由中间层模拟，暂时不需要
                let resInfo = await transactionMid.handleSignedMatch(contractRemote, seqObj, req, res);
                res.send(resInfo);
            });

            // 获取交易服务结果
            transactionRouter.get('/matchInfo', async function(req, res) {
                let matchInfo = await transactionMid.handleMatchInfo(contractRemote, seqObj, req, res);
                res.send(matchInfo);
            });

            // 提交买方确认
            transactionRouter.post('/buyerConfirm', async function(req, res) {
                let unsignedTxs = await transactionMid.handleBuyerConfirm(contractRemote, seqObj, req, res); // 返回的是需要签名的交易数组，因为需要将买方的确认写入所有相关合约
                res.send(unsignedTxs);
            });

            transactionRouter.post('/signedBuyerConfirm/buyOrder', async function(req, res) {
                let orderId = await transactionMid.handleSignedBuyerConfirmForBuyOrder(contractRemote, seqObj, req, res);
                res.send(orderId);
            });

            transactionRouter.post('/signedBuyerConfirm/sellOrder', async function(req, res) {
                let orderId = await transactionMid.handleSignedBuyerConfirmForSellOrder(contractRemote, seqObj, req, res);
                res.send(orderId);
            });

            // 卖方转让确认
            transactionRouter.post('/sellerTransferConfirm', async function(req, res) {
                let unsignedTxs = await transactionMid.handleSellerTransferConfirm(tokenRemote, contractRemote, seqObj, req, res);
                res.send(unsignedTxs);
            });

            transactionRouter.post('/signedSellerTransferConfirm/sellOrder', async function(req, res) {
                let orderId = await transactionMid.handleSignedSellerTransferConfirmForSellOrder(contractRemote, seqObj, req, res);
                res.send(orderId);
            });

            transactionRouter.post('/signedSellerTransferConfirm/transfer', async function(req, res) {
                let tokenId = await transactionMid.handleSignedSellerTransferConfirmForToken(tokenRemote, contractRemote, seqObj, req, res);
                res.send(tokenId);
            });

            // 卖方许可确认
            transactionRouter.post('/sellerApproveConfirm', async function(req, res) {
                let unsignedTx = await transactionMid.handleSellerApproveConfirm(tokenRemote, contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedSellerApproveConfirm', async function(req, res) {
                let orderId = await transactionMid.handleSignedSellerApproveConfirm(contractRemote, seqObj, req, res);
                res.send(orderId);
            });

            /*----------http服务器配置----------*/

            const app = express();
            const port = 9001;

            app.use(bodyParser.urlencoded({
                extended:false,
                limit: '50mb',
            }));
            app.use(bodyParser.json({
                limit: '50mb',
            }));

            app.use('/upload', uploadRouter);
            app.use('/info', infoRouter);
            app.use('/contract', contractRouter);
            app.use('/transaction', transactionRouter);

            /*----------启动http服务器----------*/

            app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

        });

    });

});