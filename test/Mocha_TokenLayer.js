

import assert from 'assert';
import jlib from 'jingtum-lib';
import * as tokenLayer from './utils/jingtum/tokenLayer.js';
import {chains, userAccount} from './utils/config/jingtum.js';

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

const Remote = jlib.Remote;

const modeSet = {
    buildIssueInfoModifyTxLayer:1,
    buildPublishTokenTxLayer:2,
};
const mode = modeSet.buildPublishTokenTxLayer;
describe('Array', function() {
  describe('#indexOf()', function() {
    let chain = chains[1];
    
    let r = new Remote({server: chain.server[2], local_sign: true});// 连接通证链
    r.connect(async function(err, result) {
      /*---------链接状态----------*/
      if(err) {
        return console.log('err= ', err);
      }
      else if(result) {
        console.log('connect= ', result);
      }


      /*----------修改发行信息----------*/
      it('should return -1 when the value is not present', function() {
        let root = {secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'};
        let Issuer = userAccount.baiduAuthorizeAccount;
        let a = {address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh', secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb' };//动态发币账号
        let publisher = {address: 'jEzzqRrqggQ1ZsNVBLPKx2cETZfn6mRSez', secret:'spm23QkjWZVtQp6Q4yWAV16caBQxU' }//发行账号
        await tokenLayer.buildIssueInfoModifyTxLayer(
            r,
            a.secret,
            a.address,
            publisher.address,
            'BBB',
            1,
            [{role: publisher.address, type: 2}]
        );  
      });//END#It

      /*----------发行通证（V2）----------*/
      it('should return -1 when the value is not present', function() {
        let root = {secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'};
        let Issuer = userAccount.baiduAuthorizeAccount;
        let role1 = {secret: 'sntaa5cuniAWUSKgKTHZm4BVyZq1p',address: 'jwaygG953qSq4dc5mwoTWubWUFmpyvhAYN'};
        let role2 = {secret: 'shepnxJaoR7xXjA8GfmS3A5e4UGUD',address: 'jLiDHBMyBQr2oSTQca887wsGjZ5PwfGqnJ' };
        let publisherSecr = Issuer.secret;
        let publisher = Issuer.address;
        let receiver = role1.address;
        let token = 'AAA';
        let referenceFlag = 1; //通证标识：1表示版权通证，2表示授权通证，3表示操作许可通证。
        let tokenObject = {
            flag: 0,
            tokenId: 'AA4B02EEB5DA7C0CA6A95921248949B88F34D1E6D23580B974CE309A048380D1',
            copyrightType: 1,
            copyrightsGetType: 2,
            workId: '0xA5DE6EE35AB5C4B5E87BE58100058E6030C10ABBE2DAC300FDFBEF315B97546F',
            authenticationInfos: [],
            copyrightUnits: [
                {address: role1.address, proportion: '0.2', copyrightExplain:'20%' }
            ],
            copyrightConstraint: [{
                  copyrightLimit: 1
            }],
            apprConstraint: [{
                  channel:'11111',
                  area:'beijing',
                  time: '2021-12-31',
                  transferType: '1',
                  reapproveType: '1'
            }],
            licenseConstraint: [{
                  type:'1',
                  area:'shanghai',
                  time: '2021-12-31'
            }],
            constraintExplain: 'explain',
            constraintExpand: '123456',           
            copyrightStatus: [{
                publishStatus: 0,
                publishCity: 'beijing',
                publishCountry: 'zhongguom',
                publishDate: '2021-12-31',
                comeoutStatus: 0,
                comeoutCity: 'beijing',
                comeoutCountry: 'zhongguo',
                comeoutDate: '2021-12-31',
                issueStatus: 0,
                issueCity: 'beijing',
                issueCountry: 'zhongguo',
                issueDate: '2021-12-31'
            }]
        };
        console.log("tokenObject：",tokenObject)

        await tokenLayer.buildPublishTokenTxLayer(r, publisherSecr, publisher, receiver, token, referenceFlag, tokenObject)
      });//END#It
      
      /*----------修改确权信息----------*/
      it('should return -1 when the value is not present', function() {
        let root = {secret: 'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'};
        let Issuer = userAccount.baiduAuthorizeAccount;
        let a = {address: 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh', secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb' };//动态发币账号
        let publisher = {address: 'jEzzqRrqggQ1ZsNVBLPKx2cETZfn6mRSez', secret:'spm23QkjWZVtQp6Q4yWAV16caBQxU' }//发行账号
        await tokenLayer.buildModifyAuthenticationInfoTxLayer(//remote , src , secret , id , authenticationInfo
            r,
            a.secret,
            a.address,
            publisher.address,
            'BBB',
            1,
            [{role: publisher.address, type: 2}]
        );  

      });//END#It

      /*----------查看单个版权通证详情（V2）----------*/
      it('should return tokenInfo', function() {
        let tokenInfo = await tokenLayer.requestCopyrightTokenInfoLayer(
            r,
            a.address,
        );
        assert.equal(tokenInfo.workId, undefined);//类型
      });//END#It
      
      r.disconnect();
    });//END#Remote
  });
});
  
  

