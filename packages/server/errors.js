const { BadRequestError, HttpError, NotFoundError } = require('express-power-router');

class UnauthorizedError extends HttpError {
  constructor(message, data) {
    super(message, 401, data);
  }
}

exports.BadRequestError = BadRequestError;
exports.HttpError = HttpError;
exports.NotFoundError = NotFoundError;
exports.UnauthorizedError = UnauthorizedError;
