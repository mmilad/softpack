
var fs = require("fs"),
	path = require("path"),
	anymatch = require('anymatch');

function walk(dir, ignore) {
	var arr = [];
	var files = fs.readdirSync(dir);

		files.forEach(function (file) {
			var filepath = path.join(dir, file);
			var stats = fs.statSync(filepath);
			if(ignore && anymatch(ignore, filepath)) {
				return
			}
			if (stats.isDirectory()) {
				arr = arr.concat(walk(filepath, ignore));
			} else if (stats.isFile()) {
				arr.push(filepath);
			}
		});
	return arr
}

module.exports = walk;