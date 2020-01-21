'use strict';

/**
 * egg-mongoose-cache default config
 * @member Config#mongooseCache
 * @property {String} instanceName - egg-redis's instance name, if used
 * @property {String} ttl - egg-redis's defalut ttl time, default: 600
 * @property {String} keyPrefix - egg-redis's key of prefix, default: "mc:"
 */
exports.mongooseCache = {
  instanceName: 'cache',
  ttl: 600,
  keyPrefix: 'mc:',
};
