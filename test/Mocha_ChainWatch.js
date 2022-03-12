/**
 * @file: Mocha_ChainWatch.js
 * @Description: 测试ChainWatch功能（chain0，chain1 存证链、通证链）
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * TODO 还无法投产
 * @author Bernard
 * @date 2022/2/21
*/
import assert from 'assert';
import jlib from 'jingtum-lib';
import * as tokenLayer from '../utils/jingtum/tokenLayer.js';
import {chains, userAccount} from '../utils/config/jingtum.js';

const Remote = jlib.Remote;

describe('ChainWatch', function() {
    describe('功能测试', function() {
      let chain = chains[0];// 存证链
      let chain1 = chains[1];// 通证链

      
      let r = new Remote({server: chain.server[2], local_sign: true});// 连接通证链
      r.connect(async function(err, result) {
        /*---------链接状态----------*/
        if(err) {
          return console.log('err= ', err);
        }
        else if(result) {
          console.log('connect= ', result);
        }
        
        /*----------修改确权信息----------*/
        it('should return -1 when the value is not present', function() {
          let root = {secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'};
          let Issuer = userAccount.baiduAuthorizeAccount;
          let a = {address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh', secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb' };//动态发币账号
          let publisher = {address: 'jEzzqRrqggQ1ZsNVBLPKx2cETZfn6mRSez', secret:'spm23QkjWZVtQp6Q4yWAV16caBQxU' }//发行账号
          tokenLayer.buildModifyAuthenticationInfoTxLayer(//remote , src , secret , id , authenticationInfo
              r,
              a.secret,
              a.address,
              publisher.address,
              'BBB',
              1,
              [{role: publisher.address, type: 2}]
          );  
  
        });//END#It

      });//END#Remote
    });
    describe('异常测试', function() {});
});