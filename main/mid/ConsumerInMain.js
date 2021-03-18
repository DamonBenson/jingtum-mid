import * as getConsumer from '../../utils/KafkaUtils/getConsumer.js';
import {debugMode} from '../../utils/info.js';


/*创建消费者1:其中Consumer_1_queue为消费者1对应的接收队列，队列中存的是json对象*/
let Consumer_1 = await getConsumer.getConsumer();
let Consumer_1_queue = [];
if(debugMode)console.log('主页面',Consumer_1);
//(conn = {'kafkaHost':'39.102.93.47:9092'}, 
// topic = 'Test',
// consumer = 'Bernard')
function AddConsumer(mq, queue){
    let conn = mq.conn, topics = mq.consumers[0].topic, options = mq.consumers[0].options;
    mq.ConConsumer(conn, topics, options,  function (message){
        message.value = JSON.parse(message.value)
        if(debugMode){console.log(message.value)};//debugMode
        console.log('队长：',queue.push(message.value));//入队
    });
}
AddConsumer(Consumer_1, Consumer_1_queue);
AddConsumer(Consumer_1, Consumer_1_queue);




//例子：模拟处理队列的过程：30s内读取数据并进行操作
setInterval(function(){
    while(0 != queue.length)
    {
        console.log('shift',queue.shift());//出队
        //then put your code to deal with the element//
    }
}, 30000);




