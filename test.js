const xoly = require('./xoly')

const filepath = process.argv[2]


console.log(xoly.parseFile(filepath))
