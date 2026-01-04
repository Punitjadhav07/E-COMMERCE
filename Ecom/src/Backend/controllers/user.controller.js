// backend/controllers/user.controller.js
import {
  findUserById,
  findUserByEmail,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  blockUser
} from "../models/user.model.js";

// GET /api/users/me  (any logged‑in user)
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;   // set by auth middleware
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      verified: user.verified,
      created_at: user.created_at
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users  (admin only – all users or filter by role/status via query)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;

    let sql = "SELECT id, email, role, status, verified, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) {
      sql += " AND role = ?";
      params.push(role.toUpperCase());
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    req.db.query(sql, params, (err, rows) => {
      if (err) return next(err);
      res.json({ count: rows.length, users: rows });
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/status   (admin – block/unblock)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "active" | "blocked"

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (status === "blocked") {
      await blockUser(id);
    } else {
      // simple activate
      await new Promise((resolve, reject) => {
        req.db.query(
          "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = ?",
          [id],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    res.json({ message: "Status updated", userId: id, status });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (admin – hard delete, optional)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await new Promise((resolve, reject) => {
      req.db.query("DELETE FROM users WHERE id = ?", [id], (err) =>
        err ? reject(err) : resolve()
      );
    });

    res.json({ message: "User deleted", userId: id });
  } catch (err) {
    next(err);
  }
};
