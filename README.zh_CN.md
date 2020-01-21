# egg-mongoose-cache

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongoose-cache.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongoose-cache

egg-mongoose-cache 插件可通过简单的 cache() 命令，扩展 egg-mongoose 支持 redis 缓存。

注： egg-mongoose-cache 改写自 [cachegoose](https://github.com/boblauer/cachegoose)，并增加对 populate 的支持。

[English](https://github.com/GeorgeChan/egg-mongoose-cache)
## 安装说明

```bash
$ npm i egg-mongoose-cache --save
```

## 依赖说明

### 依赖的 egg 版本

egg-mongoose-cache 版本 | egg 2.x | egg-mongoose 3.2.x
--- | --- | ---
1.x | 😁 | 😁
0.x | ❌ | ❌

### 依赖的插件

- [egg-mongoose](https://github.com/eggjs/egg-mongoose) ^3.2.0
- [egg-redis](https://github.com/eggjs/egg-redis) ^2.4.0


## 开启插件

```js
// config/plugin.js
exports.mongooseCache = {
  enable: true,
  package: 'egg-mongoose-cache',
};
```

## 使用场景

- 通过 egg-mongoose-cache 可以简单听过 cache(ttl,key)完成 find、findOne、aggregate 等多种查询的缓存操作。

例子1, 对查询结果缓存60秒：
```javascript
let data = await ctx.model.user.findOne({ 'username': 'user1' }).populate('userinfo').cache(60);
````

例子2, 对查询结果缓存, 默认600秒：
```javascript
let data = await ctx.model.user.find({}).limit(10).skip(5).cache();
````

例子2, 对查询结果缓存, 60秒、并自定义key：
```javascript
let data = await ctx.model.user.aggregate(myPipelines).cache(60,'myKey');
````


## 详细配置

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。

* instanceName： 若存在 egg-redis 多实例配置，设置使用的实例名
* ttl: 全局默认过期时间，单位(秒)，默认为: 600
* keyPrefix： redis key 的全局前缀，默认为: "mc:"

当 egg-redis 使用简单配置时：
```javascript
exports.mongooseCache = {
  ttl: 600,
  keyPrefix: 'mc:',
}
```

当 egg-redis 使用多实例配置时, 需指定实例名：
```javascript
exports.mongooseCache = {
  instanceName: 'cache',
  ttl: 300,
  keyPrefix: 'mc:',
}
```

## 提问交流

请到 [egg-mongoose-cache issues](https://github.com/GeorgeChan/egg-mongoose-cache/issues) 异步交流。

## License

[MIT](LICENSE)
