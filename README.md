# egg-mongoose-cache

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongoose-cache.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongoose-cache

Egg's cache plugin based on egg-mongoose and egg-redis for egg framwork

* egg-mongoose-cache plugin rewrite from [cachegoose](https://github.com/boblauer/cachegoose), increase support for populate.

[中文版](https://github.com/GeorgeChan/egg-mongoose-cache/blob/master/README.zh_CN.md)
## Install

```bash
$ npm i egg-mongoose-cache --save
```

## Dependencies

### egg version

egg-mongoose-cache ver | egg 2.x | egg-mongoose 3.2.x
--- | --- | ---
1.x | 😁 | 😁
0.x | ❌ | ❌

### Dependencies plugins

- [egg-mongoose](https://github.com/eggjs/egg-mongoose) ^3.2.0
- [egg-redis](https://github.com/eggjs/egg-redis) ^2.4.0


## Usage

```js
// {app_root}/config/plugin.js
exports.mongooseCache = {
  enable: true,
  package: 'egg-mongoose-cache',
};
```

## Configuration

see [config/config.default.js](config/config.default.js) for more detail.

* instanceName： when use egg-redis Multi Clients, set the redis instance name
* ttl: global default expiration time(second), default: 600
* keyPrefix： redis Prefix key, defalut: "mc:"

egg-redis Single Client:
```javascript
exports.mongooseCache = {
  ttl: 600,
  keyPrefix: 'mc:',
}
```

egg-redis Multi Clients:
```javascript
exports.mongooseCache = {
  instanceName: 'cache',
  ttl: 300,
  keyPrefix: 'mc:',
}
```

## Example

In controller or service, you can use find/findOne/aggregate to cache data to redis.

Use FindOne/populate, cache 60 second:
```javascript
let data = await ctx.model.user.findOne({ 'username': 'user1' }).populate('userinfo').cache(60);
````

Use Find, cache 600 second:
```javascript
let data = await ctx.model.user.find({}).limit(10).skip(5).cache();
````

Use Aggregate, cache 60 second and user custom key:
```javascript
let data = await ctx.model.user.aggregate(myPipelines).cache(60,'myKey');
````


## Questions & Suggestions

Please open an issue [egg-mongoose-cache issues](https://github.com/GeorgeChan/egg-mongoose-cache/issues).

## License

[MIT](LICENSE)
