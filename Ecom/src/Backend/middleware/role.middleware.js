/**
 * Role-Based Authorization Middleware
 * 
 * Usage: router.get('/admin-route', requireRole('ADMIN'), controller)
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    // Ensure user is authenticated first (authMiddleware must run before this)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Check if user has the required role
    // We convert both to uppercase to be safe
    if (req.user.role.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({ 
        error: "Forbidden: You do not have permission to access this resource" 
      });
    }

    next();
  };
};

// Preset for Admin
export const requireAdmin = requireRole('ADMIN');

// Preset for Seller
export const requireSeller = requireRole('SELLER');
