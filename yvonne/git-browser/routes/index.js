
/*
 * GET home page.
 */

 var fs = require('fs');
 var exec = require('exec-sync');

 var root = '/Users/ykyyip/Source/polymer-old';

exports.index = function(req, res){
	fs.readdir(root, function(err, files) {
		var repos = [];
		files.forEach(function(f) {
			try {
				var path = root + '/' + f;
				var status = exec('git --git-dir=' + path + '/.git --work-tree=' + path + ' status');
				repos.push({
					name: f,
					clean: status.indexOf('nothing to commit') !== -1,
					untracked: status.indexOf('Untracked files') !== -1,
					status: status
				});
			} catch (e) {}
		});
		fs.readFile(__dirname + '/../views/index.html', 'utf8', function(err, str) {
			str = str.replace('##ROOT##', JSON.stringify(root))
					.replace('##REPOS##', JSON.stringify(repos));
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', str.length);
			res.end(str);
		});
	});
};