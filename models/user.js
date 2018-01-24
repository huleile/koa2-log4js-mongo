let mongoose = require('./db')
let Schema = mongoose.Schema

let user = new Schema({
    name: {type: String},
    pass: {type: String},
    age: {type: Number},
    birth: {type: Date}
}, {
    versionKey: false
})

module.exports = mongoose.model('users', user)