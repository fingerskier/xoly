/* globals require, exports 
	<cfswitch expression="...">
		<cfcase>
			...
		</cfcase>

		<cfdefault>
			...
		</cfdefault>
	</cfswitch>
*/
var utils = require('../utils')

exports.hasBody = true
exports.tagMatch = /<[\/]?cfloop[^>]*>/gi
exports.render = function(tag, vars, renderFn){
	var out = ''

	if (tag.attributes.expression != 'undefined') {
		console.log()

		out += renderFn(tag.parsedBody, vars)

	}

	return out
}
