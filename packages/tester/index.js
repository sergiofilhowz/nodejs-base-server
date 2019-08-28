const chai = require('chai');
const chaiHttp = require('chai-http');
const forEach = require('lodash/forEach');

chai.use(chaiHttp);
chai.should();

class Http {
  constructor(httpServer, optionsDecorator) {
    this.server = httpServer;
    this.optionsDecorator = optionsDecorator;

    this.as = (decorator) => new Http(this.server, decorator);

    this.put = (path, body, options) => {
      let result = this.request().put(path);
      if (body) {
        result.send(body);
      }
      return this.handleRequest(result, options);
    };

    this.post = (path, body, options) => {
      let result = this.request().post(path);
      if (body) {
        result.send(body);
      }
      return this.handleRequest(result, options);
    };

    this.get = (path, options) => this.handleRequest(this.request().get(path), options);
    this.delete = (path, options) => this.handleRequest(this.request().delete(path), options);
    this.request = () => chai.request(this.server);

    this.handleOptions = async (result, options = {}) => {
      const resultOptions = await this.decorateOptions(options);
      if (resultOptions.headers) {
        forEach(resultOptions.headers, (value, key) => result.set(key, value));
      }
      if (resultOptions.query) {
        result.query(resultOptions.query);
      }
    };

    this.handleRequest = async (result, options) => {
      await this.handleOptions(result, options);
      return new Promise(resolve => result.end((err, res) => resolve(res)));
    };
  }

  decorateOptions(options) {
    return this.optionsDecorator ? this.optionsDecorator(options) : options;
  }
}

class TestHelper {
  constructor(server, config) {
    this.database = server.database;
    this.config = config;
    this.http = new Http(server.server);
    this.expect = chai.expect;

    this.sync = async () => {
      const sequelize = this.database.sequelize;
      await sequelize.getQueryInterface().dropAllTables({ force: true });
      return this.database.sync();
    };

    this.log = msg => console.log(`📎️ ${msg}`);
    this.fatal = msg => {
      console.log(`💣 ${msg}`);
      throw new Error(msg);
    };
  }
}

module.exports = TestHelper;
