import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../Api/api';
import '../Components_css/products.css';

const BACKEND_URL = "http://localhost:3000";

const UserHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.filter(p => p.category).map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get image URL helper
  const getImageUrl = (product) => {
    if (!product.image_url) return null;
    if (product.image_url.startsWith('http')) return product.image_url;
    return `${BACKEND_URL}${product.image_url}`;
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="user-home">
      {/* Header */}
      <header className="user-header">
        <div className="header-left">
          <h1 className="logo">USER HOME</h1>
        </div>
        <div className="header-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
        <div className="header-right">
          {user.email ? (
            <>
              <span className="user-name">{user.email}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-login">Login</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="products-container">
        <div className="products-header">
          <h2 className="section-title">All Products</h2>
          {categories.length > 1 && (
            <div className="category-filter">
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? 'No products found matching your search.' : 'No products available yet.'}
          </div>
        ) : (
          <div className="products-grid-user">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card-user">
                <div className="product-image-wrapper">
                  {product.image_url ? (
                    <img 
                      src={getImageUrl(product)} 
                      alt={product.title} 
                      className="product-img"
                    />
                  ) : (
                    <div className="product-img no-image">No Image</div>
                  )}
                </div>
                <div className="product-details">
                  <h3 className="product-title">{product.title}</h3>
                  {product.description && (
                    <p className="product-desc">{product.description.substring(0, 80)}...</p>
                  )}
                  <p className="product-stock-info">Stock: {product.stock_quantity || 0}</p>
                  <div className="product-footer">
                    <span className="product-price-tag">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                    <button className="btn-add-cart" disabled={!product.stock_quantity}>
                      {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserHome;
