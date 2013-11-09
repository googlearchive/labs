
/*
 * GET home page.
 */

 var fs = require('fs');
 var path = require('path');
 var exec = require('exec-sync');

 var root = process.argv.splice(2)[0];
 if (!root) {
 	throw 'Usage: node app.js <path-to-directory>';
 }
 root = path.resolve(root);

exports.index = function(req, res){
	fs.readdir(root, function(err, files) {
		var repos = [];
		files.forEach(function(f) {
			try {
				var path = root + '/' + f;
				var gitcmd = 'git --git-dir=' + path + '/.git --work-tree=' + path + ' ';
				var status = exec(gitcmd + 'status');
				var ab = exec(gitcmd + 'rev-list --left-right --count origin/master...HEAD');
				repos.push({
					name: f,
					clean: status.indexOf('nothing to commit') !== -1,
					untracked: status.indexOf('Untracked files') !== -1,
					status: status,
					behind: ab.split('	')[0],
					ahead: ab.split('	')[1],
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