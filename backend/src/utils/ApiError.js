/**
 * @class ApiError
 * @extends {Error}
 * @description Custom error class
 * @param {number} statusCode - The status code of the error.
 * @param {string} message - The message to be sent to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
