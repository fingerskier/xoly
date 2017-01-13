/* globals require, exports */
// jshint devel:true, curly: false, asi:true, -W084, -W085, -W061

var utils = require('../utils')

exports.hasBody = true
exports.tagMatch = /<[\/]?cfdump[^>]*>/gi
exports.afterBegin = function(tag, str, buf){
	tag.evalVars = true
}
exports.afterEnd = function(tag, str, buf){
	tag.parsedBody.forEach(function(instr){
		buf.push(instr)
	})
	tag.evalVars = false
}
