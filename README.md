# koa2-log4js-mongo
Koa2框架搭配 Log4js 将日志持久化到 MongoDB中方便管理

&emsp;之前做的项目是采用 Express 框架进行搭建的，其中的日志管理采用了 winston + Postgresql + sequelize的形式, 最近倒弄 Koa2 框架，于是就想着尝试采用另一种方式进行访问日志的管理，就想到了 log4js。关于 log4js 的介绍在这里就不多叙述了，想了解请点击&emsp;     [log4js详细介绍](https://www.npmjs.com/package/log4js)

&emsp;说到数据持久化，最普遍的无非就两种方式:
- 文件存储
- 数据库存储

&emsp;本文将以log4js为主线，分别对这两种形式进行实现。

#### 持久化至文件
&emsp;log4js 输入日志到文件有两种形式:
- file          输出到文件, 指定单一文件名称, 例如: default.log
- dateFile      输出到文件，文件可以按日期模式滚动，例如: default-2017-02-03.log

直接上代码:
```
// log4js.js
const log4js = require('log4js')
log4js.configure({
    appenders: {
        error: {
            type: 'file',           //日志类型
            category: 'errLogger',    //日志名称
            filename: __dirname + '/../logs/error.log/', //日志输出位置，当目录文件或文件夹不存在时自动创建
            maxLogSize: 104800, // 文件最大存储空间
            backups: 100  //当文件内容超过文件存储空间时，备份文件的数量
        },
        response: {
            type: 'dateFile',
            category: 'resLogger',
            filename: __dirname + '/../logs/responses/',
            pattern: 'yyyy-MM-dd.log', //日志输出模式
            alwaysIncludePattern: true,
            maxLogSize: 104800,
            backups: 100
        }
    },
    categories: {
        error: {appenders: ['error'], level: 'error'},
        response: {appenders: ['response'], level: 'info'},
        default: { appenders: ['response'], level: 'info'}
    },
    replaceConsole: true
})
```
日志配置文件我们已经完成，在这里定义了两种形式的日志，分别是 errLogger 错误日志, resLogger 响应日志。
接下来我们将这两种日志进行自定义格式化输出:

```
// log4js.js
const {formatError, formatRes} = require('./formatLog')
let logger = {}

let errorLogger = log4js.getLogger('error')
let resLogger = log4js.getLogger('response')

// 封装错误日志
logger.errLogger = (ctx, error, resTime) => {
    if(ctx && error) {
        errorLogger.error(formatError(ctx, error, resTime))
    }
}

// 封装响应日志
logger.resLogger = (ctx, resTime) => {
    if(ctx) {
        resLogger.info(formatRes(ctx, resTime))
    }
}
```

```
// formatLog.js
let formatError = (ctx, err,costTime) => {
    let method = ctx.method
    let url = ctx.url
    let body = ctx.request.body
    let userAgent = ctx.header.userAgent
    return {method, url, body, costTime, err}
}

let formatRes = (ctx,costTime) => {
    let method = ctx.method
    let url = ctx.url
    let body = ctx.request.body
    let response = ctx.response
    return {method, url, body, costTime, response}
}

module.exports = {formatError, formatRes}
```
在我们的应用中使用我们自定义的日志模型
```
//app.js
const log4js = require('./utils/log4js')

// logger
app.use(async(ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    log4js.resLogger(ctx, ms)
})

app.on('error', (err, ctx) => {
    log4js.errLogger(ctx, err)
    console.error('server error', err, ctx)
});
```
此时我们的访问信息都已被输出到了项目 logs 文件夹下面。

#### 持久化到 MongoDB
我们采用 Mongoose 驱动进行与 MongoDB 数据库进行交互。关于 Mongoose 的使用请查看 [Mongoose使用详情](http://www.nodeclass.com/api/mongoose.html)

首先我们先定义一个存放日志的数据模型 Log，如下:
```
//log.js
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
```
日志内容存储到数据库中，实现如下log2db.js
```
//log2db.js
const {Log} = require('../models')

let log2db = (msg, level, info) => {
    let log = {
        level: level || 'info',
        message: msg,
        info: {
            method: info.method,
            url: info.url,
            costTime: info.costTime,
            body: JSON.stringify(info.body),
            response: {
                status: info.response.status,
                message: info.response.message,
                header: JSON.stringify(info.response.header),
                body: JSON.stringify(info.response.body)
            }
        }
    }
    Log.create(log, (err, res) => {
        if(err) {console.log(err)}
    })
}

module.exports = log2db
```
修改我们上边封装的两种日志类型，添加 log2db 如下:
```
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
```
OK, 我们重启服务器，进行访问，然后通过 RoboMongo 进行查看我们的 Log 集合，就会发现我们的访问信息都已经记录了下来。

![koa2-mongo-logs](http://p2zt80dkp.bkt.clouddn.com/koa-mongo-logs.png)

