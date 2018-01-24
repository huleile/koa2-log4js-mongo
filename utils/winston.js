let winston = require('winston')
let {inherits} = require('util')
let {join} = require('path')
const log2db = require('./log2db')

let MongoLog = winston.transports.MongoLog = (options) => {
    this.name = 'MongoLog'
    this.level = options || 'info'
}

inherits(MongoLog, winston.Transport)

MongoLog.prototype.log = (level, msg, meta, callback) => {
    log2db(msg, level, meta, (err, log) => {
        callback(null, true)
    })
}

let logger = new(winston.Logger)({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        }),
        new(winston.transports.MongoLog)({
            level: 'info'
        })
    ],
    exitOnError: false
})

winston.loggers.add('responseLog', {
    file: {
        filename: join(__dirname, '/../logs/', 'response.log'),
        maxsize: 5000000
    }
})

logger.emitErrs = false

logger.responseLogger = winston.loggers.get('responseLog')

module.exports = logger