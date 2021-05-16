import express from 'express';
import bodyParser from 'body-parser';
import * as backendMid from './backendProcessor/backendMid.js';


/*----------信息查询请求路由配置----------*/

const backendRouter = express.Router({
    caseSensitive: false,// 不区分大小写

});
backendRouter.get('/authRightRate', async function(req, res) {
    let resJson = await backendMid.handleAuthRightRate(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/authRightRate
backendRouter.get('/authByCompany', async function(req, res) {
    let resJson = await backendMid.handleAuthByCompany(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/authByCompany

backendRouter.get('/certificateAmountEXchange', async function(req, res) {
    let resJson = await backendMid.handleCertificateAmountEXchange(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/certificateAmountEXchange

backendRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    let resJson = await backendMid.handleCertificateAmountGroupByWorkType(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/certificateAmountGroupByWorkType

backendRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    let resJson = await backendMid.handleCertificateAmountGroupByWorkTypeEXchange(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/certificateAmountGroupByWorkTypeEXchange

backendRouter.get('/copyRightAmountEXchange', async function(req, res) {
    let resJson = await backendMid.handleCopyRightAmountEXchange(req, res);
    // resJson = JSON.stringify(resJson,"","\t")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/copyRightAmountEXchange

backendRouter.get('/copyRightAmountGroupByIDtype', async function(req, res) {
    let resJson = await backendMid.handleCopyRightAmountGroupByIDtype(req, res);
    // resJson = JSON.stringify(resJson,"","\n")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/copyRightAmountGroupByIDtype

backendRouter.get('/copyRightAmountGroupByCopyrightType', async function(req, res) {
    let resJson = await backendMid.handleCopyRightAmountGroupByCopyrightType(req, res);
    // resJson = JSON.stringify(resJson,null,"\n")
    res.send({'data':resJson});
    res.end();
});
// localhost:9002/backend/copyRightAmountGroupByCopyrightType



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
app.use('/backend', backendRouter);

/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

