import { findUserById } from "../models/user.model.js";

/**
 * Authentication Middleware (Temporary Dev Version)
 * 
 * Since we are not using JWT yet, this middleware looks for a 
 * 'x-user-id' header to identify the user.
 * 
 * FLOW:
 * 1. Check for 'x-user-id' header.
 * 2. If present, find user in DB.
 * 3. Attach user object to req.user.
 * 4. If not found or invalid, return 401 Unauthorized.
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // In a real app, we would look for 'Authorization: Bearer <token>'
    // For now, we trust the 'x-user-id' header (DEV ONLY)
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID provided in headers" });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: "Forbidden: Your account has been blocked" });
    }

    // Attach user to request object so downstream controllers can use it
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error during authentication" });
  }
};
