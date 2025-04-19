require("dotenv").config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./userRoutes');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const sharp = require('sharp');
const nodemailer = require('nodemailer');

// Models
const Session = require("./models/Session.js");
const Video = require("./models/video.js");
const User = require("./models/user.js"); // Assuming the path is correct

// Optional fireAlarm module if you have real-time fire detection
const fireAlarm = require("./fireAlarm");

// Express App Init
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', authRoutes); 


// Constants
const JWT_SECRET = process.env.JWT_SECRET || "87fc898c2cfd0345e75ad3a3f24f2507b53f4913fc340521d2aae0e403c5fef6";
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected!");
        console.log("Connected to database:", mongoose.connection.name);
    })
    .catch(err => console.error(" MongoDB Connection Error:", err));



//  JWT Middleware
const tokenMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied: No token provided" });
    try {
        const token = authHeader.split(" ")[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmailAlert(subject, body, recipientEmail) {
    console.log("Sending email to:", recipientEmail, "Subject:", subject);
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            text: body,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
app.post("/api/logout", async (req, res) => {
    try {
        const {token} = req.body;

        const deletedSession = await Session.deleteOne({ token });
        if (deletedSession.deletedCount === 0) {
            return res.status(400).json({ error: "Session not found" });
        }

        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("❌ Logout Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// Protected Profile Route
app.get("/api/profile", tokenMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.post('/api/detection-alert', async (req, res) => {
    console.log("Received /api/detection-alert request:", req.body);
    const { type } = req.body; // 'fire' or 'smoke'

    try {
        const users = await User.find({
            email: {
              $exists: true,
              $ne: null,
              $ne: ""
            }
        }); // Fetch all users with an email
        console.log("Fetched users:", users);
        console.log("Number of users found for email alert:", users.length);
        const subject = type === 'fire' ? '🔥 Fire Detected!' : '💨 Smoke Detected!';
        const body = type === 'fire' ? 'A fire has been detected by the system. Please take immediate action.' : 'Smoke has been detected by the system. Please check the premises.';

        for (const user of users) {
            if (user.email) {
                await sendEmailAlert(subject, body, user.email);
                console.log("Processing user:", user.email);
            }

        }

        res.status(200).json({ message: 'Email alerts sent to all users.' });
    } catch (error) {
        console.error('Error sending email alerts:', error);
        res.status(500).json({ error: 'Failed to send email alerts.' });
    }
});
// Default Route
app.get("/", (req, res) => {
    res.send("🚀 Fire Detection Backend is Running!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
