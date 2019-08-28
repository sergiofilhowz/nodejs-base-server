const PowerRouter = require('express-power-router');
const { ValidationError } = require('sequelize');
const keycloakService = require('./keycloak');

const { BadRequestError } = PowerRouter;
const powerRouter = PowerRouter();

powerRouter.createInterceptor({
  intercepts: () => true,
  execute: async (parameters, req, res, stack) => {
    try {
      return await stack.next();
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors = {};
        for (let error of err.errors) {
          let field = errors[error.path];
          if (!field) {
            field = [];
            errors[error.path] = field;
          }
          field.push(error.message);
        }
        throw new BadRequestError('Validation Problems', { errors });
      }
      throw err;
    }
  },
});

powerRouter.createInterceptor({
  intercepts: parameters => parameters && parameters.roles,
  execute: async (parameters, req, res, stack) => {
    await keycloakService.interceptExpressRequest(req, parameters.roles);
    return stack.next();
  },
});

module.exports = powerRouter;
