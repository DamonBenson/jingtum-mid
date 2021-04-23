import * as kafka from 'kafka-node';
import {buyOrderContractAddrs, sellOrderContractAddrs, debugMode} from '../info.js';
const kafkaHostIP = ["39.102.93.47:9092",
"39.102.91.224:9092",
"39.102.92.249:9092",
"39.102.90.153:9092",
"39.102.92.229:9092"];//L
// const debugMode = 0;
 /*  初始化消费者option    */
export class Client {
    constructor(conn) {
        this.kafkaHostIP = kafkaHostIP;
        if(debugMode){console.log('消息队列打开了')};//debugMode
        this.conn = conn;
        this.client = new kafka.KafkaClient(conn);
        this.mq_producer = null;

        this.mq_consumers = new Map;
        this.consumers = null;
        this.producers = null;
        this.producerOpitons = {
            // Configuration for when to consider a message as acknowledged, default 1
            requireAcks: 1,
            // The amount of time in milliseconds to wait for all acks before considered, default 100ms
            ackTimeoutMs: 5000,
            // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
            partitionerType: 0
            };


    }   
    /*  消费者  */
    ConConsumer(topics, options, handler) {
        if (debugMode){console.log('增加消费者', topics, options);}; //debugMode

        let consumer = new kafka.Consumer(this.client, topics, options);

        if (!!handler) {
            console.log('消费者开始啦┏(｀ー´)┛去找：',topics);
            consumer.on('message', handler);
        }


        consumer.on('error', function (err) {
            console.error('consumer error ', err.stack);
        });

        this.mq_consumers.set[topics, consumer];
    }

    /*  生产者  */
    ConProducer(options, handler){
        let producer = new kafka.Producer(this.client,options);
        // if (debugMode){console.log('增加生产者',this.conn);}; //debugMode
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
    //para consumer eg：consumer = {topic:[{'topic': 'FormalTest', 'partition': 0}],options: { 'autoCommit': true }}
    //console.log(consumer.topic.topic);
    //添加一个消费者
    AddConsumer(consumer,ConsumerQueue){
        this.consumers.set([consumer.topic[0].topic,consumer])
        this.ConConsumer(consumer.topic, consumer.options, function (message){                                    
            message.value = JSON.parse(message.value)
            if(debugMode){console.log(message.value)};//debugMode
            console.log('消费者队长：',ConsumerQueue.push(message.value));//入队
        });
        if (debugMode){console.log('现在有消费者', this.consumers);}; //debugMode
    }
    //TODO添加一个消费者
    // AddConsumer(topic = this.consumers[0][0].topic, options = this.consumers[0][0].options){
    //     this.ConConsumer(this.conn, topic, options,  function (message){
    //         message.value = JSON.parse(message.value)
    //         if(debugMode){console.log(message.value)};//debugMode
    //     });
    // }
    //TODO插入生产者
    // insertProducer(producer){
    //     this.producers.push(producer)
    //     if (debugMode){console.log('现在有生产者', this.producers.length);}; //debugMode
    // }

    SetupClient(ConsumerQueue){
        this.ConProducer(this.producerOpitons);
        if (debugMode){console.log("this.consumers: ", this.consumers);}; //debugMode
        if (this.consumers == null)//没有消费者需要创建
            return;
        for (let value of this.consumers.values()) {
            console.log('topic:' + value.topic + 'options:' + value.options);
            this.ConConsumer(value.topic, value.options, function (message){                                    
                message.value = JSON.parse(message.value)
                if(debugMode){console.log(message.value)};//debugMode
                console.log('消费者队长：',ConsumerQueue.push(message.value));//入队
            });
        }
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
    
    //@para selTopic string     selected Topic in string
    //@para msg Str(json)       msg use the json in stringing
    ProducerSend(selTopic,msg){
        // TODO 其他非重启方式创建主题
        try{
            this.mq_producer.createTopics([selTopic], function (){
            console.log("主题造一下",selTopic);});
        }
        catch{
            console.log("主题已经存在",selTopic);
        }

        var _msg = {
            topic:[selTopic], 
            messages:[JSON.stringify(msg)],
            partition: 0
        };
        try{
            this.mq_producer.send([_msg], function (err, data){

                if(err == null)
                    console.log("发送成功",selTopic);
                else
                {
                    console.log("err：",err);
                    console.log("_msg：",_msg);
                    console.log("出错");
                }
                console.log("data：",data);
                console.log("..... ");
            })
        }
        catch{this.CheckTopic(selTopic);}
    }
    //Watch2的初始化 Client.Watch2WithKafkaInit()
    //console.log(consumers.get('FormalTest').topic.topic);//访问consumers对象
    Watch2WithKafkaInit(ConsumerQueue)
    {
        this.producers = [
            buyOrderContractAddrs[0] + '_BuyOrder',
            sellOrderContractAddrs[0] + '_SellOrder',
            buyOrderContractAddrs[0] + '_Match',
            sellOrderContractAddrs[0] + '_BuyerConfirmTxs',
            sellOrderContractAddrs + '_SellerConfirmTxs'
        ];
        // this.consumers = new Map([[
        //     'consumers',
        //     {
        //         topic: [
        //             {'topic': buyOrderContractAddrs[0] + '_BuyOrder', 'partition': 0},
        //             {'topic': sellOrderContractAddrs[0] + '_SellOrder', 'partition': 0},
        //             {'topic': buyOrderContractAddrs[0] + '_Match', 'partition': 0},
        //             {'topic': sellOrderContractAddrs[0] + '_BuyerConfirmTxs', 'partition': 0},
        //             {'topic': sellOrderContractAddrs[0] + '_SellerConfirmTxs', 'partition': 0}
        //         ],
        //         options: {'autoCommit': true }
        //     }
        // ]]);
        if (debugMode){console.log('Client Setting UP');}; //debugMode
        this.SetupClient(ConsumerQueue);
        if (debugMode){console.log('Client Setting Finished');}; //debugMode
    }
}

export function getClient(conn = {'kafkaHost':'39.102.93.47:9092'}, options = null){
    if(debugMode){console.log('我动了')};//debugMode
    const client = new Client(conn);
    // if(debugMode){console.log('Client init',client)};//debugMode
    if(debugMode){console.log('Client init Finished,\n..........\n')};//debugMode

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