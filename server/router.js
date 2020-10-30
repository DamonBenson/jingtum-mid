const url = require('url');

exports.register = function(request, response, mapping) {
  // 解析请求路径
  var pathName = url.parse(request.url).pathname;
  // 执行相应请求路径的回调函数
  for(let i = 0, len = mapping.length;i < len;i++) {
    if(mapping[i].url === pathName) {
      mapping[i].handler(request, response);
      return;
    }
  }
  // 请求路径不存在返回404页面
  response.writeHeader(404, {
    "Content-Type" : "text/html"
  });
  response.end(`
    <html>
      <head>
        <title>NOT FOUND</title>
      </head>
      <body>
        <h1>404 NOT FOUND</h1>
      </body>
    </html>
  `);
}