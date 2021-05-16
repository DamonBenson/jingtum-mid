import jlib from 'jingtum-lib';
const u = jlib.utils;

/*----------暂停----------*/

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*----------生成区间[min, max)的随机整数---------*/

export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
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
    if(!prob) {
        prob = (new Array(res.length)).fill(1);
    }
    let sum = 0;
    let factor = 0;
    let random = Math.random();
    for(let i = prob.length - 1; i >= 0; i--) {
        sum += prob[i];
    };
    random *= sum;
    for(let i = prob.length - 1; i >= 0; i--) {
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

/*----------mysql命名对象转js命名对象----------*/

export function fromMysqlObj(obj) {
    for(let key in obj) {
        if(toHump(key) != key) {
            obj[toHump(key)] = obj[key];
            delete obj[key];
        }
    }
    return obj;
}

// /*----------时间戳转mysql的date格式----------*/

// export function toMysqlDate(ts) {
//     return (new Date(ts * 1000)).toJSON().slice(0, 19).replace('/T.*/', ' ');
// }

/**
 * @description 将对象转为链上的ERC721tokenInfos数据格式。
 * @param {Object}obj tokensInfo对象
 * @returns {Object[]} 链上的ERC721tokenInfos数据格式，包括type属性名、data属性值
 */
export function obj2tokenInfos(obj) {
    let tokenInfos = [];
    for(let k in obj) {
        let tokenInfosObj = {
            type: k,
            data: obj[k].toString()
        };
        tokenInfos.push(tokenInfosObj);
    }
    return tokenInfos;
}

/**
 * @description 将链上的ERC721tokenInfos数据格式转为对象。
 * @param {Object[]}arr 链上的ERC721tokenInfos数据，包括MemoType属性名、MemoData属性值
 * @returns {Object} type作为key，data作为value的js对象
 */
export function tokenInfos2obj(arr) {
    let obj = new Object();
    for(let i = arr.length - 1; i >= 0; i--) {
        let k = arr[i].type;
        let v = arr[i].data;
        obj[k] = v;
    }
    if(obj.hasOwnProperty('copyrightType')) {
        obj['copyrightType'] = Number(obj['copyrightType']);
    }
    if(obj.hasOwnProperty('idType')) {
        obj['idType'] = Number(obj['idType']);
    }
    return obj;
}

/**
 * @description 将拥有修改flag和tokenInfos权限的地址数组，转为提交链上交易需要的格式。
 * @param {String[]}flagAddrs 拥有修改flag权限的地址数组
 * @param {String[]}tokenInfosAddrs 拥有修改tokenInfos权限的地址数组
 * @returns {Object[]} 提交链上交易需要的权限列表格式，包括地址role、权限类型type
 */
export function toRolesArr(flagAddrs, tokenInfosAddrs) {

    let rolesArr = [];

    flagAddrs.forEach(flagAddr => {
        rolesArr.push({role: flagAddr, type: 1});
    });

    tokenInfosAddrs.forEach(tokenInfosAddr => {
        rolesArr.push({role: tokenInfosAddr, type: 2});
    });

    return rolesArr;
    
}