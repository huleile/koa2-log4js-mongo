const router = require('koa-router')()
const readdirSync = require('fs').readdirSync
const {join, basename} = require('path')

const bname = basename(module.filename)

readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== bname)
  .forEach(file => {
    const subRouter = require(join(__dirname, file))
    const prefix = `/${basename(file, '.js')}`
    router.use(prefix, subRouter.routes(), subRouter.allowedMethods())
  })


