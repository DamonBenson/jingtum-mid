    import * as getClient from '../../utils/KafkaUtils/getClient.js';
import {debugMode} from '../../utils/info.js';


/*创建消费者1:其中Consumer_1_queue为消费者1对应的接收队列，队列中存的是json对象*/
let KafkaClient_Wath2 = await getClient.getClient();
// let Wath2_ConsumerQueue = [];
// let Wath2_ProduceQueue = [];
KafkaClient_Wath2.Watch2WithKafkaInit()
//(conn = {'kafkaHost':'39.102.93.47:9092'}, 

// Wath2_ConsumerQueue
// KafkaClient_Wath2.ConProducer

// //例子：模拟处理队列的过程：30s内读取数据并进行操作
// setInterval(function(){
//     while(0 != queue.length)
//     {
//         console.log('shift',queue.shift());//出队
//         //then put your code to deal with the element//
//     }
// }, 30000);




