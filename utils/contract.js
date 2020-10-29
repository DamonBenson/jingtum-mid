export default class Contract {

    /*----------部署合约----------*/

    initContract(a, s, r, seq, abi, payload, showRes) {

        let tx = r.initContract({
            account: a, 
            amount: 10000,
            payload: payload, //合约编译后的16进制字节码
            abi: abi, //合约abi
            params:[]
        });

        tx.setSequence(seq);

        tx.setSecret(s);

        return new Promise((resolve, reject) => {

            tx.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('initContract:', result);
                    }
                    resolve(result.ContractState);
                }
            });

        });

    }

    /*----------调用合约----------*/

    invokeContract(a, s, r, seq, abi, d, func, showRes) {

        let tx = r.invokeContract({
            account: a, 
            destination: d,
            abi: abi,
            func: func,
        });

        tx.setSequence(seq);

        tx.setSecret(s);

        return new Promise((resolve, reject) => {

            tx.submit(function(err, result) {
                if(err) {
                    console.log('err:', err);
                    reject('err');
                }
                else if(result) {
                    if(showRes) {
                        console.log('invokeContract:', result);
                    }
                    console.log('invokeContract:', result.engine_result + " " + result.func + " " + result.func_parms + " " + result.tx_json.Sequence);
                    resolve(result);
                }
            });

        });

    }

    /*----------调用合约(并处理错误)----------*/

    async safeInvokeContract(a, s, r, seqObj, abi, d, func, showRes) {

        while(true) {

            let res = await invokeContract(a, s, r, seqObj.val, abi, d, func, showRes);
            if(res.engine_result == 'tesSUCCESS') {
                seqObj.val++;
                return res.ContractState;
            }
            else if(res.engine_result == 'tefPAST_SEQ' || res.engine_result == 'tefALREADY') {
                seqObj.val++;
                await sleep(100);
            }
            else if(res.engine_result == 'terPRE_SEQ') {
                seqObj.val--;
                await sleep(100);
            }
            else if(res.engine_result == 'telBAD_INVOKE_CONTRACT') {
                return res.ContractState;
            }

        }

    }

}