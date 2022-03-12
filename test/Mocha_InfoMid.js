/**
 * @file: Mocha_InfoMid.js
 * @Description: 测试平台层infoMid.js功能（我的版权）
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * @author Bernard
 * @date 2022/2/21
*/
import * as httpUtils from '../utils/httpUtils.js';

const method = 'post';
const SeverIP = '101.200.197.36';
const Port = 9001;
describe('InfoMid',  function() {
  const url = '/user/work';
  describe('功能测试',  function() {
    it('responds with matching records', async function() {
      const body = {
        address : 'jML2zGdi1udiNojfdq7pYA9P78MUzFA3fS'
      };

      return new Promise(async(resolve, reject) => {
        let getResInfo = await httpUtils.get('http://' + SeverIP + ':' + Port + url, body);
        console.log('getResInfo:', getResInfo);
        resolve();
      });
    });
  });
  describe('异常测试', function() {});
});
