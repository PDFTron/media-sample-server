const fs = require('fs');
const package = require('../package.json');

const basePath = './routes';

const walkDir = (options, currentPath) => {
  /*
    Recursively add routes
  */
  fs.readdirSync(currentPath).forEach((file) => {
    const path = `${currentPath}/${file}`;
    const isDir = fs.statSync(path).isDirectory();
    if (isDir) {
      walkDir(options, path);
    } else if(file.endsWith('.js') && path !== `./routes/index.js`) {
      const relativePath = `./${path.split('/').slice(2).join('/')}`;
      require(relativePath)(options);
    }
  });
};

module.exports = (options) =>  {
  options.server.route({
    method: 'GET',
    path:'/',
    handler: () => package.version,
    config:{
    },
  });

  walkDir(options, basePath);
};