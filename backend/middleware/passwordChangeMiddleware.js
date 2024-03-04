// passwordChangeMiddleware.js

const bcrypt = require('bcrypt');


const passwordChangeMiddleware = async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;

        // Update user password directly (assuming User model is defined in server.js)
        req.UserModel.password = await bcrypt.hash(newPassword, 10);
        await req.UserModel.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = passwordChangeMiddleware;
