export default class LocalUtils {

    /*----------生成随机len位字符串----------*/

    randomString(len) {
        const length = len;
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    /*----------补全数字长度----------*/

    formatStr(num, len) {
        if(String(num).length > len) return num;
        return (Array(len).join(0) + num).slice(-len);
    }

    /*----------暂停----------*/

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /*----------16进制ascii码转字符串----------*/

    ascii2str(ascii) {
        let str = '';
        for(let i = ascii.length/2; i > 0; i--) {
            str = String.fromCharCode(this.hex2int(ascii.substring(2 * i - 2, 2 * i))) + str;
        }
        return str;
    }
    
    /*----------16进制字符转10进制数字----------*/

    hex2int(hex) {
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

}