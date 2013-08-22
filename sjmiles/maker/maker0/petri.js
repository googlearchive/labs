var fs = require('fs');
var express = require('express');
var app = express();

/*
app.get('*', function(req, res){
  var body = 'Hello World';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});
*/

app.use(express.bodyParser());
app.post('/file/*', function(req, res) {
  console.log('POST');
  console.log(req.body.html);
  fs.writeFile('project/index.html', req.body.html, function(err) {
    res.end();
  });
});

//app.use('/media', express.static(__dirname + '/media'));
app.use('/polymer', express.static(__dirname + '../../../../../'));
app.use('/project', express.static(__dirname + '/project'));
app.use('/', express.static(__dirname + '/public'));

app.listen(3000);
console.log('Listening on port 3000');