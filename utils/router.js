import url from 'url';

export function register(request, response, mapping) {
    // 解析请求路径
    var pathName = url.parse(request.url).pathname;
    // 执行相应请求路径的回调函数
    for(let i = 0, len = mapping.length; i < len; i++) {
        if(mapping[i].url === pathName) {
            mapping[i].handler(request, response);
            return;
        }
    }
    // 请求路径不存在返回404页面
    response.writeHeader(404, {
        "Content-Type" : "text/plain"
    });
    response.end('invalid url');
}