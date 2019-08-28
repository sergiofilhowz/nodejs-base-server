# Server Commons
This project is used to create a new NodeJS Express server with use of ECMA6 Decorators, Configuration and Sequelize.

## Environment Variables

>- `DB_NAME`: The database name
>- `DB_USERNAME`: The database user
>- `DB_PASSWORD`: The database password
>- `DB_HOST`: The database address
>- `DB_PORT`: The database port
>- `VERBOSE`: `true` if you want to log SQL Statements
>- `DB_DIALECT`: Can be `mysql`, `postgres`, `mariadb`
>- `DB_SOCKET_PATH`: If you want to use socket path
>- `SYNC`: True to auto generate the database
>- `DB_MAX_CONCURRENT_QUERIES`: Max concurrent queries
>- `DB_POOL_MAX_CONNECTIONS`: Max connections to keep on pool
>- `DB_POOL_MIN_CONNECTIONS`: Min connections to keep on pool
>- `DB_POOL_MAX_IDLE_TIME`: Max connections idle

## How to use it
To use this project you need to pull the following project with the kickstart of a server

### Models
In Domain Driven Development, we can also call it Repository. How to use it.

### Routers
These are the Resources, the REST API. For example this:

```javascript
import { RestController, GET, POST, PUT, DELETE } from 'base-server/router';
import { NotFoundError } from 'base-server/errors';
import AddressService from '../services/AddressService';
import AddressModel from '../models/AddressModel';

@RestController('/address')
export default class AddressRouter {

  @GET('/:uuid')
  async findAddress({ params }) {
    const address = await AddressModel.find(params.uuid);
    if (!address) throw new NotFoundError('Address not Found');
    return address;
  }

  @POST('/')
  async createAddress({ body }) {
    const address = await AddressService.create(body);
    return AddressModel.find(address.uuid);
  }

  @PUT('/:uuid')
  async updateAddress({ params, body }) {
    await AddressService.update(params.uuid, body);
  }

  @DELETE('/:uuid')
  async deleteAddress({ params }) {
    await AddressService.deleteAddress(params.uuid);
  }

}
```

### Sequelize
They are the Entities, the objects that are persisted on the database

```javascript
import { DataTypes } from 'sequelize';
import State from './State';

const { BIGINT, STRING } = DataTypes;

const City = sequelize.define('City', {
  id: { type: BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: STRING(256), allowNull: false },
}, {
  timestamps: false,
  tableName: 'city'
});

City.belongsTo(State, {
  as: 'State',
  foreignKey: 'state_id'
});

export default City;
```

### Services
They have to keep the business logic

### index.js

```javascript
import Server from 'base-server/server';
import { join } from 'path';

const server = new Server({
  migration: {
    name: 'pipeu-event-schedule',
    dir: join(__dirname, '..', 'db'),
  },
});

// add requires to all your routers (compatible with Babel+Webpack)
require('./routers/MyRouter');

export default server;
```