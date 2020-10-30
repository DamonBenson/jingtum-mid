import http from 'http';
import router from './router.js';

function handleHello(request, response) {
  // 设置响应头
  response.writeHeader(200, {
    "Content-Type" : "text/plain"
  });
  // 响应主体为 "Hello world!"
  response.write("Hello world!");
  response.end();
}

http.createServer(function(request, response) {
  // 注册路径和其对应回调函数
  router.register(request, response, [
    {
      'url': '/hello',
      'handler': handleHello
    }
  ]);
})
// 设置监听端口为9000
.listen(9000);