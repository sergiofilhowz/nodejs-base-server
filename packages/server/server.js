const express = require('express');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const cors = require('cors');
const powerRouter = require('./power.router');
const config = require('./config');
const database = require('./database');
const healthcheck = require('healthcheck-middleware');

class Server {
  constructor({ migration }) {
    this.app = express();
    this.server = createServer(this.app);

    this.app.use(bodyParser.json({ limit: '20mb' }));
    this.app.use(cors({ allowedHeaders: ['Content-Type', 'Authorization'] }));
    this.app.use('/healthcheck', healthcheck());
    this.app.use('/', powerRouter);

    this.database = database;

    database.loadMigrations(migration);
  }

  sync() {
    return config.get('SYNC') && this.database.sync()
  }

  async start() {
    await this.sync();
    const port = config.get('PORT') || 8080;
    this.server.listen(port, () => console.log(`Server started at port ${port}`));
  };
}

module.exports = Server;
