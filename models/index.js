let fs = require('fs')
let path = require('path')
let mongoose = require('./db')
let _ = require('lodash')

const db = {mongoose}

fs.readdirSync(__dirname)
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'db.js'))
.forEach( file => {
    const model = require(`${__dirname}/${file}`)
    const basename = path.basename(file, '.js')
    db[_.capitalize(basename)] = model
})

module.exports = db