import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { requireSeller } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { 
  createProduct, 
  getProductsBySeller, 
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct
} from "../models/product.model.js";

const router = express.Router();

// PUBLIC: GET /api/products - Get all products (for browsing)
router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// PUBLIC: GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Protected Routes Below
router.use(authenticateUser);

// GET /api/products/seller/my-products - Seller's own products
router.get("/seller/my-products", requireSeller, async (req, res) => {
  try {
    const products = await getProductsBySeller(req.user.id);
    res.json(products);
  } catch (err) {
    console.error("Error fetching seller products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/products - Create new product with image upload
router.post("/", requireSeller, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, stockQuantity, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    // Get the image URL - either uploaded file or provided URL
    let imageUrl = req.body.imageUrl || null;
    if (req.file) {
      // If file was uploaded, use local path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const productId = await createProduct({
      sellerId: req.user.id,
      title,
      description,
      price,
      stockQuantity: stockQuantity || 0,
      category,
      imageUrl
    });

    res.status(201).json({ message: "Product created successfully", productId });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", requireSeller, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stockQuantity, category, status } = req.body;
    
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await updateProduct(id, req.user.id, {
      title,
      description,
      price,
      stockQuantity,
      category,
      imageUrl,
      status
    });

    if (!updated) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProduct(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
