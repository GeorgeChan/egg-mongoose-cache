'use strict';

module.exports = app => {
  if (app.config.mongoose && app.config.redis && app.config.mongooseCache) require('./lib/cache')(app);
};
