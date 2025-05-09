const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");

// 🔐 MongoDB Configuration
const mongoUri = "MONGODB_CLUSTER_URL";
const dbName = "DATABASE_NAME";
const usersCollection = "users";
const fireLogsCollection = "fire_logs";

// 📧 Email Configuration
const emailUser = "SENDER_EMAIL";
const emailPass = "GAMIL_APP_PASSWORD";
const adminEmail = "ADMIN_EMAIL";

// ✅ MongoDB Client
const client = new MongoClient(mongoUri);

// 📧 Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// ✅ Send to All Users
async function sendToAllUsers(subject, message) {
    try {
        await client.connect();
        const db = client.db(dbName);

        // 🔍 Get all user emails
        const users = await db.collection(usersCollection).find({}).toArray();

        // 📧 Send to each user
        for (const user of users) {
            await transporter.sendMail({
                from: emailUser,
                to: user.email,
                subject,
                text: message,
            });
        }

        // 📝 Log fire alert
        await db.collection(fireLogsCollection).insertOne({
            type: "Fire",
            message,
            subject,
            timestamp: new Date(),
        });

        console.log("✅ Emails sent to all users and fire log saved.");
    } catch (error) {
        console.error("❌ Error sending user emails:", error.message);
    } finally {
        await client.close();
    }
}

// ✅ Send to Admin Only
async function sendToAdmin(subject, message) {
    try {
        // 📧 Email to admin
        await transporter.sendMail({
            from: emailUser,
            to: adminEmail,
            subject,
            text: message,
        });

        // 🔒 Log smoke alert
        await client.connect();
        const db = client.db(dbName);
        await db.collection(fireLogsCollection).insertOne({
            type: "Smoke",
            message,
            subject,
            timestamp: new Date(),
        });

        console.log("✅ Admin notified and log saved.");
    } catch (error) {
        console.error("❌ Error sending admin email:", error.message);
    } finally {
        await client.close();
    }
}

module.exports = { sendToAllUsers, sendToAdmin };
