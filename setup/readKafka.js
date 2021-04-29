import {getConsumer} from '../utils/kafkaUtils/getConsumer.js';
import {buyOrderContractAddrs, sellOrderContractAddrs} from '../utils/info.js';

const topic = sellOrderContractAddrs[0] + '_SellOrder';

let mq = await getConsumer();
mq.AddConsumer(undefined, [{ 'topic': topic , 'partition': 0,'offset': 360}], undefined, msg => {
    console.log(JSON.parse(msg.value).sellOrderId);
});
