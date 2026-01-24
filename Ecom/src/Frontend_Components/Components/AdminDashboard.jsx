import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingSellers, 
  approveSeller, 
  rejectSeller, 
  getAllUsers, 
  blockUser, 
  deleteUser,
  setAuthToken
} from '../Api/api';
import '../Components_css/dashboard.css'; // Updated CSS Import

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('sellers');
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    setAuthToken(user.id);
    fetchData();
  }, [navigate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'sellers') {
        const res = await getPendingSellers();
        setSellers(res.data);
      } else if (activeTab === 'users') {
        const res = await getAllUsers();
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Failed to load data.");
      if (err.response && err.response.status === 401) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    if (!window.confirm("Approve this seller?")) return;
    try {
      await approveSeller(id);
      setSellers(sellers.filter(s => s.id !== id));
      alert("Seller approved!");
    } catch (err) {
      alert("Failed to approve seller");
    }
  };

  const handleRejectSeller = async (id) => {
    if (!window.confirm("Reject this seller?")) return;
    try {
      await rejectSeller(id);
      setSellers(sellers.filter(s => s.id !== id));
      alert("Seller rejected");
    } catch (err) {
      alert("Failed to reject seller");
    }
  };

  const handleBlockUser = async (id) => {
    if (!window.confirm("Block this user?")) return;
    try {
      await blockUser(id);
      setUsers(users.map(u => u.id === id ? {...u, status: 'blocked'} : u));
    } catch (err) {
      alert("Failed to block user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            📋 Seller Requests
            {sellers.length > 0 && <span className="badge">{sellers.length}</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 All Users
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <h1>{activeTab === 'sellers' ? 'Pending Seller Approvals' : 'User Management'}</h1>
          <span className="user-badge">Admin</span>
        </header>

        <div className="content-body">
          {error && <div style={{color: 'red', marginBottom: 20}}>{error}</div>}
          
          {loading ? (
            <div style={{color: '#9ca3af'}}>Loading data...</div>
          ) : (
            <>
              {activeTab === 'sellers' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.length === 0 ? (
                        <tr><td colSpan="4" style={{textAlign: 'center', color: '#9ca3af'}}>No pending requests</td></tr>
                      ) : (
                        sellers.map(seller => (
                          <tr key={seller.id}>
                            <td>{seller.email}</td>
                            <td><span className="status-pill pending">{seller.status}</span></td>
                            <td>{new Date(seller.created_at || Date.now()).toLocaleDateString()}</td>
                            <td>
                              <button onClick={() => handleApproveSeller(seller.id)} className="status-pill active" style={{border: 'none', cursor: 'pointer', marginRight: 10}}>Approve</button>
                              <button onClick={() => handleRejectSeller(seller.id)} className="status-pill blocked" style={{border: 'none', cursor: 'pointer'}}>Reject</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                   <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{marginBottom: '20px', maxWidth: '300px'}}
                  />
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <span className={`status-pill ${user.status}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td>
                              {user.status !== 'blocked' && (
                                <button onClick={() => handleBlockUser(user.id)} className="status-pill blocked" style={{border: 'none', cursor: 'pointer', marginRight: 10}}>Block</button>
                              )}
                              <button onClick={() => handleDeleteUser(user.id)} className="logout-btn" style={{padding: '2px 8px', fontSize: '0.75rem'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
