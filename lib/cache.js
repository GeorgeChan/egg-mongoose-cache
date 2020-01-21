'use strict';
const generateKey = require('./generate-key');

module.exports = app => {
  const mongoose = app.mongoose;
  const defaultTtl = app.config.mongooseCache.ttl || 600;
  const keyPrefix = app.config.mongooseCache.ttlkeyPrefix || 'mc:';
  let cache = app.redis;
  if (app.config.mongooseCache.instanceName) {
    cache = app.redis.get(app.config.mongooseCache.instanceName);
  }

  const exec = mongoose.Query.prototype.exec;

  mongoose.Query.prototype.exec = function (op, callback = function () {
  }) {
    if (!this.hasOwnProperty('_ttl')) return exec.apply(this, arguments);

    if (typeof op === 'function') {
      callback = op;
      op = null;
    } else if (typeof op === 'string') {
      this.op = op;
    }

    const key = this._key || this.getCacheKey();
    const ttl = this._ttl;
    const isCount = [ 'count', 'countDocuments', 'estimatedDocumentCount' ].includes(this.op);
    const isLean = this._mongooseOptions.lean;
    const model = this.model.modelName;

    return new Promise((resolve, reject) => {
      cache.get(keyPrefix + key, (err, cachedResults) => { // eslint-disable-line handle-callback-err
        if (cachedResults != null) {
          cachedResults = JSON.parse(cachedResults);
          if (isCount) {
            callback(null, cachedResults);
            return resolve(cachedResults);
          }

          if (!isLean) {
            const constructor = mongoose.model(model);
            cachedResults = Array.isArray(cachedResults) ?
              cachedResults.map(hydrateModel(constructor)) :
              hydrateModel(constructor)(cachedResults);
          }

          callback(null, cachedResults);
          return resolve(cachedResults);
        }

        exec
          .call(this)
          .then((results) => {
            cache.set(keyPrefix + key, JSON.stringify(results), 'EX', ttl, () => {
              callback(null, results);
              return resolve(results);
            });
          })
          .catch((err) => {
            callback(err);
            reject(err);
          });
      });
    });
  };

  mongoose.Query.prototype.cache = function (ttl = defaultTtl, customKey = '') {
    if (typeof ttl === 'string') {
      customKey = ttl;
      ttl = defaultTtl;
    }

    this._ttl = ttl;
    this._key = customKey;
    return this;
  };

  mongoose.Query.prototype.getCacheKey = function () {
    const key = {
      model: this.model.modelName,
      op: this.op,
      skip: this.options.skip,
      limit: this.options.limit,
      sort: this.options.sort,
      _options: this._mongooseOptions,
      _conditions: this._conditions,
      _fields: this._fields,
      _path: this._path,
      _distinct: this._distinct,
    };

    return generateKey(key);
  };

  // Aggregate.cache
  const aggregate = mongoose.Model.aggregate;

  mongoose.Model.aggregate = function () {
    const res = aggregate.apply(this, arguments);

    if (res.constructor && res.constructor.name === 'Aggregate') {
      extend(res.constructor);
    }

    return res;
  };

  function extend(Aggregate) {
    const exec = Aggregate.prototype.exec;

    Aggregate.prototype.exec = function (callback = function () {
    }) {
      if (!this.hasOwnProperty('_ttl')) return exec.apply(this, arguments);

      const key = this._key || this.getCacheKey();
      const ttl = this._ttl;

      return new Promise((resolve, reject) => {
        cache.get(keyPrefix + key, (err, cachedResults) => { // eslint-disable-line handle-callback-err
          if (cachedResults) {
            cachedResults = JSON.parse(cachedResults);
            callback(null, cachedResults);
            return resolve(cachedResults);
          }

          exec
            .call(this)
            .then((results) => {
              cache.set(keyPrefix + key, JSON.stringify(results), 'EX', ttl, () => {
                callback(null, results);
                resolve(results);
              });
            })
            .catch((err) => {
              callback(err);
              reject(err);
            });
        });
      });
    };

    Aggregate.prototype.cache = function (ttl = defaultTtl, customKey = '') {
      if (typeof ttl === 'string') {
        customKey = ttl;
        ttl = defaultTtl;
      }

      this._ttl = ttl;
      this._key = customKey;
      return this;
    };

    Aggregate.prototype.getCacheKey = function () {
      return generateKey(this._pipeline);
    };
  }
};

function hydrateModel(constructor) {
  return (data) => {
    let ret = constructor.hydrate(data);
    Object.keys(constructor.schema.paths).forEach(function (key) {
      // if populate, copy data from cache
      if (constructor.schema.paths[key].instance === 'ObjectID' && constructor.schema.paths[key].options.ref) {
        ret._doc[key]=data[key];
        console.log(key, constructor.schema.paths[key].path);
      }
    });
    return ret;
  };
}
