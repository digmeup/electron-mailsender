/*
   MIT License http://www.opensource.org/licenses/mit-license.php
   Author Tobias Koppers @sokra
 */
var loaderUtils = require("loader-utils");
var mime = require("mime");
module.exports = function(content) {
	this.cacheable && this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	//console.log('query:',query);
	var limit = (this.options && this.options.url && this.options.url.dataUrlLimit) || 0;
	if(query.limit) {
		limit = parseInt(query.limit, 10);
	}
	var mimetype = query.mimetype || query.minetype || mime.lookup(this.resourcePath);
	if(limit <= 0 || content.length < limit) {
		return "module.exports = " + JSON.stringify("data:" + (mimetype ? mimetype + ";" : "") + "base64," + content.toString("base64"));
	} else {//emit to File

		this.cacheable && this.cacheable();
		if(!this.emitFile) throw new Error("emitFile is required from module system");
		var url = loaderUtils.interpolateName(this, query.name || "[hash].[ext]", {
			context: query.context || this.options.context,
			content: content,
			regExp: query.regExp
		});
		this.emitFile(url, content);
		if(query.cache_flag){
			var str = content.toString("binary");
			var crypto = require("crypto");
			var t = crypto.createHash("md5").update(str).digest("hex");
			url = url + '?c=' + t;
		}
		var ret = "module.exports = __webpack_public_path__ + " + JSON.stringify(url) + ";";
		//console.log("file-loader result:", ret);
		return ret;
	}
}
module.exports.raw = true;
