import * as getClient from '../../utils/KafkaUtils/getClient.js';
import {debugMode} from '../../utils/info.js';


/*创建消费者1:其中Consumer_1_queue为消费者1对应的接收队列，队列中存的是json对象*/
const KafkaClient_Wath2 = await getClient.getClient();
let ConsumerQueue = [];
// console.log(KafkaClient_Wath2.conn);
KafkaClient_Wath2.Watch2WithKafkaInit(ConsumerQueue);
console.log(KafkaClient_Wath2.kafkaHostIP);

// console.log(KafkaClient_Wath2.consumers['BuyOrder']['options']['autoCommit']);
//Test
const produceTopic = 'FormalTest'
var msg = {
        OrderId	            :'买单标识'             ,	              //买单标识	Y
        SubBuyOrderList	    :'子买单'          	    ,             //子买单	Y
        LimitPrice          :'限价'	          	    ,                 //限价	Y
        TradeStrategy	    :'交易策略'   	        ,             //交易策略	Y
        AuthorizationInfo	:'授权信息'   	        ,         //授权信息	Y
        Side	            :'订单类型'      	    ,                 //订单类型	Y
        BuyerAddr	        :'买方用户地址'   	    ,            //买方用户地址	Y
        Contact	            :'买房用户联系方式'     , 	              //买房用户联系方式	Y
        PlatformAddr	    :'买方平台地址'    	    ,            //买方平台地址	Y
        TimeStamp	        :'时间戳'   	                     //时间戳	Y
};
KafkaClient_Wath2.ProducerSend(produceTopic,msg);
// let Wath2_ConsumerQueue = [];
// let Wath2_ProduceQueue = [];
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




// let a = {'Consumer 号:':'Consumer 号:'};
// if (debugMode){console.log(a);}; //debugMode
// if (debugMode){console.log(a.size);}; //debugMode
