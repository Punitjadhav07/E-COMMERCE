import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { 
  getPendingSellers, 
  approveSeller, 
  rejectSeller, 
  blockUser,
  findUserById
} from "../models/user.model.js";
import { sendApprovalEmail, sendRejectionEmail } from "../services/email.service.js"; // Import email service
import db from "../config/database.js";

const router = express.Router();

// Apply Auth and Admin check to ALL routes in this file
router.use(authenticateUser);
router.use(requireAdmin);

// ... (get /users, /pending-sellers code remains same) ...
// GET /api/admin/users - List all users (for management)
router.get("/users", (req, res) => {
  db.query(
    "SELECT id, email, role, status, verified, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
      }
      res.json(results);
    }
  );
});

// GET /api/admin/pending-sellers - List sellers waiting for approval
router.get("/pending-sellers", async (req, res) => {
  try {
    const sellers = await getPendingSellers();
    res.json(sellers);
  } catch (err) {
    console.error("Error fetching pending sellers:", err);
    res.status(500).json({ error: "Failed to fetch pending sellers" });
  }
});

// POST /api/admin/approve-seller/:id
router.post("/approve-seller/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user email first to send notification
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await approveSeller(id);
    
    // Send email notification
    if (user.email) {
        sendApprovalEmail(user.email).catch(console.error);
    }

    res.json({ message: `Seller with ID ${id} approved successfully` });
  } catch (err) {
    console.error("Error approving seller:", err);
    res.status(500).json({ error: "Failed to approve seller" });
  }
});

// POST /api/admin/reject-seller/:id
router.post("/reject-seller/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get user email first to send notification
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await rejectSeller(id);
    
    // Send email notification
    if (user.email) {
        sendRejectionEmail(user.email).catch(console.error);
    }

    res.json({ message: `Seller with ID ${id} rejected` });
  } catch (err) {
    console.error("Error rejecting seller:", err);
    res.status(500).json({ error: "Failed to reject seller" });
  }
});

// POST /api/admin/block-user/:id
router.post("/block-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from blocking themselves
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: "You cannot block yourself" });
    }

    await blockUser(id);
    res.json({ message: `User with ID ${id} has been blocked` });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ error: "Failed to block user" });
  }
});

// DELETE /api/admin/user/:id - Hard delete user (dangerous!)
router.delete("/user/:id", (req, res) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: "You cannot delete yourself" });
    }

    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ error: "Failed to delete user" });
        }
        res.json({ message: `User with ID ${id} permanently deleted` });
    });
});

export default router;
