'use strict';

module.exports = {
  apps: [
    {
      name: 'azurite',
      script: 'node_modules/azurite/dist/src/blob/main.js',

      // Latest dependency bump makes everything cry with an error
      // such as 'x-ms-encryption-algorithm header or parameter is not supported
      // in Azurite strict mode. Switch to loose model by Azurite command line
      // parameter "--loose" or Visual Studio Code configuration "Loose"'
      args: '-l ./azurite-logs -d ./azurite-logs/debug.log'
    }
  ]
};
