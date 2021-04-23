import express from 'express';
import bodyParser from 'body-parser';
import * as backendMid from './backendProcessor/backendMid.js';


/*----------信息查询请求路由配置----------*/

const backendRouter = express.Router();
backendRouter.get('/authRightRate', async function(req, res) {
    let resJson = await backendMid.handleAuthRightRate(req, res);
    res.send({'data':[resJson]});
});
// localhost:9002/backend/authRightRate
backendRouter.get('/authByCompany', async function(req, res) {
    let resJson = await backendMid.handleAuthByCompany(req, res);
    res.send({'data':[resJson]});
});
// localhost:9002/backend/authByCompany



/*----------http服务器配置----------*/

const app = express();
const port = 9002;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/backend1', function (req, res) {
    res.send('Hello World');
 })

app.use('/backend', backendRouter);

/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

