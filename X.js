const fs = require('fs')
const util = require('util')
const P5 = require('parse5')

var commands = {
		cfabort: require('./lib/cfabort'),
		cfbreak: require('./lib/cfbreak'),
		cfdump: require('./lib/cfdump'),
		cfif: require('./lib/cfif'),
		cfinclude: require('./lib/cfinclude'),
		cfloop: require('./lib/cfloop'),
		cfoutput: require('./lib/cfoutput'),
		cfparam: require('./lib/cfparam'),
		cfsavecontent: require('./lib/cfsavecontent'),
		cfset: require('./lib/cfset'),
		cfswitch: require('./lib/cfswitch')
	}
var cache = {}
var tags = {}
var attr = {}

var RETagOrPound = /[<#]/
var RESpaceOrGT = /[\s>]/
var REComment = /(<!---|--->)/g
var REQuoteOrGT = /['">]/
var REAttribNameDelim = /[\s=>]/
var REAttribs = /([a-z][a-z0-9_])\s*=\s*(["'])(.*?)([^\2]|\2\2)\2/gi
var RESpace = /\s/


exports.parseFile = (filepath)=>{
	fs.readFile(filepath, 'utf8', (err, text)=>{
		if (err) throw err

		var buffer = []

		var line = 1

		process(text, buffer, evaluate, line)

		console.log(text)
		console.log(P5.parse(text))
	})
}

process = (text, buffer, evaluate, line)=>{
	var pos = evaluate ? text.search(RETagOrPound) : text.indexOf('<')	// skip to next interesting position

	if (pos === -1) {
		buffer.push(text)

		return
	}
}