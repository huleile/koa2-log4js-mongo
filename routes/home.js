const router = require('koa-router')()
let formatDate = require('../utils/formatDate')
let {User} = require('../models')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  let user = await User.find({name: 'ZJ'})
  ctx.body = user
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})
// 创建一条数据
router.post('/', async (ctx, next) => {
  let body = ctx.request.body;
  let {name, pass, age = 18} = body;
  let user = new User({
    name,
    pass,
    age,
    birth: new Date()
  })
  let u = await user.save();
  /**
   * 
      {
        "name": "xiaou",
        "pass": "oub",
        "age": 21,
        "birth": "2018-01-17T03:02:57.933Z",
        "_id": "5a5ebce116acd85e5e0f153b"
      }
   */
  ctx.body = u
})


// 查找所有符合条件
router.get('/find', async (ctx, next) => {
  let {name} = ctx.query;
  let user = await User.find()
  let u = await User.find({name: {$regex : new RegExp(name)}}, {_id: 0})
  // 此处若是不想返回_id 则{_id: 0}是必须填写的, _id默认是要返回的
  await ctx.render('index', {user, title: 'Mongo Test', formatDate})
  // ctx.body = {user, u}
})

// 更新所有符合条件的
router.get('/update', async (ctx, next) => {
  let {name, pass = 'qwer'} = ctx.query
  let u = await User.update({name: {$regex: new RegExp(name)}}, {pass})
  /**
   * 
      {
        "ok": 1,           是否成功
        "nModified": 0,    未修改数
        "n": 1             影响的行数
      }
   */
  ctx.body = u
})

// 通过 ID 查找并更新
router.get('/findByIdAndUpdate/:uid', async (ctx, next) => {
  let {uid} = ctx.params;
  let u = await User.findByIdAndUpdate(uid, {pass: '123456'});
  /**
   * 
      {
        "_id": "5a5eba9816acd85e5e0f153a",
        "age": 18,
        "birth": "2018-01-17T02:53:12.743Z"
      }
   */
  ctx.body = u
})
module.exports = router
