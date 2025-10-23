/**
 * Login DTO (Data Transfer Object)
 * Defines the structure for user login requests
 * @module modules/users/dto/login
 */

/**
 * @typedef {Object} LoginDto
 * @property {string} email - User email address
 * @property {string} password - User password (plain text)
 */

/**
 * Create a LoginDto from request body
 * @param {Object} data - Raw request data
 * @returns {LoginDto}
 */
class LoginDto {
    constructor(data) {
        this.email = data.email;
        this.password = data.password;
    }
}

module.exports = LoginDto;

