let mongoose = require('./db')
let Schema = mongoose.Schema

let log = new Schema({
    level: {type: String},
    message: {type: String},
    info: {
        method: String,
        url: String,
        costTime: Number,
        body: String,
        response: {
            status: Number,
            message: String,
            header: String,
            body: String
        }
    }
}, {
    versionKey: false
})

module.exports = mongoose.model('logs', log)