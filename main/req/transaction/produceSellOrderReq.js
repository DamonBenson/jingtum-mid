import * as localUtils from '../../../utils/localUtils.js';
import {userAccount, sellOrderContractAddrs, debugMode} from '../../../utils/info.js';
import * as getClient from '../../../utils/KafkaUtils/getClient.js';

/*----------消息队列----------*/
/*创建KafkaClient,且ConsumerQueue为所有消费者的接收队列，队列中存的是解析后的json结构对象*/
const randonSellorder_KafkaClient = await getClient.getClient();
let ConsumerQueue = [];
randonSellorder_KafkaClient.SetupClient(ConsumerQueue);

const msPerSellOrder = 60000;
const platformAddr = userAccount[4].address; // 平台账号
const sellerAddr = userAccount[5].address;

// 每10s上传一次数据
setInterval(produceSellOrderReq, msPerSellOrder);

async function produceSellOrderReq(KafkaClient) {

    console.time('sellOrderReq');
    // let workId = workInfo.work_id;
    // let sellerAddr = workInfo.addr;
    let workId = localUtils.randomNumber(100, 100000).toString(); 
    let sellOrder = generateSellOrder(workId, sellerAddr);


    //mashall
    //unmashall


    // order by 权衡版本推送接口
    let sellOrderInfo = {
        TimeStamp: 0,
        LabelSet: sellOrder.labelSet,
        ExpectedPrice: sellOrder.expectedPrice,
        WorkId: sellOrder.assetId,//origin as workInfo.work_id
        ContractAddr: sellOrder.contractAddr, // 待部署
        SellOrderId: sellOrder.orderId,
        SellOrderHash: '0',
        MatchScore: 0,    
    }
    if(debugMode) {
        console.log('sellOrderInfo:', sellOrderInfo);
    }
    // 推送买单信息
    if(KafkaClient == null){
        randonSellorder_KafkaClient.ProducerSend('SellOrder',sellOrderInfo);
    }
    console.timeEnd('sellOrderReq');
    console.log('--------------------');
}


function generateSellOrder(wrokId, sellerAddr) {
    
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);
    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: wrokId,//origin as workInfo.work_id
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        addr: platformAddr,
        contractAddr: sellOrderContractAddrs[0], // 待部署
        orderId:localUtils.randomNumber(100, 100000).toString(),
    }
    if(debugMode) {
        console.log('SellOrder:', sellOrder);
    }

    return sellOrder;

}

function generateLabelSet() {

    let labelSet = {};
    for(let i = 0; i < 5; i++) {
        // labelSet[i] = [localUtils.randomSelect([0, 1, 2, 3, 4])];
        labelSet[i] = [0];
    }
    return labelSet;

}

function generateExpectedPrice(basePrice) {

    let expectedPrice = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
    };
    for(let i = 0; i < 9; i++) {
        switch(i) {
            case 0:
            case 8:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 1:
            case 2:
            case 7:
            case 9:
                for(let k = 0; k < 3; k++) {
                    for(let l = 0; l < 4; l++) {
                        expectedPrice[i].push({
                            authorizationChannel: 0,
                            authorizationArea: k,
                            authorizationTime: l,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 3:
                for(let j = 0; j < 3; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 4:
            case 5:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        expectedPrice[i].push({
                            authorizationChannel: j,
                            authorizationArea: k,
                            authorizationTime: 0,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 6:
                for(let k = 0; k < 3; k++) {
                    expectedPrice[i].push({
                        authorizationChannel: 0,
                        authorizationArea: k,
                        authorizationTime: 0,
                        authorizationPrice: basePrice,
                    });
                }
                break;
            default:
                break;
        }
    }

    return expectedPrice;

}