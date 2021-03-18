import * as kafka from 'kafka-node';
import {debugMode} from '../info.js';
 /*  初始化消费者option    */
export class Client {
    constructor(conn, topic, consumer) {
        if(debugMode){console.log('消息队列打开了')};//debugMode
        this.conn = conn;
        this.client = new kafka.KafkaClient(conn);
        this.mq_producer = null;

        this.mq_consumers = {};
        this.consumers = {};
        this.producers = {};
        this.producerOpitons = {
            // Configuration for when to consider a message as acknowledged, default 1
            requireAcks: 1,
            // The amount of time in milliseconds to wait for all acks before considered, default 100ms
            ackTimeoutMs: 5000,
            // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
            partitionerType: 0
        };
        this.ConsumerQueue = [];
        this.ProduceQueue = [];
    }   
    insertConsumer(consumer){
        this.consumers.push(consumer)
        if (debugMode){console.log('现在有消费者', this.consumers.length);}; //debugMode
    }
    // insertProducer(producer){
    //     this.producers.push(producer)
    //     if (debugMode){console.log('现在有生产者', this.producers.length);}; //debugMode
    // }
    Watch2WithKafkaInit()
    {
        this.producers ={
            'BuyOrder': 'BuyOrder' ,
            'SellOrder': 'SellOrder' ,
            'Match': 'Match' ,
            'BuyerConfirmTxs': 'BuyerConfirmTxs',
            'SellerConfirmTxs': 'SellerConfirmTxs' 
        };
        this.consumers = {
            'BuyOrder': {topic:'BuyOrder' ,'options': { 'autoCommit': true }},
            'SellOrder': {topic:'SellOrder','options': { 'autoCommit': true }} ,
            'Match': {topic:'Match' ,'options': { 'autoCommit': true }},
            'BuyerConfirmTxs': {topic:'BuyerConfirmTxs' ,'options': { 'autoCommit': true }},
            'SellerConfirmTxs': {topic:'SellerConfirmTxs' ,'options': { 'autoCommit': true }} 
        };
        if (debugMode){console.log('Client Setting UP');}; //debugMode
        this.SetupClient();
        if (debugMode){console.log('Client Setting Finished');}; //debugMode

    }
    SetupClient(){

        // this.ConProducer(this.producerOpitons,  function (){
        //     console.log('生产者队长：',this.ProduceQueue.length);//入队
        // });
        if (debugMode){console.log(this.consumers.length);}; //debugMode
    
        for(let i = (this.consumers.length -1); i >= 0; i--)
        {
            temp = this.consumers[i];
            if (debugMode){console.log('Consumer 号:',i,temp);}; //debugMode

            this.ConConsumer(temp.topic, temp.options, function (message){
                message.value = JSON.parse(message.value)
                if(debugMode){console.log(message.value)};//debugMode
                console.log('消费者队长：',this.ConsumerQueue.push(message.value));//入队
            });
        }
    }

    /*  消费者  */
    ConConsumer(topic, options, handler) {
        if (debugMode){console.log('增加消费者', this.conn, topic);}; //debugMode

        let consumer = new kafka.Consumer(this.client, topics, options);

        if (!!handler) {
            console.log('消费者开始啦┏(｀ー´)┛去找：',topics);
            consumer.on('message', handler);
        }

        consumer.on('error', function (err) {
            console.error('consumer error ', err.stack);
        });

        this.mq_consumers[topic] = consumer;
    }


    ConProducer(options, handler){
        let producer = new kafka.Producer(this.client,options);
        if (debugMode){console.log('增加生产者',this.conn);}; //debugMode
        producer.on('ready', function(){
            if(!!handler){
                console.log('生产者工作啦┏(｀ー´)┛');
                handler(producer);
            }
        });
    
        producer.on('error', function(err){
            console.error('producer error ',err.stack);
        });
    
        this.mq_producer = producer;
    }


    AddConsumer(topic = this.consumers[0][0].topic, options = this.consumers[0][0].options){
        this.ConConsumer(this.conn, topic, options,  function (message){
            message.value = JSON.parse(message.value)
            if(debugMode){console.log(message.value)};//debugMode
        });
    }


    CheckTopic(topic){
        try{
            this.mq_producer.createTopics([topic], function (){
            console.log("主题造一下",topic);});
        }
        catch{
            console.log("主题已经存在",topic);
        }
    }
    
    //@para producer string     Producer's Topic
    //@para _msg Str(json)      msg use the json in stringing
    ProducerSend(topic,_msg){
        this.mq_producer.send([_msg], function (err, data){
            if(err != null)
            {
                console.log("err：",err);
                console.log("提交失败，主题:",topic,"_msg：",_msg);
                return
            }
            console.log("提交成功，主题:",topic,"data：",data);
            console.log("..... ");
        });
    }
}

export function getClient(conn = {'kafkaHost':'39.102.93.47:9092'}, options = null){
    if(debugMode){console.log('我动了')};//debugMode

    
    let client = new Client(conn);
    if(debugMode){console.log('Client init',client)};//debugMode
    return client;
}

/*Consumer(client, payloads, options)
{
   topic: 'topicName',
   offset: 0, //default 0
   partition: 0 // default 0
}
{
    groupId: 'kafka-node-group',//consumer group id, default `kafka-node-group`
    // Auto commit config
    autoCommit: true,
    autoCommitIntervalMs: 5000,
    // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
    fetchMaxWaitMs: 100,
    // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
    fetchMinBytes: 1,
    // The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
    fetchMaxBytes: 1024 * 1024,
    // If set true, consumer will fetch message from the given offset in the payloads
    fromOffset: false,
    // If set to 'buffer', values will be returned as raw buffer objects.
    encoding: 'utf8',
    keyEncoding: 'utf8'
}
*/
/*Producer(KafkaClient, [options], [customPartitioner])
{
    // Configuration for when to consider a message as acknowledged, default 1
    requireAcks: 1,
    // The amount of time in milliseconds to wait for all acks before considered, default 100ms
    ackTimeoutMs: 100,
    // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
    partitionerType: 2
}
*/