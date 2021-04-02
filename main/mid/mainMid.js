import jlib from 'jingtum-lib';
import express from 'express';
import bodyParser from 'body-parser';

import * as requestInfo from '../../utils/jingtum/requestInfo.js';

import {chains} from '../../utils/info.js';
import * as uploadMid from './processFunction/uploadMid.js';
import * as contractMid from './processFunction/contractMid.js';
import * as transactionMid from './processFunction/transactionMid.js';

const uploadChain = chains[0];
const tokenChain = chains[0];
const contractChain = chains[1];

const upload_a0 = uploadChain.account.a[0].address;
const token_a0 = tokenChain.account.a[0].address;
const contract_a0 = contractChain.account.a[0].address;
const upload_a1 = uploadChain.account.a[1].address;
const token_a1 = tokenChain.account.a[1].address;
const contract_a1 = contractChain.account.a[1].address;
const upload_a9 = uploadChain.account.a[9].address;
const token_a9 = tokenChain.account.a[9].address;
const contract_a9 = contractChain.account.a[9].address;

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
                a9: {},
            };
            // 目前upload同token，不能分开计数
            // seqObj.a0.upload = (await requestInfo.requestAccountInfo(upload_a0, uploadRemote, false)).account_data.Sequence;
            seqObj.a0.token = (await requestInfo.requestAccountInfo(token_a0, tokenRemote, false)).account_data.Sequence;
            seqObj.a0.contract = (await requestInfo.requestAccountInfo(contract_a0, contractRemote, false)).account_data.Sequence;
            // seqObj.a1.upload = (await requestInfo.requestAccountInfo(upload_a1, uploadRemote, false)).account_data.Sequence;
            seqObj.a1.token = (await requestInfo.requestAccountInfo(token_a1, tokenRemote, false)).account_data.Sequence;
            seqObj.a1.contract = (await requestInfo.requestAccountInfo(contract_a1, contractRemote, false)).account_data.Sequence;
            // seqObj.a9.upload = (await requestInfo.requestAccountInfo(upload_a9, uploadRemote, false)).account_data.Sequence;
            seqObj.a9.token = (await requestInfo.requestAccountInfo(token_a9, tokenRemote, false)).account_data.Sequence;
            seqObj.a9.contract = (await requestInfo.requestAccountInfo(contract_a9, contractRemote, false)).account_data.Sequence;

            /*----------存证请求路由配置----------*/

            const uploadRouter = express.Router();

            uploadRouter.post('/init', async function(req, res) {
                let [addr, workId] = await uploadMid.handleUpload(uploadRemote, seqObj, req, res);
                uploadMid.handleRightTokenIssue(tokenRemote, seqObj, addr, workId, req, res);
                res.send(workId);
            });

            /*----------服务合约请求路由配置----------*/

            const contractRouter = express.Router();

            // 部署服务合约：
            // -	应用层——请求路由模块: deployService(contractCode, abi, platformId, serviceType)
            // -	请求处理模块——应用层: remote.initContract(contractCode, abi) 
            // -	应用层——请求路由模块: tx.sign()
            // -	请求处理模块: remote.buildSignTx(blob)
            // -	请求处理模块: remote.invokeContract(manageAddr, abi, ‘register(addr, platformId, serviceType)’)

            contractRouter.post('/deploy', async function(req, res) {
                let unsignedTx = await contractMid.handleInitContract(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            contractRouter.post('/signedDeploy', async function(req, res) {
                let contractAddr = await contractMid.handleSignedInitContract(contractRemote, seqObj, req, res);
                res.send(contractAddr);
            });

            // 查询服务合约
            // -	应用层——请求路由模块: getServiceInfo(platformId, serviceType)
            // -	请求处理模块——应用层: mysql.select(platfromId, serviceType)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘getInfo()’)

            contractRouter.get('/info', async function(req, res) {
                let contractAddr = await contractMid.handleContractQuery(contractRemote, seqObj, req, res);
                let contractInfo = await contractMid.handleContractInfo(contractRemote, seqObj, contractAddr, req, res);
                res.send(contractInfo);
            });

            /*----------交易请求路由配置----------*/

            const transactionRouter = express.Router();

            // 提交买单
            // -	应用层——请求路由模块: postServiceReq(serviceAddr, platformId, contact, orderInfo)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘postOrder(platformId, contact, orderInfo)’)
            // -	应用层——请求路由模块: tx.sign()
            // -	请求处理模块: remote.buildSignTx(blob)

            transactionRouter.post('/buy', async function(req, res) {
                let unsignedTx = await transactionMid.handleBuyOrder(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedBuy', async function(req, res) {
                await transactionMid.handleSignedBuyOrder(contractRemote, seqObj, req, res);
                res.send('success');
            });

            transactionRouter.post('/buyOrderConfirm', async function(req, res) {
                let unsignedTx = await transactionMid.handleBuyOrderConfirm(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedBuyOrderConfirm', async function(req, res) {
                await transactionMid.handleSignedBuyOrderComfirm(contractRemote, seqObj, req, res);
                res.send('success');
            });

            // 提交卖单
            // -	应用层——请求路由模块: postServiceReq(serviceAddr, platformId, contact, orderInfo)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘postOrder(platformId, contact, orderInfo)’)
            // -	应用层——请求路由模块: tx.sign()
            // -	请求处理模块: remote.buildSignTx(blob)

            transactionRouter.post('/sell', async function(req, res) {
                let unsignedTx = await transactionMid.handleSellOrder(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedSell', async function(req, res) {
                await transactionMid.handleSignedSellOrder(contractRemote, seqObj, req, res);
                res.send('success');
            });

            transactionRouter.post('/sellOrderConfirm', async function(req, res) {
                let unsignedTx = await transactionMid.handleSellOrderConfirm(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedSellOrderConfirm', async function(req, res) {
                await transactionMid.handleSignedSellOrderComfirm(contractRemote, seqObj, req, res);
                res.send('success');
            });

            // 提交交易服务结果
            // -	应用层——请求路由模块: postServiceRes(serviceAddr, platformId, orderId, matchInfo)
            // -	(对所有买/卖单合约)请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘matchOrder(platformId, orderId, matchInfo)’)
            // -	应用层——请求路由模块: tx.sign()
            // -	请求处理模块: remote.buildSignTx(blob)

            transactionRouter.post('/match', async function(req, res) {
                let unsignedTx = await transactionMid.handleMatch(contractRemote, seqObj, req, res);
                res.send(unsignedTx);
            });

            transactionRouter.post('/signedMatch', async function(req, res) {
                let orderId = await transactionMid.handleSignedMatch(contractRemote, seqObj, req, res);
                res.send(orderId);
            });

            // 获取交易服务结果
            // -	应用层——请求路由模块: getSeviceInfo (serviceAddr, orderId)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘getOrderInfo(orderId)’) q

            transactionRouter.get('/matchInfo', async function(req, res) {
                let matchInfo = await transactionMid.handleMatchInfo(contractRemote, seqObj, req, res);
                res.send(matchInfo);
            });

            // 提交买方确认
            // -	应用层——请求路由模块: postBuyerConfirm(serviceAddr, platformId, orderId)
            // -	请求处理模块: remote.invokeContract(serviceAddr, abi, ‘getOrderInfo(orderId)’)
            // -	(对所有买/卖单合约)请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘buyerConfirm(platformId, orderId)’)
            // -	(对所有买/卖单合约)应用层——请求路由模块: tx.sign()
            // -	(对所有买/卖单合约)请求处理模块: remote.buildSignTx(blob)

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
            // -	应用层——请求路由模块: postSellerConfirm(serviceAddr, platformId, tokenId, buyerAddr)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘sellerConfirm(platformId, orderId)’)
            // -	请求处理模块——应用层: remote.buildTransferTokenTx(tokenId, buyerAddr)
            // -	应用层——请求路由模块: 2个tx.sign()
            // -	请求处理模块: 2个remote.buildSignTx(blob)

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
            // -	应用层——请求路由模块: postSellerConfirm(serviceAddr, platformId, tokenId, buyerAddr)
            // -	请求处理模块——应用层: remote.invokeContract(serviceAddr, abi, ‘sellerConfirm(platformId, orderId)’)
            // -	请求处理模块——应用层: remote.buildTransferTokenTx(tokenId, buyerAddr)
            // -	应用层——请求路由模块: tx.sign()
            // -	请求处理模块: remote.buildSignTx(blob)

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

            app.use(bodyParser.urlencoded({extended:false}));
            app.use(bodyParser.json());

            app.use('/upload', uploadRouter);
            app.use('/contract', contractRouter);
            app.use('/transaction', transactionRouter);

            /*----------启动http服务器----------*/

            app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

        });

    });

});