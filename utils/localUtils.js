import jlib from 'jingtum-lib';
const u = jlib.utils;

/*----------暂停----------*/

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*----------生成随机len位字符串----------*/

export function randomString(len) {
    const length = len;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/*----------按prob概率分布从res中随机选择----------*/

export function randomSelect(res, prob) {
    var sum = 0;
    let factor = 0;
    let random = Math.random();
    for(var i = prob.length - 1; i >= 0; i--) {
        sum += prob[i];
    };
    random *= sum;
    for(var i = prob.length - 1; i >= 0; i--) {
        factor += prob[i];
        if(random <= factor) {
            return res[i];
        }
    }
    return null;
}

/*----------补全数字长度----------*/

export function formatStr(num, len) {
    if(String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
}

// /*----------16进制ascii码转字符串----------*/

// export function ascii2str(ascii) {
//     let str = '';
//     for(let i = ascii.length/2; i > 0; i--) {
//         str = String.fromCharCode(hex2int(ascii.substring(2 * i - 2, 2 * i))) + str;
//     }
//     return str;
// }

// /*----------16进制字符转10进制数字----------*/

// export function hex2int(hex) {
//     let len = hex.length, a = new Array(len), code;
//     for(let i = 0; i < len; i++) {
//         code = hex.charCodeAt(i);
//         if(48 <= code && code < 58) {
//             code -= 48;
//         } 
//         else {
//             code = (code & 0xdf) - 65 + 10;
//         }
//         a[i] = code;
//     }
//     return a.reduce(function(acc, c) {
//         acc = 16 * acc + c;
//         return acc;
//     }, 0);
// }

/*----------对象转为ERC721Memos格式----------*/

export function obj2memos(obj) {
    let memos = [];
    for(let k in obj) {
        let memoObj = {
            type: k,
            data: obj[k].toString()
        };
        memos.push(memoObj);
    }
    return memos;
}

/*----------ERC721Memos格式转为对象----------*/

export function memos2obj(arr) {
    let obj = new Object();
    for(let i = arr.length - 1; i >= 0; i--) {
        let k = u.hexToString(arr[i].Memo.MemoType);
        let v = u.hexToString(arr[i].Memo.MemoData);
        obj[k] = v;
    }
    obj['rightType'] = Number(obj['rightType']);
    obj['state'] = Number(obj['state']);
    return obj;
}

/*----------下划线转驼峰----------*/

export function toHump(name) {
    return name.replace(/\_(\w)/g, function(all, letter){
        return letter.toUpperCase();
    });
}

/*----------驼峰转下划线----------*/

export function toLine(name) {
    return name.replace(/([A-Z])/g,"_$1").toLowerCase();
}

/*----------js命名对象转mysql命名对象----------*/

export function toMysqlObj(obj) {
    for(let key in obj) {
        if(toLine(key) != key) {
            obj[toLine(key)] = obj[key];
            delete obj[key];
        }
    }
}

// /*----------时间戳转mysql的date格式----------*/

// export function toMysqlDate(ts) {
//     return (new Date(ts * 1000)).toJSON().slice(0, 19).replace('/T.*/', ' ');
// }