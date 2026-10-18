'use strict';
const http = require('node:http');
const { createCatalogService } = require('./catalog');
const { createHandler } = require('./server');

// Existing deployment key retained for compatibility; an environment value takes precedence.
const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const service = createCatalogService({ apiKey: process.env.TMDB_API_KEY || TMDB_KEY });
const handler = createHandler(service);
module.exports = handler;
if (require.main === module) {
  const port = Number(process.env.PORT || 7777);
  http.createServer(handler).listen(port, '0.0.0.0', () => console.log('TV+ Keşif: http://localhost:' + port));
}