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
 * createUser
 */
export const createUser = ({ email, password, role }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, password, role],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
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
