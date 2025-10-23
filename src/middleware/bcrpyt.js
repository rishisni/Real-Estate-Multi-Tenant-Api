// src/middleware/passwordHasher.js
const bcrypt = require('bcryptjs');

/**
 * Middleware to hash the password field if it exists in req.body.
 * The resulting hashed password is put into req.body.password_hash.
 */
const hashPassword = async (req, res, next) => {
    const password = req.body.password;

    if (password) {
        try {
            // Hash the plaintext password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Replace the plaintext password with the hashed version (or remove plaintext)
            req.body.password_hash = hashedPassword;
            delete req.body.password; // IMPORTANT: Remove the plaintext password from the request body

        } catch (error) {
            console.error('Password Hashing Error:', error);
            return res.status(500).json({ message: 'Failed to process password.' });
        }
    }

    next();
};

module.exports = hashPassword;