var port = 8888;
var project_dir = __dirname + '/../';
var root_dir = __dirname + '/../../../../';

var express = require('express');

var app = express();
app.use(express.bodyParser());

app.get('/', function(req, res) {
	res.sendfile('index.html', {root: project_dir});
});

app.get('/components/*', function(req, res) {
	res.sendfile(req.params[0], {root: project_dir + 'components/'});
});

app.get('/polymer/*', function(req, res) {
	res.sendfile(req.params[0], {root: root_dir});
});

app.get('/polymer-elements/*', function(req, res) {
	res.sendfile(req.params[0], {root: root_dir + 'polymer-elements/'});
});

app.get('/polymer-ui-elements/*', function(req, res) {
	res.sendfile(req.params[0], {root: root_dir + 'polymer-ui-elements/'});
});

app.listen(port);
console.log('Listening on port ' + port);
