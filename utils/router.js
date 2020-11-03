const url = require('url');

exports.register = function(request, response, mapping) {
  var pathName = url.parse(request.url).pathname;
  for(let i = 0, len = mapping.length;i < len;i++) {
    if(mapping[i].url === pathName) {
      mapping[i].handler(request, response);
      return;
    }
  }
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