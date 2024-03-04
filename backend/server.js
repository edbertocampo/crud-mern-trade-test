const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const crypto = require ('crypto');
const cors = require('cors');
const path = require('path');
const passwordChangeMiddleware = require('./middleware/passwordChangeMiddleware');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for user authentication
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
  
    try {
      const decoded = jwt.verify(token, '454154609908bc21e9e54d3f3b990fce719734ef1cf1a895d07aa1c2c3c14cd8');
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/crud_mern', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User model
const userSchema = new mongoose.Schema({
    profileInfo: { type: Buffer },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'preferNotToSay'], required: true },
    resetToken: { type: String, select: false },
});

const User = mongoose.model('User', userSchema);


// Image upload route
app.post('/upload-picture', authenticateUser, fileUpload(), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.profileInfo) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        const picture = req.files.profileInfo;

        // Validate file extension (you can enhance this validation)
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const fileExtension = picture.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG or PNG image' });
        }

        const pictureName = `${userId}_${Date.now()}_${picture.name}`;

        // Move the uploaded file to the server
        picture.mv(`./uploads/${pictureName}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error uploading file' });
            }

            // Update user's picture field
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.profileInfo = pictureName; // Updated field to profileInfo
            await user.save();

            res.json({ message: 'Picture uploaded successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Registration route
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        if (password.length < 6) {
            
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if picture file is included in the request
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.profileInfo) {
            return res.status(400).json({ error: 'Profile picture is required' });
        }

        const picture = req.files.profileInfo;

        // Validate file extension (you can enhance this validation)
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const fileExtension = picture.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG or PNG image' });
        }

        // Move the uploaded file to the server
        const pictureName = `${Date.now()}_${picture.name}`;
        picture.mv(`./uploads/${pictureName}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error uploading file' });
            }

            // Create a new user with the uploaded picture
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                gender,
                profileInfo: pictureName, // Updated field to profileInfo
            });

            // Save user to the database
            await newUser.save();

            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, '454154609908bc21e9e54d3f3b990fce719734ef1cf1a895d07aa1c2c3c14cd8', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile retrieval route
app.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId, { password: 0 });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profileImageUrl = `/uploads/${user.profileInfo}`;
        res.json({ user: { ...user._doc, profileImageUrl } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update user profile route
app.patch('/update-profile', authenticateUser, async (req, res) => {
    try {
        const { username, gender } = req.body;

        // Find the user by ID
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields if provided
        if (username) user.username = username;
        if (gender) user.gender = gender;

        // Check if a new profile picture is included in the request
        if (req.files && req.files.profileInfo) {
            const picture = req.files.profileInfo;

            // Validate file extension (you can enhance this validation)
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = picture.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG or PNG image' });
            }

            // Move the uploaded file to the server
            const pictureName = `${Date.now()}_${picture.name}`;
            picture.mv(`./uploads/${pictureName}`, async (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error uploading file' });
                }

                // Update profile picture field
                user.profileInfo = pictureName;
                await user.save();

                res.json({ message: 'Profile updated successfully', user });
            });
        } else {
            // Save the updated user (without updating the profile picture)
            await user.save();
            res.json({ message: 'Profile updated successfully', user });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Generate a random token for password reset
const generateResetToken = () => {
    const tokenLength = 40;
    return crypto.randomBytes(tokenLength).toString('hex');
};

// Route for initiating password reset
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a reset token with an expiration time of 1 hour
        const resetToken = jwt.sign({ email }, '454154609908bc21e9e54d3f3b990fce719734ef1cf1a895d07aa1c2c3c14cd8', { expiresIn: '1h' });

        // Save the token and expiration time in the user document
        user.resetToken = resetToken;
        user.resetTokenExpiresAt = Date.now() + 3600000; // 1 hour in milliseconds
        await user.save();

        // TODO: Send the reset token to the user's email (you can use a mailing library for this)

        res.json({ message: 'Reset token generated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route for resetting password with the token
app.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if the user is found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate the length of the new password
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Account deletion route
app.delete('/delete-account', authenticateUser, async (req, res) => {
    try {
        // Delete the user account
        const deletedUser = await User.findByIdAndDelete(req.userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

// Route for updating password after login
app.post('/change-password', authenticateUser, (req, res, next) => {
    // Pass the User model to the middleware
    req.UserModel = User;
    passwordChangeMiddleware(req, res, next);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Run server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
