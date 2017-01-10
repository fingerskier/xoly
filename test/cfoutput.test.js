/* globals require, describe, it */
// jshint devel:true, curly: false, asi:true

var expect = require('expect.js')
var xoly = require('../xoly')

describe('The CFOUTPUT tag', function() {

	it('should replace variables in pound signs', function(){
		var str = 'hello <cfoutput>#test#</cfoutput>'
		var vars = {test:'world'}
		var result = xoly.renderString(str, vars)
		expect(result).to.be('hello world')
	})
	it('pound signs outside cfoutput should not be replaced', function(){
		var str = '#test# <cfoutput>#test2#</cfoutput>'
		var vars = {test2:'world'}
		var result = xoly.renderString(str, vars)
		expect(result).to.be('#test# world')
	})

})
