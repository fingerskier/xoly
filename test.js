P5 = require('parse5')
fs = require('fs')

asdf = fs.readFileSync('./test/test.x','utf8')

O = P5.parse(asdf)

console.log(O)
