import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMyProducts, 
  createProduct, 
  deleteProduct,
  setAuthToken 
} from '../Api/api';
import '../Components_css/dashboard.css';

const BACKEND_URL = "http://localhost:3000";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form State - matching DB columns
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'SELLER') {
      navigate('/');
      return;
    }

    setAuthToken(user.id);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getMyProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  // Process selected image
  const handleImageSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      alert("Product title and price are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('stockQuantity', newProduct.stockQuantity || 0);
      formData.append('category', newProduct.category);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await createProduct(formData);
      alert("Product added successfully!");
      
      // Reset form
      setNewProduct({ title: '', description: '', price: '', stockQuantity: '', category: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setActiveTab('products');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  };

  // Get image URL helper
  const getImageUrl = (product) => {
    if (!product.image_url) return null;
    // If it starts with http, it's an external URL
    if (product.image_url.startsWith('http')) return product.image_url;
    // Otherwise it's a local upload
    return `${BACKEND_URL}${product.image_url}`;
  };

  const totalStock = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * (p.stock_quantity || 0)), 0);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Seller Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 My Products
            <span className="badge">{products.length}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'add-product' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-product')}
          >
            ➕ Add Product
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === 'analytics' && 'Dashboard Overview'}
            {activeTab === 'products' && 'My Products'}
            {activeTab === 'add-product' && 'Add New Product'}
          </h1>
          <span className="user-badge">Seller Account</span>
        </header>

        <div className="content-body">
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-label">Total Products</div>
                <div className="analytics-number">{products.length}</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-label">Total Stock</div>
                <div className="analytics-number">{totalStock}</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-label">Inventory Value</div>
                <div className="analytics-number">₹{totalValue.toLocaleString('en-IN')}</div>
              </div>
            </div>
          )}

          {/* Products Tab - Card View */}
          {activeTab === 'products' && (
            <div className="products-grid">
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading...</p>
              ) : products.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>No products listed yet. Add your first product!</p>
              ) : (
                products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      {product.image_url ? (
                        <img 
                          src={getImageUrl(product)} 
                          alt={product.title} 
                          className="product-image" 
                        />
                      ) : (
                        <div className="product-image no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      {product.category && <span className="product-category">{product.category}</span>}
                      <p className="product-stock">Stock: {product.stock_quantity || 0}</p>
                      <div className="product-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn-delete-product"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Product Tab */}
          {activeTab === 'add-product' && (
            <div className="add-product-form">
              <form onSubmit={handleAddProduct}>
                {/* Image Upload Area */}
                <div className="form-group">
                  <label>Product Image</label>
                  <div 
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="drop-zone-content">
                        <span className="drop-icon">📁</span>
                        <p>Drag & drop an image here, or click to select</p>
                        <span className="drop-hint">Max size: 5MB</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label>Product Title *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={newProduct.title}
                    onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-textarea"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Describe your product..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-input"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Books">Books</option>
                    <option value="Toys & Games">Toys & Games</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Watches">Watches</option>
                    <option value="Bags & Luggage">Bags & Luggage</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Pet Supplies">Pet Supplies</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Musical Instruments">Musical Instruments</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0.00"
                      required
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newProduct.stockQuantity}
                      onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding Product...' : 'Add Product'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
