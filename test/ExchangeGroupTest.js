// /**
//  * @Description: 测试交易组返回的交易撮合结果和交易确认结果
//  * @author Bernard
//  * @date 2021/5/22 
// */

// import * as fetch from "../utils/fetch.js";
// import util from "util";
// import fs from "fs";
// const MidIP = '39.102.93.47';// 中间层服务器IP
// import {exit} from "process";
// import * as getClient from "../utils/KafkaUtils/getClient.js";
// const msPer = 1000;
// const contractAddr = 'jPV4U2huLRaqw9nV7QAkg5oCLb5iEmyZUF';
// const ConsumerTopic_buyOrderConfirm = {topic:[{'topic': 'jPV4U2huLRaqw9nV7QAkg5oCLb5iEmyZUF_buyOrderConfirm', 'partition': 0}],options: { 'autoCommit': true }};
// const ConsumerTopic_Match = {topic:[{'topic': 'jPV4U2huLRaqw9nV7QAkg5oCLb5iEmyZUF_Match', 'partition': 0}],options: { 'autoCommit': true }};
// // consumer = {topic:[{'topic': 'FormalTest', 'partition': 0}],options: { 'autoCommit': true }}
// const KafkaClient = await getClient.getClient();
// let ConsumerQueue_buyOrderConfirm = [];
// let ConsumerQueue_Match = [];

// // TODO verify the kafka consumer
// // KafkaClient.AddConsumer(ConsumerTopic_buyOrderConfirm,ConsumerQueue_buyOrderConfirm);
// // KafkaClient.AddConsumer(ConsumerTopic_Match,ConsumerQueue_Match);
// //
// //
// // main();
// // function main(){
// //     const sendTradefile = new URL('file:E:\\InputFile\\GitBase\\Mid\\test\\testExample\\sendTrade.json');
// //     const buyOrderConfirmfile = new URL('file:E:\\InputFile\\GitBase\\Mid\\test\\testExample\\buyOrderConfirm.json');
// //     postStaticSendTrade(sendTradefile);
// //     postStaticbuyOrderConfirm(buyOrderConfirmfile);
// // }
// async function postSendTrade(sendTrade) {
//     // 开始计时
//     console.time('postSendTrade');
//     console.log("sendTrade:",sendTrade);
//     await fetch.postData(util.format('http://%s:9001/match/signedMatch', MidIP), sendTrade);
//     console.timeEnd('postSendTrade');
//     console.log('--------------------');
// }

// async function postBuyOrderConfirm(OrderConfirm) {
//     // 开始计时
//     console.time('postBuyOrderConfirm');
//     console.log("OrderConfirm:",OrderConfirm);//OrderConfirm = {...OrderConfirm}
//     await fetch.postData(util.format('http://%s:9001/buyOrderConfirm/signedBuyOrderConfirm', MidIP), OrderConfirm);
//     console.timeEnd('postBuyOrderConfirm');
//     console.log('--------------------');
// }

// async function postStaticSendTrade(file) {
//     fs.readFile(file, function(err,data){
//         if(err)
//             throw err;
//         let jsonObj=JSON.parse(data);
//         var i=0,size=jsonObj.length;
//         // 中间层不能连续处理这么多信息
//         setInterval(function(){
//             if(i == size)
//                 exit();
//             let record=jsonObj[i];
//             postSendTrade(record);
//             i++;
//         }, msPer);
//     });
// }

// async function postStaticbuyOrderConfirm(file) {
//     fs.readFile(file, function(err,data){
//         if(err)
//             throw err;
//         let jsonObj=JSON.parse(data);
//         var i=0,size=jsonObj.length;
//         // 中间层不能连续处理这么多信息
//         setInterval(function(){
//             if(i == size)
//                 exit();
//             let record=jsonObj[i];
//             postBuyOrderConfirm(record);
//             i++;
//         }, msPer);
//     });
// }
