const log4js = require('log4js')
const {formatError, formatRes} = require('./formatLog')
const log2db = require('./log2db')

log4js.configure({
    appenders: {
        error: {
            type: 'dateFile',
            category: 'errLogger',
            filename: __dirname + '/../logs/errors/',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            maxLogSize: 104800,
            backups: 100
        },
        response: {
            type: 'dateFile',
            category: 'resLogger',
            filename: __dirname + '/../logs/responses/',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            maxLogSize: 104800,
            backups: 100
        }
    },
    categories: {
        error: {appenders: ['error'], level: 'error'},
        response: {appenders: ['response'], level: 'info'},
        default: {
            appenders: ['response'],
            level: 'info'
        }
    },
    replaceConsole: false
})

let logger = {}

let errorLogger = log4js.getLogger('error')
let resLogger = log4js.getLogger('response')

// 封装错误日志
logger.errLogger = (ctx, error, resTime) => {
    if(ctx && error) {
        log2db('ErrorRequest', 'error', formatError(ctx, error, resTime))
        errorLogger.error(formatError(ctx, error, resTime))
    }
}

// 封装相应日志
logger.resLogger = (ctx, resTime) => {
    if(ctx) {
        log2db('RequestInfo', 'info', formatRes(ctx, resTime))
        resLogger.info(formatRes(ctx, resTime))
    }
}

module.exports = logger