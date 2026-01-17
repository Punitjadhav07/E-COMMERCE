import app from "./app.js";
import db from './config/database.js';
import { verifyEmailConfig } from "./services/email.service.js";

console.log("server.js loaded");
const port = 3000;

// Verify email configuration on server start
verifyEmailConfig().then((isReady) => {
  if (!isReady) {
    console.warn("⚠️  Email service not properly configured. Check your .env file!");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});