// backend/models/user.model.js
import db from "../config/database.js";

/**
 * findUserById
 */
export const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, email, role, status, verified, created_at FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

/**
 * findUserByEmail
 */
export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

/**
 * createUser - Creates user with verified=0 and status='pending'
 */
export const createUser = ({ email, password, role }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (email, password, role, verified, status) VALUES (?, ?, ?, 0, 'pending')",
      [email, password, role],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
};

/**
 * generateAndStoreOTP - Generates 6-digit OTP and stores with expiration (5 minutes)
 */
export const generateAndStoreOTP = (email) => {
  return new Promise((resolve, reject) => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    db.query(
      "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?",
      [otp, expiresAt, email],
      (err, result) => {
        if (err) return reject(err);
        resolve(otp);
      }
    );
  });
};

/**
 * verifyOTP - Verifies OTP code and checks expiration
 */
export const verifyOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT otp_code, otp_expires_at FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return reject(err);
        
        if (!results[0]) {
          return resolve({ valid: false, message: "User not found" });
        }

        const { otp_code, otp_expires_at } = results[0];

        if (!otp_code) {
          return resolve({ valid: false, message: "No OTP found. Please request a new OTP." });
        }

        if (otp_code !== otp) {
          return resolve({ valid: false, message: "Invalid OTP code" });
        }

        // Check if OTP expired
        const now = new Date();
        const expiresAt = new Date(otp_expires_at);
        
        if (now > expiresAt) {
          return resolve({ valid: false, message: "OTP has expired. Please request a new one." });
        }

        resolve({ valid: true });
      }
    );
  });
};

/**
 * activateUserAndClearOTP - Sets verified=1, status='active', and clears OTP
 */
export const activateUserAndClearOTP = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET verified = 1, status = 'active', otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
      [email],
      (err, result) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * clearOTP - Clears OTP from user record (for resend scenario)
 */
export const clearOTP = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
      [email],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * getOTPExpiry - Gets OTP expiry time for a user
 */
export const getOTPExpiry = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT otp_expires_at FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.otp_expires_at || null);
      }
    );
  });
};

/**
 * deleteUnverifiedUserAfterExpiry - Deletes user if OTP expired and user not verified
 */
export const deleteUnverifiedUserAfterExpiry = (email) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    db.query(
      "DELETE FROM users WHERE email = ? AND verified = 0 AND otp_expires_at IS NOT NULL AND otp_expires_at < ?",
      [email, now],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0); // Returns true if user was deleted
      }
    );
  });
};

/**
 * getPendingSellers
 */
export const getPendingSellers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, email, role, status, verified FROM users WHERE role = 'SELLER' AND status = 'pending'",
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

/**
 * approveSeller
 */
export const approveSeller = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET status = 'active', verified = 1 WHERE id = ?",
      [id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * rejectSeller
 */
export const rejectSeller = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET status = 'rejected' WHERE id = ?",
      [id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

/**
 * blockUser
 */
export const blockUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET status = 'blocked' WHERE id = ?",
      [id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};
