const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const { BadRequestError } = require('express-power-router');

module.exports = (from, to, fields) => {
  const applied = [];
  const errors = {};

  for (const field of fields) {
    let fromName = field.from || field;
    let fieldName = field.to || field.from || field;
    let innerFrom = get(from, fromName);

    if (innerFrom !== undefined) {
      if (field.type === 'float') {
        innerFrom = parseFloat(innerFrom);
        if (isNaN(innerFrom)) continue;
      }
      to[fieldName] = innerFrom;
      applied.push(fieldName);
    }

    if (field.validate) {
      try {
        field.validate(innerFrom);
      } catch (err) {
        errors[fieldName] = err.message;
      }
    }
  }

  if (!isEmpty(errors)) {
    throw new BadRequestError('Validation Problems', errors);
  }
  return applied;
};
