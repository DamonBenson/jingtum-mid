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

/*----------补全数字长度----------*/

export function formatStr(num, len) {
    if(String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
}

/*----------暂停----------*/

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*----------16进制ascii码转字符串----------*/

export function ascii2str(ascii) {
    let str = '';
    for(let i = ascii.length/2; i > 0; i--) {
        str = String.fromCharCode(hex2int(ascii.substring(2 * i - 2, 2 * i))) + str;
    }
    return str;
}

/*----------16进制字符转10进制数字----------*/

export function hex2int(hex) {
    let len = hex.length, a = new Array(len), code;
    for(let i = 0; i < len; i++) {
        code = hex.charCodeAt(i);
        if(48 <= code && code < 58) {
            code -= 48;
        } 
        else {
            code = (code & 0xdf) - 65 + 10;
        }
        a[i] = code;
    }
    return a.reduce(function(acc, c) {
        acc = 16 * acc + c;
        return acc;
    }, 0);
}

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
        let k = ascii2str(arr[i].Memo.MemoType);
        let v = ascii2str(arr[i].Memo.MemoData);
        obj[k] = v;
    }
    obj['right'] = Number(obj['right']);
    obj['state'] = Number(obj['state']);
    return obj;
}