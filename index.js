const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const config = require('./config.json');
const routes = require('./routes');
const cmd = require('./helpers/runCommand');
const helpers = require('./helpers/helpers');
const s3 = require('./helpers/s3');
const fs = require('fs');

const init = async () => {
  const serverConfig = {
    port: config.port,
    host: config.host,
    routes: {
      cors: {
        origin: ['*'],
        additionalExposedHeaders: ['x-bearer-token'],
        additionalHeaders: ['x-requested-with'],
      },
    },
  };

  const server = Hapi.server(serverConfig);
  server.validator(Joi);

  await server.start();
  console.log('Server running on %s', server.info.uri);

  // Inject dependencies to all routes
  routes({
    server,
    Joi,
    Boom,
    config,
    fs,
    cmd,
    helpers,
    s3,
  });
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();