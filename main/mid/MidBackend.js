import express from 'express';
import bodyParser from 'body-parser';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
/*----------信息查询请求路由配置----------*/
function reconnectMysql(){
    authDisplayGroup.c.connect();
}
const authRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

const listenRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
authRouter.get('/authRightRate', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleAuthRightRate(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/authRightRate
authRouter.get('/authByCompany', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleAuthByCompany(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/authByCompany

authRouter.get('/certificateAmountEXchange', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCertificateAmountEXchange(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/certificateAmountEXchange

authRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCertificateAmountGroupByWorkType(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/certificateAmountGroupByWorkType

authRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/certificateAmountGroupByWorkTypeEXchange

authRouter.get('/copyRightAmountEXchange', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCopyRightAmountEXchange(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/copyRightAmountEXchange

authRouter.get('/copyRightAmountGroupByIDtype', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCopyRightAmountGroupByIDtype(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/copyRightAmountGroupByIDtype

authRouter.get('/copyRightAmountGroupByCopyrightType', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleCopyRightAmountGroupByCopyrightType(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/copyRightAmountGroupByCopyrightType


/**************************/
/****       监测维权     ****/
/**************************/

listenRouter.get('/DetectNum', async function(req, res) {
    try{
        let resJson = await authDisplayGroup.handleDetectNum(req, res);
        res.send({'data':resJson});
    }catch{
        reconnectMysql();
    }
    res.end();
});
// localhost:9002/backend/listen/DetectNum

/*----------http服务器配置----------*/

const app = express();
const port = 9002;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/backend1', function (req, res) {
    res.send('Hello World');
 })
//app.js
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.use('/backend', authRouter);
app.use('/backend/listen', listenRouter);


/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

