import db from "../config/database.js";

/**
 * createProduct - matches existing DB structure
 */
export const createProduct = ({ sellerId, title, description, price, stockQuantity, category, imageUrl }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO products (seller_id, title, description, price, stock_quantity, category, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')",
      [sellerId, title, description, price, stockQuantity || 0, category || null, imageUrl || null],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
};

/**
 * getProductsBySeller
 */
export const getProductsBySeller = (sellerId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC",
      [sellerId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

/**
 * getAllProducts (for public browsing) - only active products
 */
export const getAllProducts = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT p.*, u.email as seller_email FROM products p JOIN users u ON p.seller_id = u.id WHERE p.status = 'active' ORDER BY p.created_at DESC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

/**
 * getProductById
 */
export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT p.*, u.email as seller_email FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

/**
 * updateProduct
 */
export const updateProduct = (id, sellerId, { title, description, price, stockQuantity, category, imageUrl, status }) => {
  return new Promise((resolve, reject) => {
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (description !== undefined) { updates.push("description = ?"); values.push(description); }
    if (price !== undefined) { updates.push("price = ?"); values.push(price); }
    if (stockQuantity !== undefined) { updates.push("stock_quantity = ?"); values.push(stockQuantity); }
    if (category !== undefined) { updates.push("category = ?"); values.push(category); }
    if (imageUrl !== undefined) { updates.push("image_url = ?"); values.push(imageUrl); }
    if (status !== undefined) { updates.push("status = ?"); values.push(status); }
    
    if (updates.length === 0) return resolve(false);
    
    values.push(id, sellerId);
    
    db.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = ? AND seller_id = ?`,
      values,
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

/**
 * deleteProduct
 */
export const deleteProduct = (id, sellerId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM products WHERE id = ? AND seller_id = ?",
      [id, sellerId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

/**
 * updateStock
 */
export const updateStock = (id, stockQuantity) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE products SET stock_quantity = ? WHERE id = ?",
      [stockQuantity, id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};
