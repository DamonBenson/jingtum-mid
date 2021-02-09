import * as localUtils from './utils/localUtils.js';

import express from 'express';

const app = express();
const port = 9001;

app.listen(port, () => console.log(`MainMid listening on port ${port}!`));

app.post('/a', a);
app.post('/b', a);

var i = 1000;

async function a() {
    await localUtils.sleep(i++);
}