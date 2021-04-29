/**
 * 消费者
 */

// const kafka = require('kafka-node');
import * as kafka from 'kafka-node';
import {debugMode} from '../../utils/info.js';
 /*  初始化消费者option    */
export class MQ {
    constructor(conn, topic, consumer) {
        if(debugMode){console.log('消息队列打开了')};//debugMode
        this.client = {};
        this.mq_consumers = {};
        this.conn = conn;
        this.consumers = [
            {
                'type': 'consumer',
                'options': { 'autoCommit': true, 'fromOffset': true },
                'name': consumer,
                'topic': [
                    { 'topic': topic , 'partition': 0,'offset': 0}
                ]
            }
        ];  
    }   
    /*  声明消息队列对象  */
    ConConsumer(conn, topics, options, handler) {
        if (debugMode){console.log('增加消费者', conn, this)}; //debugMode


        this.client = new kafka.KafkaClient(conn);
        let consumer = new kafka.Consumer(this.client, topics, options);

        if (!!handler) {
            consumer.on('message', handler);
        }

        consumer.on('error', function (err) {
            console.error('consumer error ', err.stack);
        });
    }
    
    AddConsumer(conn = this.conn, topics = this.consumers[0].topic, options = this.consumers[0].options, handler){
        this.ConConsumer(conn, topics, options, handler);
    }
}
export function getConsumer(conn = {'kafkaHost':'39.102.93.47:9092'}, 
                                    // topic = ['Test','FormalTest'],
                                    topic = 'FormalTest',
                                        consumer = 'Bernard'){
    if(debugMode){console.log('我动了')};//debugMode
    let mq = new MQ(conn,topic,consumer);
    if(debugMode){console.log(mq)};//debugMode
    return mq;
}
// /*  声明消息队列对象  */
// export async function Consumer(conn, topics, options, handler) {
//     if (debugMode){console.log('增加消费者', conn, this)}; //debugMode


//     this.client = new kafka.KafkaClient(conn);
//     let consumer = new kafka.Consumer(this.client, topics, options);

//     if (!!handler) {
//         consumer.on('message', handler);
//     }

//     consumer.on('error', function (err) {
//         console.error('consumer error ', err.stack);
//     });
//     this.mq_consumers['common'] = consumer;
// }
    
// export async function AddConsumer(MQ){
//     conn = MQ.conn, topic = MQ.consumers[0].topic, Option = MQ.consumers[0].options
//     Consumer(conn, topics, options,  function (message){
//         let _consumer = MQ.mq_consumers['common'];
//         message.value = JSON.parse(message.value)
//         if(debugMode){console.log(message.value)};//debugMode
//     });
// }
// exports = module.exports = getConsumer