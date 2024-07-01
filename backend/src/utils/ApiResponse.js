/**
 * @class ApiResponse
 * @description This class is used to send a response to the client.
 * @param {string} message - The message to be sent to the client.
 * @param {object} data - The data to be sent to the client.
 */
class ApiResponse {
  constructor(message, data) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
