const config = require('config');
const cfg = { ...config, ...process.env };

exports.get = name => cfg[name];
exports.has = name => cfg[name] !== undefined;
exports.getBoolean = name => cfg[name] === 'true' || cfg[name] === true;
exports.set = (name, value) => cfg[name] = value;