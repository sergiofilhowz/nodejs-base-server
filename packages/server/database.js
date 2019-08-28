const Sequelize = require('sequelize');
const SequelizeMigration = require('sequelize-migration-2');
const TransactionManager = require('sequelize-transaction-manager');
const config = require('./config');

class Database {
  constructor() {
    const DB_NAME = config.get('DB_NAME');
    const DB_USERNAME = config.get('DB_USERNAME');
    const DB_PASSWORD = config.get('DB_PASSWORD');

    this.models = {};
    this.handlers = [];

    this.sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
      host: config.get('DB_HOST'),
      port: config.get('DB_PORT'),
      logging: config.getBoolean('VERBOSE') && console.log,

      maxConcurrentQueries: config.get('DB_MAX_CONCURRENT_QUERIES'),

      dialect: config.get('DB_DIALECT'),

      dialectOptions: {
        socketPath: config.get('DB_SOCKET_PATH'),
        supportBigNumbers: true,
        bigNumberStrings: true,
        multipleStatements: config.getBoolean('SYNC')
      },

      define: {
        underscored: true,
        freezeTableName: false,
        syncOnAssociation: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true,
        constraints: false,

        updatedAt: 'updated_at',
        createdAt: 'created_at',
        deletedAt: 'removed_at',

        paranoid: false
      },

      sync: { force: false },
      syncOnAssociation: true,

      pool: {
        max: config.get('DB_POOL_MAX_CONNECTIONS'),
        min: config.get('DB_POOL_MIN_CONNECTIONS'),
        idle: config.get('DB_POOL_MAX_IDLE_TIME')
      },
      language: 'en'
    });
    this.transaction = new TransactionManager(this.sequelize);
  }

  loadMigrations(migrationConfig) {
    this.migration = new SequelizeMigration(this.sequelize);
    this.migration.addModule(migrationConfig);
  }

  async sync() {
    await this.migration.sync();
    for (let handler of this.handlers) {
      await handler();
    }
  }

  onSync(handler) {
    this.handlers.push(handler);
  }
}

module.exports = new Database();
