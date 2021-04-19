import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as requestInfo from '../utils/jingtum/requestInfo.js';
import * as contract from '../utils/jingtum/contract.js';
import * as ipfsUtils from '../utils/ipfsUtils.js';
import * as mysqlUtils from '../utils/mysqlUtils.js';

import {chains, ipfsConf, mysqlConf} from '../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const contractChain = chains[1];
//买单合约：智能交易系统 卖单合约：平台
const platformAddr = contractChain.account.a[14].address;
const platformSecret = contractChain.account.a[14].secret;
// 一次部署一个 abi 和 payload
const abi = [{"constant":true,"inputs":[],"name":"listAllOrderID","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"},{"name":"asset_id","type":"uint256[]"},{"name":"asset_type","type":"uint8"},{"name":"consumable","type":"bool"},{"name":"expire_time","type":"uint256"},{"name":"other_clauses","type":"string"}],"name":"makeOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"addAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"}],"name":"listOrderIDFromOffset","outputs":[{"name":"","type":"uint256[10]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"addChecker","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"}],"name":"listOrderFromOffset","outputs":[{"components":[{"components":[{"name":"asset_id","type":"uint256[]"},{"name":"asset_type","type":"uint8"},{"name":"consumable","type":"bool"}],"name":"order_type","type":"tuple"},{"name":"expire_time","type":"uint256"},{"name":"label_ref","type":"string"},{"name":"price_ref","type":"string"},{"name":"other_clause","type":"string"},{"name":"status","type":"bool"}],"name":"","type":"tuple[10]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"},{"name":"label_ref","type":"string"},{"name":"price_ref","type":"string"}],"name":"updateAdditionInfoRef","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"order_id","type":"uint256"}],"name":"getOrderInfo","outputs":[{"components":[{"components":[{"name":"asset_id","type":"uint256[]"},{"name":"asset_type","type":"uint8"},{"name":"consumable","type":"bool"}],"name":"order_type","type":"tuple"},{"name":"expire_time","type":"uint256"},{"name":"label_ref","type":"string"},{"name":"price_ref","type":"string"},{"name":"other_clause","type":"string"},{"name":"status","type":"bool"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTimeStamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"},{"name":"taker_address","type":"address"},{"name":"mono","type":"bool"}],"name":"commitOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"},{"name":"expire_time","type":"uint256"},{"name":"other_clauses","type":"string"}],"name":"makeBuyIntention","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const payload = '60806040526000339050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550506125f8806101086000396000f3fe608060405234801561001057600080fd5b50600436106100d1576000357c010000000000000000000000000000000000000000000000000000000090048063b4bddc051161008e578063b4bddc0514610194578063d2b2609f146101c4578063d311636b146101e0578063da235b2214610210578063ef66d5e51461022e578063efb16a651461024a576100d1565b806339bd0763146100d65780633e7146a1146100f4578063514fcac714610110578063704802751461012c5780637ac996bf14610148578063916473ab14610178575b600080fd5b6100de610266565b6040516100eb919061232a565b60405180910390f35b61010e60048036036101099190810190611c29565b6102be565b005b61012a60048036036101259190810190611bb1565b61067f565b005b61014660048036036101419190810190611b88565b61083e565b005b610162600480360361015d9190810190611bb1565b6108db565b60405161016f919061230e565b60405180910390f35b610192600480360361018d9190810190611b88565b61095c565b005b6101ae60048036036101a99190810190611bb1565b6109f9565b6040516101bb91906122ec565b60405180910390f35b6101de60048036036101d99190810190611cec565b610d47565b005b6101fa60048036036101f59190810190611bb1565b610e96565b604051610207919061242c565b60405180910390f35b610218611174565b604051610225919061244e565b60405180910390f35b61024860048036036102439190810190611bda565b61117c565b005b610264600480360361025f9190810190611d75565b61146f565b005b606060058054806020026020016040519081016040528092919081815260200182805480156102b457602002820191906000526020600020905b8154815260200190600101908083116102a0575b5050505050905090565b60011515600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515141515610353576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161034a906123ac565b60405180910390fd5b876003600082815260200190815260200160002060060160009054906101000a900460ff161515156103ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103b1906123cc565b60405180910390fd5b60028660ff161415806103ca5750845b151561040b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610402906123ec565b60405180910390fd5b610413611756565b6060604051908101604052808a8a80806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505081526020018860ff168152602001871515815250905061047f61177d565b60c0604051908101604052808381526020014288018152602001602060405190810160405280600081525081526020016020604051908101604052806000815250815260200186868080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050815260200160011515815250905080600360008d815260200190815260200160002060008201518160000160008201518160000190805190602001906105519291906117bd565b5060208201518160010160006101000a81548160ff021916908360ff16021790555060408201518160010160016101000a81548160ff02191690831515021790555050506020820151816002015560408201518160030190805190602001906105bb92919061180a565b5060608201518160040190805190602001906105d892919061180a565b5060808201518160050190805190602001906105f592919061180a565b5060a08201518160060160006101000a81548160ff02191690831515021790555090505061062161188a565b6020604051908101604052905080600460008e815260200190815260200160002090505060058c9080600181540180825580915050906001820390600052602060002001600090919290919091505550505050505050505050505050565b60011515600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515141515610714576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161070b906123ac565b60405180910390fd5b806003600082815260200190815260200160002060060160009054906101000a900460ff16151561077a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107719061234c565b60405180910390fd5b600360008381526020019081526020016000206000808201600080820160006107a39190611898565b6001820160006101000a81549060ff02191690556001820160016101000a81549060ff0219169055505060028201600090556003820160006107e591906118b9565b6004820160006107f591906118b9565b60058201600061080591906118b9565b6006820160006101000a81549060ff02191690555050600460008381526020019081526020016000205061083a6005836115b4565b5050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156108cf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108c69061238c565b60405180910390fd5b6108d881611698565b50565b6108e3611901565b600060058054905090506108f5611901565b60008090505b8285820110801561090c5750600a81105b1561095157600585820181548110151561092257fe5b90600052602060002001548282600a8110151561093b57fe5b60200201818152505080806001019150506108fb565b508092505050919050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156109ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e49061238c565b60405180910390fd5b6109f6816116fc565b50565b610a01611925565b60006005805490509050610a13611925565b60008090505b82858201108015610a2a5750600a81105b15610d3c57600360006005878401815481101515610a4457fe5b9060005260206000200154815260200190815260200160002060c06040519081016040529081600082016060604051908101604052908160008201805480602002602001604051908101604052809291908181526020018280548015610ac957602002820191906000526020600020905b815481526020019060010190808311610ab5575b505050505081526020016001820160009054906101000a900460ff1660ff1660ff1681526020016001820160019054906101000a900460ff161515151581525050815260200160028201548152602001600382018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610bb15780601f10610b8657610100808354040283529160200191610bb1565b820191906000526020600020905b815481529060010190602001808311610b9457829003601f168201915b50505050508152602001600482018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610c535780601f10610c2857610100808354040283529160200191610c53565b820191906000526020600020905b815481529060010190602001808311610c3657829003601f168201915b50505050508152602001600582018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610cf55780601f10610cca57610100808354040283529160200191610cf5565b820191906000526020600020905b815481529060010190602001808311610cd857829003601f168201915b505050505081526020016006820160009054906101000a900460ff1615151515815250508282600a81101515610d2757fe5b60200201819052508080600101915050610a19565b508092505050919050565b60011515600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515141515610ddc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dd3906123ac565b60405180910390fd5b846003600082815260200190815260200160002060060160009054906101000a900460ff161515610e42576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e399061234c565b60405180910390fd5b8484600360008981526020019081526020016000206003019190610e67929190611954565b508282600360008981526020019081526020016000206004019190610e8d929190611954565b50505050505050565b610e9e61177d565b6003600083815260200190815260200160002060c06040519081016040529081600082016060604051908101604052908160008201805480602002602001604051908101604052809291908181526020018280548015610f1d57602002820191906000526020600020905b815481526020019060010190808311610f09575b505050505081526020016001820160009054906101000a900460ff1660ff1660ff1681526020016001820160019054906101000a900460ff161515151581525050815260200160028201548152602001600382018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156110055780601f10610fda57610100808354040283529160200191611005565b820191906000526020600020905b815481529060010190602001808311610fe857829003601f168201915b50505050508152602001600482018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156110a75780601f1061107c576101008083540402835291602001916110a7565b820191906000526020600020905b81548152906001019060200180831161108a57829003601f168201915b50505050508152602001600582018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156111495780601f1061111e57610100808354040283529160200191611149565b820191906000526020600020905b81548152906001019060200180831161112c57829003601f168201915b505050505081526020016006820160009054906101000a900460ff1615151515815250509050919050565b600042905090565b60011515600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515141515611211576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611208906123ac565b60405180910390fd5b826003600082815260200190815260200160002060060160009054906101000a900460ff161515611277576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161126e9061234c565b60405180910390fd5b426004600086815260200190815260200160002060000160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154111515611311576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113089061236c565b60405180910390fd5b6003600085815260200190815260200160002060000160010160019054906101000a900460ff16806113405750815b1561140a576003600085815260200190815260200160002060008082016000808201600061136e9190611898565b6001820160006101000a81549060ff02191690556001820160016101000a81549060ff0219169055505060028201600090556003820160006113b091906118b9565b6004820160006113c091906118b9565b6005820160006113d091906118b9565b6006820160006101000a81549060ff0219169055505060046000858152602001908152602001600020506114056005856115b4565b611469565b6004600085815260200190815260200160002060000160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008082016000905550505b50505050565b836003600082815260200190815260200160002060060160009054906101000a900460ff1615156114d5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114cc9061234c565b60405180910390fd5b42600360008781526020019081526020016000206002015411151561152f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115269061240c565b60405180910390fd5b6115376119d4565b6020604051908101604052808642018152509050806004600088815260200190815260200160002060000160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008201518160000155905050505050505050565b600080600090505b8380549050811015611610578284828154811015156115d757fe5b906000526020600020015414156115f057809150611610565b8380549050811415611603575050611694565b80806001019150506115bc565b5060018380549050038114151561167d5760008190505b600184805490500381101561167b57836001820181548110151561164757fe5b9060005260206000200154848281548110151561166057fe5b90600052602060002001819055508080600101915050611627565b505b8280548091906001900361169191906119e8565b50505b5050565b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506116f9816116fc565b50565b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60606040519081016040528060608152602001600060ff1681526020016000151581525090565b61010060405190810160405280611792611a14565b8152602001600081526020016060815260200160608152602001606081526020016000151581525090565b8280548282559060005260206000209081019282156117f9579160200282015b828111156117f85782518255916020019190600101906117dd565b5b5090506118069190611a3b565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061184b57805160ff1916838001178555611879565b82800160010185558215611879579182015b8281111561187857825182559160200191906001019061185d565b5b5090506118869190611a3b565b5090565b602060405190810160405290565b50805460008255906000526020600020908101906118b69190611a3b565b50565b50805460018160011615610100020316600290046000825580601f106118df57506118fe565b601f0160209004906000526020600020908101906118fd9190611a3b565b5b50565b61014060405190810160405280600a90602082028038833980820191505090505090565b610a0060405190810160405280600a905b61193e611a60565b8152602001906001900390816119365790505090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061199557803560ff19168380011785556119c3565b828001600101855582156119c3579182015b828111156119c25782358255916020019190600101906119a7565b5b5090506119d09190611a3b565b5090565b602060405190810160405280600081525090565b815481835581811115611a0f57818360005260206000209182019101611a0e9190611a3b565b5b505050565b60606040519081016040528060608152602001600060ff1681526020016000151581525090565b611a5d91905b80821115611a59576000816000905550600101611a41565b5090565b90565b61010060405190810160405280611a75611a14565b8152602001600081526020016060815260200160608152602001606081526020016000151581525090565b6000611aac8235612545565b905092915050565b60008083601f8401121515611ac857600080fd5b8235905067ffffffffffffffff811115611ae157600080fd5b602083019150836020820283011115611af957600080fd5b9250929050565b6000611b0c8235612557565b905092915050565b60008083601f8401121515611b2857600080fd5b8235905067ffffffffffffffff811115611b4157600080fd5b602083019150836001820283011115611b5957600080fd5b9250929050565b6000611b6c8235612563565b905092915050565b6000611b80823561256d565b905092915050565b600060208284031215611b9a57600080fd5b6000611ba884828501611aa0565b91505092915050565b600060208284031215611bc357600080fd5b6000611bd184828501611b60565b91505092915050565b600080600060608486031215611bef57600080fd5b6000611bfd86828701611b60565b9350506020611c0e86828701611aa0565b9250506040611c1f86828701611b00565b9150509250925092565b60008060008060008060008060c0898b031215611c4557600080fd5b6000611c538b828c01611b60565b985050602089013567ffffffffffffffff811115611c7057600080fd5b611c7c8b828c01611ab4565b97509750506040611c8f8b828c01611b74565b9550506060611ca08b828c01611b00565b9450506080611cb18b828c01611b60565b93505060a089013567ffffffffffffffff811115611cce57600080fd5b611cda8b828c01611b14565b92509250509295985092959890939650565b600080600080600060608688031215611d0457600080fd5b6000611d1288828901611b60565b955050602086013567ffffffffffffffff811115611d2f57600080fd5b611d3b88828901611b14565b9450945050604086013567ffffffffffffffff811115611d5a57600080fd5b611d6688828901611b14565b92509250509295509295909350565b60008060008060608587031215611d8b57600080fd5b6000611d9987828801611b60565b9450506020611daa87828801611b60565b935050604085013567ffffffffffffffff811115611dc757600080fd5b611dd387828801611b14565b925092505092959194509250565b6000611dec82612497565b83602082028501611dfc85612469565b60005b84811015611e35578383038852611e17838351612221565b9250611e22826124ce565b9150602088019750600181019050611dff565b508196508694505050505092915050565b611e4f816124a2565b611e5882612473565b60005b82811015611e8a57611e6e8583516122bf565b611e77826124db565b9150602085019450600181019050611e5b565b5050505050565b6000611e9c826124b8565b808452602084019350611eae8361248a565b60005b82811015611ee057611ec48683516122bf565b611ecd826124f5565b9150602086019550600181019050611eb1565b50849250505092915050565b6000611ef7826124ad565b808452602084019350611f098361247d565b60005b82811015611f3b57611f1f8683516122bf565b611f28826124e8565b9150602086019550600181019050611f0c565b50849250505092915050565b611f5081612502565b82525050565b6000611f61826124c3565b808452611f7581602086016020860161257a565b611f7e816125ad565b602085010191505092915050565b6000601582527f4f7264657220646f6573206e6f742065786973742100000000000000000000006020830152604082019050919050565b6000601682527f496e74656e74696f6e2074696d652065787069726564000000000000000000006020830152604082019050919050565b6000602082527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726020830152604082019050919050565b6000601782527f43616c6c6572206973206e6f74207468652061646d696e0000000000000000006020830152604082019050919050565b6000601982527f4f726465722068617320616c72656164792065786973747321000000000000006020830152604082019050919050565b6000602d82527f546865206f72646572206f6620747970652032206173736574206d757374206260208301527f6520636f6e73756d61626c6521000000000000000000000000000000000000006040830152606082019050919050565b6000601182527f54696d652045787069726564206e6f77210000000000000000000000000000006020830152604082019050919050565b600060608301600083015184820360008601526121508282611eec565b915050602083015161216560208601826122dd565b5060408301516121786040860182611f47565b508091505092915050565b600060c08301600083015184820360008601526121a08282612133565b91505060208301516121b560208601826122bf565b50604083015184820360408601526121cd8282611f56565b915050606083015184820360608601526121e78282611f56565b915050608083015184820360808601526122018282611f56565b91505060a083015161221660a0860182611f47565b508091505092915050565b600060c083016000830151848203600086015261223e8282612133565b915050602083015161225360208601826122bf565b506040830151848203604086015261226b8282611f56565b915050606083015184820360608601526122858282611f56565b9150506080830151848203608086015261229f8282611f56565b91505060a08301516122b460a0860182611f47565b508091505092915050565b6122c88161252e565b82525050565b6122d78161252e565b82525050565b6122e681612538565b82525050565b600060208201905081810360008301526123068184611de1565b905092915050565b6000610140820190506123246000830184611e46565b92915050565b600060208201905081810360008301526123448184611e91565b905092915050565b6000602082019050818103600083015261236581611f8c565b9050919050565b6000602082019050818103600083015261238581611fc3565b9050919050565b600060208201905081810360008301526123a581611ffa565b9050919050565b600060208201905081810360008301526123c581612031565b9050919050565b600060208201905081810360008301526123e581612068565b9050919050565b600060208201905081810360008301526124058161209f565b9050919050565b60006020820190508181036000830152612425816120fc565b9050919050565b600060208201905081810360008301526124468184612183565b905092915050565b600060208201905061246360008301846122ce565b92915050565b6000819050919050565b6000819050919050565b6000602082019050919050565b6000602082019050919050565b6000600a9050919050565b6000600a9050919050565b600081519050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60006125508261250e565b9050919050565b60008115159050919050565b6000819050919050565b600060ff82169050919050565b60005b8381101561259857808201518184015260208101905061257d565b838111156125a7576000848401525b50505050565b6000601f19601f830116905091905056fea265627a7a7230582089db13db7cb6975ca5fe8148099861f226b527529a2f7047a4057e1fdc31700b6c6578706572696d656e74616cf50037';

const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }

    let seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    let deployRes = await contract.initContract(platformAddr, platformSecret, contractRemote, seq++, abi, payload, true);

    let contractAddr = deployRes.ContractState;
    let abiBuffer = Buffer.from(JSON.stringify(abi));
    let abiHash = await ipfsUtils.add(ipfs, abiBuffer);
    let contractInfo = {
        contract_addr: contractAddr,
        abi_hash: abiHash,
    }
    let sql = sqlText.table('contract_info').data(contractInfo).insert();
    console.log(contractInfo);
    await mysqlUtils.sql(c, sql);

    contractRemote.disconnect();

})
