const path = require('path')
const xoly = require('./xoly')

const filepath = process.argv[2]


var X = xoly.parseFile(filepath)

console.log(X)

var Y = xoly.renderFile(filepath, {})

console.log(Y)
