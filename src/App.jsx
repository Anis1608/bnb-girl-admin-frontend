import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Mic, Users, FolderTree, BookOpen, Inbox, BarChart3, 
  Settings as SettingsIcon, LogOut, Plus, Search, Download, Trash2, 
  Edit, Save, Upload, Link, FileText, CheckCircle, AlertCircle, Info, ExternalLink, X, PlusCircle, Check,
  Lock, User, Eye, EyeOff, ShieldCheck
} from 'lucide-react';

const API_BASE = 'https://bnb-girl-backend.onrender.com/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('bbg_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('bbg_username') || '');
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showConfirm = (message, onConfirm) => {
    setConfirmConfig({ message, onConfirm });
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Route Guards for Authenticated / Unauthenticated sessions
  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (token && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, location.pathname, navigate]);

  // Derived activeView based on the current URL pathname
  const activeView = location.pathname === '/' || location.pathname === '/login'
    ? 'dashboard'
    : location.pathname.substring(1);

  const handleViewChange = (view) => {
    navigate(`/${view}`);
    setIsMobileMenuOpen(false);
  };

  // Login Form State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Global Lists shared across views for fast dropdown rendering
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [specializedFields, setSpecializedFields] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth fetch wrapper
  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Auto logout on unauthorized
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  };

  // Fetch initial config lists
  const loadGlobalLists = async () => {
    if (!token) return;
    try {
      const cats = await apiFetch('/categories');
      setCategories(cats);
      
      const allSubs = [];
      for (const cat of cats) {
        const subs = await apiFetch(`/categories/${cat._id}/subcategories`);
        allSubs.push(...subs);
      }
      setSubcategories(allSubs);

      const sFields = await apiFetch('/admin/specialized-fields');
      setSpecializedFields(sFields);

      // Fetch episodes (public API has same attributes)
      const epsData = await apiFetch('/admin/episodes');
      setEpisodes(epsData);
    } catch (err) {
      console.error('Error loading config list', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadGlobalLists();
    }
  }, [token]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const data = await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      if (data.success) {
        localStorage.setItem('bbg_token', data.token);
        localStorage.setItem('bbg_username', data.username);
        setToken(data.token);
        setUsername(data.username);
        showToast('Login Successful! Welcome to BBG Platform.');
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('bbg_token');
    localStorage.removeItem('bbg_username');
    localStorage.removeItem('bbg_active_view');
    setToken('');
    setUsername('');
    globalDashboardCache = null;
    globalRecentSubsCache = [];
    navigate('/login', { replace: true });
    showToast('Logged out successfully.', 'info');
  };

  // Render Login view if no token
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-glass-card animate-scale">
          <div className="flex-center" style={{ marginBottom: '20px' }}>
            <img 
              src="/logo-main.png" 
              alt="Bold & Brilliant Girls Logo" 
              style={{ 
                height: '74px', 
                objectFit: 'contain', 
                filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.4))' 
              }} 
            />
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '30px', 
            fontWeight: '900', 
            marginBottom: '6px', 
            background: 'var(--theme-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            BBG Platform
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px', marginBottom: '28px' }}>
            Bold & Brilliant Girls Admin Dashboard
          </p>
          
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            {loginError && (
              <div style={{ 
                backgroundColor: 'hsl(var(--danger) / 0.12)', 
                border: '1px solid hsl(var(--danger) / 0.25)',
                color: 'hsl(var(--danger))', 
                padding: '12px', 
                borderRadius: 'var(--border-radius-md)', 
                fontSize: '13px', 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-left">
                  <User size={16} />
                </span>
                <input 
                  type="text" 
                  className="input-field input-field-with-icon" 
                  required 
                  value={loginUser} 
                  onChange={(e) => setLoginUser(e.target.value)} 
                  placeholder="Enter username (admin)" 
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-left">
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field input-field-with-icon" 
                  required 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)} 
                  placeholder="Enter password (admin123)" 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>⏳ Logging in...</>
              ) : (
                <>🔒 Secure Sign In</>
              )}
            </button>

            <div className="secure-badge">
              <ShieldCheck size={14} style={{ color: 'hsl(var(--success))' }} />
              <span>SSL Encrypted Connection · Authorized Access Only</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Toast Alert */}
      {toast && (
        <div className="animate-fade" style={{ 
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toast.type === 'danger' ? 'hsl(var(--danger))' : toast.type === 'info' ? 'hsl(var(--info))' : 'linear-gradient(135deg, var(--primary), var(--accent))',
          color: '#fff', padding: '14px 24px', borderRadius: 'var(--border-radius-md)', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '14px'
        }}>
          {toast.type === 'danger' ? <AlertCircle size={18} /> : toast.type === 'info' ? <Info size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmConfig && (
        <div className="confirm-overlay" onClick={() => setConfirmConfig(null)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <div className="confirm-icon-wrap">
                <Trash2 size={20} />
              </div>
              <div className="confirm-title">Are you sure?</div>
            </div>
            <div className="confirm-body">{confirmConfig.message}</div>
            <div className="confirm-actions">
              <button 
                type="button"
                className="btn btn-cancel" 
                onClick={() => setConfirmConfig(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedSub && (
        <div className="confirm-overlay" onClick={() => setSelectedSub(null)}>
          <div className="confirm-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header" style={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📋</span>
                <div className="confirm-title" style={{ margin: 0, fontSize: '18px' }}>Submission Details</div>
              </div>
              <button onClick={() => setSelectedSub(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="confirm-body" style={{ textAlign: 'left', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', marginBottom: '20px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Form Type:</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{selectedSub.form_type.replace('_', ' ')}</span>
                
                <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Submitted:</span>
                <span>{new Date(selectedSub.created_at).toLocaleString()}</span>
                
                <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600' }}>IP Address:</span>
                <span>{selectedSub.ip_address || 'N/A'}</span>
                
                <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Status:</span>
                <span className={`badge badge-${selectedSub.status}`} style={{ width: 'fit-content', display: 'inline-block' }}>{selectedSub.status}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: 'hsl(var(--text-secondary))' }}>Submitted Data:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                {Object.entries(selectedSub.data || {}).map(([key, val]) => {
                  if (key === 'answers') return null;
                  if (key === 'results') return null;
                  
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                      <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'capitalize' }}>
                        {key.replace('_', ' ')}:
                      </span>
                      <span style={{ wordBreak: 'break-word', color: '#fff' }}>
                        {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                      </span>
                    </div>
                  );
                })}

                {/* Selected Answers for Quiz */}
                {selectedSub.form_type === 'quiz' && selectedSub.data?.answers && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#D8B4FE' }}>Selected Answers (18 Questions):</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {Object.entries(selectedSub.data.answers).map(([qId, ansVal]) => {
                        return (
                          <div key={qId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '600', width: '120px', flexShrink: 0 }}>{qId.toUpperCase()}:</span>
                            <span style={{ color: '#fff' }}>{String(ansVal)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ranked Career Recommendations */}
                {selectedSub.form_type === 'quiz' && selectedSub.data?.results && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#F97316' }}>Ranked Careers:</h4>
                    <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedSub.data.results.map((cKey, idx) => (
                        <li key={cKey} style={{ color: idx === 0 ? '#fff' : 'hsl(var(--text-muted))', fontWeight: idx === 0 ? 'bold' : 'normal' }}>
                          {cKey.replace('_', ' ').toUpperCase()} {idx === 0 ? '🏆 (Primary Match)' : ''}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
            
            <div className="confirm-actions" style={{ marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-192x192.png" alt="BBG Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span className="brand-title" style={{ fontSize: '18px' }}>BBG Platform</span>
        </div>
        <button className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: '0 20px', gap: '8px' }}>
          <img src="/logo-192x192.png" alt="BBG Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(147,51,234,0.3))' }} />
          <span className="brand-title">BBG Platform</span>
        </div>
        
        <div className="sidebar-menu">
          <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => handleViewChange('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
          <div className={`menu-item ${activeView === 'episodes' ? 'active' : ''}`} onClick={() => handleViewChange('episodes')}>
            <Mic size={18} />
            <span>Episodes</span>
          </div>
          <div className={`menu-item ${activeView === 'mentors' ? 'active' : ''}`} onClick={() => handleViewChange('mentors')}>
            <Users size={18} />
            <span>Mentors</span>
          </div>
          <div className={`menu-item ${activeView === 'categories' ? 'active' : ''}`} onClick={() => handleViewChange('categories')}>
            <FolderTree size={18} />
            <span>Categories</span>
          </div>
          <div className={`menu-item ${activeView === 'resources' ? 'active' : ''}`} onClick={() => handleViewChange('resources')}>
            <BookOpen size={18} />
            <span>Resources</span>
          </div>
          <div className={`menu-item ${activeView === 'submissions' ? 'active' : ''}`} onClick={() => handleViewChange('submissions')}>
            <Inbox size={18} />
            <span>Submissions</span>
          </div>
          <div className={`menu-item ${activeView === 'stats' ? 'active' : ''}`} onClick={() => handleViewChange('stats')}>
            <BarChart3 size={18} />
            <span>Stats Manager</span>
          </div>
          <div className={`menu-item ${activeView === 'cms' ? 'active' : ''}`} onClick={() => handleViewChange('cms')}>
            <FileText size={18} />
            <span>CMS Manager</span>
          </div>
          <div className={`menu-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => handleViewChange('settings')}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{username}</span>
            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Administrator</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Log out">
            <LogOut size={16} style={{ color: 'hsl(var(--danger))' }} />
          </button>
        </div>
      </div>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="content-area">
          <div className="animate-fade">
            <Routes>
              <Route path="/dashboard" element={<DashboardView apiFetch={apiFetch} setView={handleViewChange} showToast={showToast} />} />
              <Route path="/episodes" element={<EpisodesView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} loadGlobalLists={loadGlobalLists} />} />
              <Route path="/mentors" element={<MentorsView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} episodes={episodes} />} />
              <Route path="/categories" element={<CategoriesView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} loadGlobalLists={loadGlobalLists} />} />
              <Route path="/resources" element={<ResourcesView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} />} />
              <Route path="/submissions" element={<SubmissionsView apiFetch={apiFetch} showToast={showToast} onViewDetails={setSelectedSub} />} />
              <Route path="/stats" element={<StatsView apiFetch={apiFetch} showToast={showToast} />} />
              <Route path="/cms" element={<CmsView apiFetch={apiFetch} showToast={showToast} />} />
              <Route path="/settings" element={<SettingsView apiFetch={apiFetch} showToast={showToast} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   SUB-VIEWS COMPONENTS
   ==================================================================== */

// Helper to handle uploading files
async function handleFileUpload(file, apiFetch, showToast) {
  if (!file) return '';
  const formData = new FormData();
  formData.append('file', file);
  
  // Custom fetch for multipart form upload
  const token = localStorage.getItem('bbg_token');
  const response = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'File upload failed');
  }
  return data.url;
}

// Global memory caches for dashboard views to prevent redundant network fetches on tab-switching
let globalDashboardCache = null;
let globalRecentSubsCache = [];

// ── 1. DASHBOARD VIEW ────────────────────────────────────────────────
function DashboardView({ apiFetch, setView, showToast }) {
  const [dashboardData, setDashboardData] = useState(globalDashboardCache);
  const [recentSubs, setRecentSubs] = useState(globalRecentSubsCache);
  const [loading, setLoading] = useState(!globalDashboardCache);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async (force = false) => {
    if (globalDashboardCache && !force) {
      setLoading(false);
      return;
    }
    try {
      if (!globalDashboardCache) setLoading(true);
      const data = await apiFetch('/admin/dashboard-stats');
      globalDashboardCache = data;
      setDashboardData(data);

      const subsData = await apiFetch('/admin/submissions?page=1');
      globalRecentSubsCache = subsData.rows.slice(0, 5);
      setRecentSubs(globalRecentSubsCache);
    } catch (err) {
      console.error('Error loading dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await apiFetch('/admin/dashboard-stats');

      const subsData = await apiFetch('/admin/submissions?page=1');
      setRecentSubs(subsData.rows.slice(0, 5));
      if (showToast) showToast('Dashboard metrics refreshed successfully!');
    } catch (err) {
      console.error('Error refreshing dashboard stats', err);
      if (showToast) showToast('Failed to refresh dashboard metrics.', 'danger');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // Keep reference to original state in case rollback is needed
    const originalSubs = [...recentSubs];

    // 1. Optimistically update local submissions state instantly
    setRecentSubs(prevSubs => 
      prevSubs.map(sub => 
        sub._id === id ? { ...sub, status: newStatus } : sub
      )
    );
    // Sync global cache too
    globalRecentSubsCache = globalRecentSubsCache.map(sub => 
      sub._id === id ? { ...sub, status: newStatus } : sub
    );

    try {
      await apiFetch(`/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (showToast) showToast('Submission status updated successfully!');
      
      // 2. Fetch fresh dashboard statistics to update the backlog bar and count labels
      const data = await apiFetch('/admin/dashboard-stats');
      globalDashboardCache = data;
      setDashboardData(data);
    } catch (err) {
      // Rollback to original state on error
      setRecentSubs(originalSubs);
      globalRecentSubsCache = originalSubs;
      if (showToast) showToast('Failed to update submission status.', 'danger');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="page-header">
          <div>
            <div className="skeleton-title skeleton-shimmer" />
            <div className="skeleton-subtitle skeleton-shimmer" />
          </div>
        </div>

        {/* 4 Cards Grid Skeleton */}
        <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-card-header skeleton-shimmer" />
              <div className="skeleton-card-number skeleton-shimmer" />
              <div className="skeleton-card-desc skeleton-shimmer" />
              <div className="skeleton-card-pills">
                <div className="skeleton-card-pill skeleton-shimmer" />
                <div className="skeleton-card-pill skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown & Trend Row Skeleton */}
        <div className="grid-cols-12" style={{ marginBottom: '32px' }}>
          {/* Form Breakdown Box */}
          <div className="col-span-8">
            <div className="skeleton-box">
              <div className="skeleton-box-title skeleton-shimmer" style={{ width: '250px' }} />
              <div className="skeleton-box-subtitle skeleton-shimmer" style={{ width: '380px', marginBottom: '32px' }} />
              
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <div className="skeleton-row skeleton-shimmer" style={{ width: '40%', height: '12px' }} />
                  <div className="skeleton-bar-track skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart & Backlog Box */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="skeleton-box" style={{ minHeight: '180px' }}>
              <div className="skeleton-box-title skeleton-shimmer" style={{ width: '150px' }} />
              <div className="skeleton-box-subtitle skeleton-shimmer" style={{ width: '180px' }} />
              <div className="skeleton-row skeleton-shimmer" style={{ height: '90px', marginTop: '16px' }} />
            </div>
            <div className="skeleton-box" style={{ minHeight: '160px' }}>
              <div className="skeleton-box-title skeleton-shimmer" style={{ width: '120px' }} />
              <div className="skeleton-box-subtitle skeleton-shimmer" style={{ width: '150px' }} />
              <div className="skeleton-bar-track skeleton-shimmer" style={{ height: '8px', marginTop: '16px' }} />
            </div>
          </div>
        </div>

        {/* Submissions Log & Taxonomy Matrix Skeleton */}
        <div className="grid-cols-12">
          {/* Submissions Log */}
          <div className="col-span-7">
            <div className="skeleton-box">
              <div className="skeleton-box-title skeleton-shimmer" style={{ width: '200px' }} />
              <div className="skeleton-box-subtitle skeleton-shimmer" style={{ width: '280px', marginBottom: '24px' }} />
              
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-list-item skeleton-shimmer" />
              ))}
            </div>
          </div>

          {/* Taxonomy Matrix */}
          <div className="col-span-5">
            <div className="skeleton-box">
              <div className="skeleton-box-title skeleton-shimmer" style={{ width: '180px' }} />
              <div className="skeleton-box-subtitle skeleton-shimmer" style={{ width: '240px', marginBottom: '24px' }} />
              
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-row skeleton-shimmer" style={{ height: '28px', marginBottom: '12px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="flex-center" style={{ height: '300px', color: 'hsl(var(--text-secondary))' }}>Failed to load dashboard data.</div>;
  }

  const { episodes, mentors, resources, submissions, categories, liveStats } = dashboardData;

  const metricCards = [
    { 
      title: 'Episodes', 
      value: episodes.total, 
      desc: 'Podcast inventory', 
      icon: '🎙️',
      breakdowns: [
        { label: 'Published', value: episodes.published, highlight: true },
        { label: 'Drafts', value: episodes.draft }
      ]
    },
    { 
      title: 'Active Mentors', 
      value: mentors.total, 
      desc: 'Mentoring roster', 
      icon: '👩‍🏫',
      breakdowns: [
        { label: 'Episode', value: mentors.epMentors },
        { label: 'Dedicated', value: mentors.dedicated }
      ]
    },
    { 
      title: 'Resources', 
      value: resources.total, 
      desc: 'Sleek library PDFs', 
      icon: '📄',
      breakdowns: [
        { label: 'Published', value: resources.published, highlight: true },
        { label: 'Drafts', value: resources.draft }
      ]
    },
    { 
      title: 'Submissions', 
      value: submissions.total, 
      desc: 'All form completions', 
      icon: '📩',
      breakdowns: [
        { label: 'New', value: submissions.byStatus.new, highlight: true },
        { label: 'Reviewed', value: submissions.byStatus.reviewed + submissions.byStatus.actioned }
      ]
    },
  ];

  const formsLabels = {
    'ask_guest': { label: 'Ask a Guest', icon: '💬', color: '#a855f7' },
    'suggest_guest': { label: 'Suggest a Guest', icon: '💡', color: '#ec4899' },
    'community': { label: 'Join Community', icon: '🌟', color: '#f97316' },
    'quiz': { label: 'Quiz Results', icon: '🎯', color: '#eab308' },
    'mentorship': { label: 'Mentorship Request', icon: '🌱', color: '#10b981' },
    'guest_apply': { label: 'Be Our Guest', icon: '🎙️', color: '#3b82f6' },
    'mentor_apply': { label: 'Join as Mentor', icon: '🏛️', color: '#6366f1' }
  };

  // Stacked segments logic for backlog bar
  const subTotal = submissions.total || 1;
  const newPct = ((submissions.byStatus.new || 0) / subTotal) * 100;
  const reviewedPct = ((submissions.byStatus.reviewed || 0) / subTotal) * 100;
  const actionedPct = ((submissions.byStatus.actioned || 0) / subTotal) * 100;
  const spamPct = ((submissions.byStatus.spam || 0) / subTotal) * 100;

  // Max value in last 7 days for trend height calculation
  const maxTrend = Math.max(...submissions.last7Days.map(d => d.count), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Welcome to Bold & Brilliant Girls platform manager. Here's a live check on analytics.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ 
              opacity: isRefreshing ? 0.6 : 1, 
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }}
          >
            {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        {metricCards.map((card, i) => (
          <div key={i} className="glass-box hoverable metric-card">
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.title}</span>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '2px', lineHeight: '1.1' }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>{card.desc}</div>
            {card.breakdowns && (
              <div className="card-breakdown">
                {card.breakdowns.map((b, idx) => (
                  <span key={idx} className="sub-pill">
                    {b.label}: <strong className={b.highlight ? 'sub-pill-highlight' : ''}>{b.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-cols-12" style={{ marginBottom: '32px' }}>
        {/* Form submissions breakdown (Col-span-8) */}
        <div className="col-span-8">
          <div className="glass-box" style={{ height: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <div>
                <h2>Submissions by Form Type</h2>
                <p className="subtitle">Breakdown of user interactions and form responses</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setView('submissions')}>Manage Submissions</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {Object.entries(formsLabels).map(([key, formInfo]) => {
                const count = submissions.byFormType[key] || 0;
                const percentage = submissions.total > 0 ? ((count / submissions.total) * 100).toFixed(0) : 0;
                return (
                  <div key={key} className="progress-row">
                    <div className="progress-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{formInfo.icon}</span>
                        <span>{formInfo.label}</span>
                      </span>
                      <span style={{ fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                        {count} <span style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: '500' }}>({percentage}%)</span>
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: formInfo.color,
                          boxShadow: `0 0 8px ${formInfo.color}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart & Backlog (Col-span-4) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Submissions Trend */}
          <div className="glass-box" style={{ flex: 1 }}>
            <h2>Activity (Last 7 Days)</h2>
            <p className="subtitle">Daily submission volume trend</p>
            
            <div className="trend-chart-container">
              {submissions.last7Days.map((dayData, idx) => {
                const barHeight = (dayData.count / maxTrend) * 100;
                return (
                  <div key={idx} className="trend-bar-wrapper">
                    <div 
                      className="trend-bar" 
                      style={{ height: `${Math.max(barHeight, 5)}%` }}
                    >
                      <div className="trend-bar-tooltip">
                        {dayData.count} submissions ({dayData.date})
                      </div>
                    </div>
                    <span className="trend-label">{dayData.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submissions Review Backlog Segment */}
          <div className="glass-box">
            <h2>Review Backlog</h2>
            <p className="subtitle">Audit state of submissions</p>
            
            <div className="stacked-progress-bar">
              {newPct > 0 && <div className="stacked-segment stacked-segment-new" style={{ width: `${newPct}%` }} />}
              {reviewedPct > 0 && <div className="stacked-segment stacked-segment-reviewed" style={{ width: `${reviewedPct}%` }} />}
              {actionedPct > 0 && <div className="stacked-segment stacked-segment-actioned" style={{ width: `${actionedPct}%` }} />}
              {spamPct > 0 && <div className="stacked-segment stacked-segment-spam" style={{ width: `${spamPct}%` }} />}
            </div>

            <div className="status-legend-grid">
              <div className="legend-item">
                <span className="legend-header">
                  <span className="cat-pill" style={{ backgroundColor: 'hsl(var(--new))' }} /> New
                </span>
                <span className="legend-value" style={{ color: 'hsl(var(--new))' }}>{submissions.byStatus.new || 0}</span>
              </div>
              <div className="legend-item">
                <span className="legend-header">
                  <span className="cat-pill" style={{ backgroundColor: 'hsl(var(--info))' }} /> Review
                </span>
                <span className="legend-value" style={{ color: 'hsl(var(--info))' }}>{submissions.byStatus.reviewed || 0}</span>
              </div>
              <div className="legend-item">
                <span className="legend-header">
                  <span className="cat-pill" style={{ backgroundColor: 'hsl(var(--success))' }} /> Done
                </span>
                <span className="legend-value" style={{ color: 'hsl(var(--success))' }}>{submissions.byStatus.actioned || 0}</span>
              </div>
              <div className="legend-item">
                <span className="legend-header">
                  <span className="cat-pill" style={{ backgroundColor: 'hsl(var(--danger))' }} /> Spam
                </span>
                <span className="legend-value" style={{ color: 'hsl(var(--danger))' }}>{submissions.byStatus.spam || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-cols-12">
        {/* Recent Submissions Log (Col-span-7) */}
        <div className="col-span-7">
          <div className="glass-box" style={{ height: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <div>
                <h2>Recent Form Submissions</h2>
                <p className="subtitle">Latest registrations and user feedback entries</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setView('submissions')}>View All</button>
            </div>

            {recentSubs.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No form submissions found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recentSubs.map((sub, idx) => {
                  const lbl = formsLabels[sub.form_type] || { label: sub.form_type, icon: '📄' };
                  return (
                    <div key={idx} className="recent-sub-row">
                      <div className="recent-sub-info">
                        <span style={{ fontSize: '24px', flexShrink: 0 }}>{lbl.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lbl.label}</div>
                          <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub.data?.email || sub.data?.name || 'Anonymous'}>
                            {sub.data?.email || sub.data?.name || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="recent-sub-meta">
                        <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>
                          {new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <select 
                          className={`status-select-inline status-${sub.status}`}
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="actioned">Actioned</option>
                          <option value="spam">Spam</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content taxonomy matrix & Quick Actions (Col-span-5) */}
        <div className="col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Taxonomy matrix */}
          <div className="glass-box" style={{ flex: 1 }}>
            <h2>Content Taxonomy Matrix</h2>
            <p className="subtitle">Database records distribution by topic category</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '16px' }}>
              {categories.map((cat, idx) => (
                <div key={idx} className="matrix-row">
                  <div className="matrix-cat-info">
                    <span 
                      className="cat-pill" 
                      style={{ backgroundColor: cat.color || '#9333ea' }} 
                    />
                    <span style={{ fontWeight: '600' }}>{cat.name}</span>
                  </div>
                  <div className="matrix-stats">
                    <span className="matrix-stat-item">Eps:<strong className="matrix-stat-num">{cat.episodes}</strong></span>
                    <span className="matrix-stat-item">Mentors:<strong className="matrix-stat-num">{cat.mentors}</strong></span>
                    <span className="matrix-stat-item">PDFs:<strong className="matrix-stat-num">{cat.resources}</strong></span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  No categories found.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-box">
            <h2>Quick Actions</h2>
            <p className="subtitle">Platform shortcuts</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }} onClick={() => setView('episodes')}>+ Episode</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }} onClick={() => setView('mentors')}>+ Mentor</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }} onClick={() => setView('resources')}>+ Resource</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }} onClick={() => setView('categories')}>Categories</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. EPISODES VIEW ─────────────────────────────────────────────────
function EpisodesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, loadGlobalLists }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Editor view states
  const [editingEp, setEditingEp] = useState(null); // null means listing. {}/obj means edit/new form.
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const queryStr = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/admin/episodes${queryStr}`);
      setList(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, [search]);

  const handleEditClick = (ep) => {
    setEditingEp(ep);
    setFormData(ep ? {
      ...ep,
      category_id: ep.category_id?._id || ep.category_id || '',
      subcategory_id: ep.subcategory_id?._id || ep.subcategory_id || '',
      specialized_field_id: ep.specialized_field_id?._id || ep.specialized_field_id || '',
      episode_type: ep.episode_type || 'Interview'
    } : {
      title: '', guest_name: '', guest_role: '', guest_photo: '', guest_bio: '', guest_quote: '',
      episode_number: '', category_id: '', subcategory_id: '', specialized_field_id: '', episode_type: 'Interview',
      youtube_id: '', spotify_url: '', audio_url: '', duration: '', description: '', tags: '', is_featured: false, is_new: true,
      is_mentor: false, mentor_rate: '', mentor_avail: '', mentor_linkedin: '', mentor_fields: '', status: 'published'
    });
    setUploadFile(null);
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // YouTube URL extraction helper
  const handleYoutubePasted = (e) => {
    const val = e.target.value;
    let ytId = val;
    if (val.includes('youtu')) {
      const match = val.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        ytId = match[1];
      }
    }
    setFormData(prev => ({ ...prev, youtube_id: ytId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = formData.guest_photo;
      if (uploadFile) {
        photoUrl = await handleFileUpload(uploadFile, apiFetch, showToast);
      }

      const submissionData = {
        ...formData,
        guest_photo: photoUrl
      };

      // Sanitize empty ObjectId fields to null to prevent casting errors in MongoDB
      if (submissionData.category_id === '') submissionData.category_id = null;
      if (submissionData.subcategory_id === '') submissionData.subcategory_id = null;
      if (submissionData.specialized_field_id === '') submissionData.specialized_field_id = null;

      if (formData._id) {
        // Update
        await apiFetch(`/admin/episodes/${formData._id}`, {
          method: 'PUT',
          body: JSON.stringify(submissionData)
        });
        showToast('Episode updated successfully!');
      } else {
        // Create
        await apiFetch('/admin/episodes', {
          method: 'POST',
          body: JSON.stringify(submissionData)
        });
        showToast('New episode published successfully!');
      }
      loadEpisodes();
      loadGlobalLists(); // update dropdown counts
      setEditingEp(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to permanently delete this episode?', async () => {
      try {
        await apiFetch(`/admin/episodes/${id}`, { method: 'DELETE' });
        showToast('Episode deleted successfully.');
        loadEpisodes();
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const getFilteredSubs = () => {
    if (!formData.category_id) return [];
    return subcategories.filter(s => s.category_id === formData.category_id || s.category_id?._id === formData.category_id);
  };

  const getFilteredSpecializedFields = () => {
    if (!formData.subcategory_id) return [];
    return specializedFields.filter(sf => sf.subcategory_id === formData.subcategory_id || sf.subcategory_id?._id === formData.subcategory_id);
  };

  // ── RENDER LISTING
  if (editingEp === null) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Episodes Manager</h1>
            <p className="subtitle">Manage podcast episodes, media URLs, and guests.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleEditClick(false)}>
            <Plus size={16} /> Add New Episode
          </button>
        </div>

        {/* Search */}
        <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '48px' }}
              placeholder="Search episodes by title, guest name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading episodes list...</div>
        ) : list.length === 0 ? (
          <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>🎙️</span>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No episodes found. Click 'Add New Episode' to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Episode</th>
                  <th>Guest</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(ep => (
                  <tr key={ep._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>EP. {ep.episode_number || '—'}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{ep.title}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Duration: {ep.duration || '—'}</span>
                        <span className="badge badge-reviewed" style={{ fontSize: '10px', padding: '1px 6px' }}>{ep.episode_type || 'Interview'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {ep.guest_photo ? (
                          <img src={ep.guest_photo} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                            {(ep.guest_name || 'G').charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '500' }}>{ep.guest_name || '—'}</div>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{ep.guest_role || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="cat-pill" style={{ backgroundColor: ep.category_id?.color || '#ccc' }}></span>
                        <span>{ep.category_id?.icon} {ep.category_id?.name || 'None'}</span>
                      </div>
                      {ep.subcategory_id && (
                        <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', paddingLeft: '18px' }}>&#x21B3; {ep.subcategory_id.name || (typeof ep.subcategory_id === 'object' ? ep.subcategory_id.name : '')}</div>
                      )}
                      {ep.specialized_field_id && (
                        <div style={{ fontSize: '11px', color: 'var(--primary)', paddingLeft: '32px' }}>&#x21B3; {ep.specialized_field_id.name || (typeof ep.specialized_field_id === 'object' ? ep.specialized_field_id.name : '')}</div>
                      )}
                    </td>
                    <td>
                      {ep.is_featured ? (
                        <span className="badge badge-actioned" style={{ padding: '2px 8px', fontSize: '10px' }}>Featured</span>
                      ) : (
                        <span style={{ color: 'hsl(var(--text-muted))', fontSize: '12px' }}>No</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${ep.status === 'published' ? 'badge-actioned' : 'badge-draft'}`}>
                        {ep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(ep)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ep._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER EDITOR / ADD NEW
  return (
    <div>
      <div className="page-header">
        <h1>{formData._id ? 'Edit Episode' : 'Create Episode'}</h1>
        <button className="btn btn-secondary" onClick={() => setEditingEp(null)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-cols-12" style={{ alignItems: 'start' }}>
          {/* Form Main Area */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Episode Details */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Episode Details</h2>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" className="input-field" required name="title"
                  value={formData.title} onChange={handleTextChange} 
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Episode Number</label>
                  <input 
                    type="number" className="input-field" name="episode_number" placeholder="e.g. 1" min="0"
                    value={formData.episode_number} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" className="input-field" name="duration" placeholder="e.g. 18 min"
                    value={formData.duration} onChange={handleTextChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="textarea-field" name="description"
                  value={formData.description} onChange={handleTextChange} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tags (comma separated)</label>
                <input 
                  type="text" className="input-field" name="tags" placeholder="e.g. stem, oxbridge, startup"
                  value={formData.tags} onChange={handleTextChange} 
                />
              </div>
            </div>

            {/* Media URLs */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Media links</h2>
              
              <div className="form-group">
                <label>YouTube Link or Video ID</label>
                <input 
                  type="text" className="input-field" name="youtube_id" placeholder="Paste full YouTube URL or ID"
                  value={formData.youtube_id} onChange={handleYoutubePasted}
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>Pasting a URL will automatically extract the ID.</span>
              </div>

              {formData.youtube_id && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '8px' }}>Thumbnail Preview</label>
                  <img 
                    src={`https://img.youtube.com/vi/${formData.youtube_id}/mqdefault.jpg`} 
                    style={{ borderRadius: 'var(--border-radius-md)', maxWidth: '240px', border: '1px solid hsl(var(--border-color))' }} 
                    alt="" 
                  />
                </div>
              )}

              <div className="grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Spotify URL</label>
                  <input 
                    type="url" className="input-field" name="spotify_url" placeholder="https://open.spotify.com/..."
                    value={formData.spotify_url} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Direct Audio URL</label>
                  <input 
                    type="url" className="input-field" name="audio_url" placeholder="https://..."
                    value={formData.audio_url} onChange={handleTextChange} 
                  />
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Guest Information</h2>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Guest Name</label>
                  <input 
                    type="text" className="input-field" name="guest_name"
                    value={formData.guest_name} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Guest Role / Title</label>
                  <input 
                    type="text" className="input-field" name="guest_role" placeholder="e.g. Entrepreneur · Oxford"
                    value={formData.guest_role} onChange={handleTextChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Guest Photo</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.guest_photo && !uploadFile && (
                    <img src={formData.guest_photo} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--border-color))' }} alt="" />
                  )}
                  {uploadFile && (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                  )}
                  <input 
                    type="file" accept="image/*" id="guest-photo-upload" style={{ display: 'none' }}
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <label htmlFor="guest-photo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    Choose Photo File
                  </label>
                  {uploadFile && <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>{uploadFile.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Guest Bio</label>
                <textarea 
                  className="textarea-field" name="guest_bio"
                  value={formData.guest_bio} onChange={handleTextChange} 
                />
              </div>

              <div className="form-group">
                <label>Guest Quote</label>
                <input 
                  type="text" className="input-field" name="guest_quote" placeholder="e.g. The bravest thing I ever did..."
                  value={formData.guest_quote} onChange={handleTextChange} 
                />
              </div>

              {/* Toggle Mentor Capabilities */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed hsl(var(--border-color))' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: formData.is_mentor ? '20px' : 0 }}>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" name="is_mentor"
                      checked={formData.is_mentor} onChange={handleTextChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>This guest is also available as a Mentor</span>
                </div>

                {formData.is_mentor && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'hsl(var(--bg-dark))', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)' }}>Mentor Details (Shows on Mentorship public page)</h4>
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label>Mentorship Rate</label>
                        <input 
                          type="text" className="input-field" name="mentor_rate" placeholder="e.g. Free / Paid"
                          value={formData.mentor_rate} onChange={handleTextChange} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Availability</label>
                        <input 
                          type="text" className="input-field" name="mentor_avail" placeholder="e.g. Monthly, By request"
                          value={formData.mentor_avail} onChange={handleTextChange} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input 
                        type="url" className="input-field" name="mentor_linkedin" placeholder="https://linkedin.com/in/..."
                        value={formData.mentor_linkedin} onChange={handleTextChange} 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Expertise Areas (comma separated)</label>
                      <input 
                        type="text" className="input-field" name="mentor_fields" placeholder="e.g. Tech, Leadership, STEM"
                        value={formData.mentor_fields} onChange={handleTextChange} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Sidebar Publish settings */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Publish Settings</h2>
              
              <div className="form-group">
                <label>Status</label>
                <select className="select-field" name="status" value={formData.status} onChange={handleTextChange}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" name="is_new"
                    checked={formData.is_new} onChange={handleTextChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Mark as NEW badge</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" name="is_featured"
                    checked={formData.is_featured} onChange={handleTextChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Featured Episode</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={uploading}>
                {uploading ? 'Publishing...' : formData._id ? 'Update Episode' : 'Publish Episode'}
              </button>
            </div>

            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Category & Taxonomy</h2>
              
              <div className="form-group">
                <label>Main Category</label>
                <select 
                  className="select-field" name="category_id"
                  value={formData.category_id || ''} onChange={handleTextChange}
                >
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-category</label>
                <select 
                  className="select-field" name="subcategory_id"
                  value={formData.subcategory_id || ''} onChange={handleTextChange}
                  disabled={!formData.category_id}
                >
                  <option value="">None</option>
                  {getFilteredSubs().map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Specialized Field (Level 3)</label>
                <select 
                  className="select-field" name="specialized_field_id"
                  value={formData.specialized_field_id || ''} onChange={handleTextChange}
                  disabled={!formData.subcategory_id}
                >
                  <option value="">None</option>
                  {getFilteredSpecializedFields().map(sf => (
                    <option key={sf._id} value={sf._id}>{sf.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Episode Type</label>
                <select 
                  className="select-field" name="episode_type"
                  value={formData.episode_type || 'Interview'} onChange={handleTextChange}
                >
                  <option value="Interview">Interview</option>
                  <option value="Solo">Solo</option>
                  <option value="Panel">Panel</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Coaching">Coaching</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── 3. MENTORS VIEW ──────────────────────────────────────────────────
function MentorsView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, episodes }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMentor, setEditingMentor] = useState(null); // null = listing, else form object
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/mentors');
      setList(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const handleEditClick = (mentor) => {
    setEditingMentor(mentor);
    let initialSubId = '';
    if (mentor && mentor.specialized_field_id) {
      const fieldId = mentor.specialized_field_id._id || mentor.specialized_field_id;
      const foundField = specializedFields.find(f => f._id === fieldId);
      if (foundField) {
        initialSubId = foundField.subcategory_id?._id || foundField.subcategory_id || '';
      }
    }
    setFormData(mentor ? {
      ...mentor,
      category_id: mentor.category_id?._id || mentor.category_id || '',
      specialized_field_id: mentor.specialized_field_id?._id || mentor.specialized_field_id || '',
      subcategory_id: initialSubId
    } : {
      name: '', role: '', photo: '', bio: '', quote: '', episode_id: '',
      linkedin: '', expertise_areas: '', rate: '', availability: '', category_id: '',
      subcategory_id: '', specialized_field_id: '', is_featured: false, status: 'published'
    });
    setUploadFile(null);
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getFilteredSubs = () => {
    if (!formData.category_id) return [];
    return subcategories.filter(s => s.category_id === formData.category_id || s.category_id?._id === formData.category_id);
  };

  const getFilteredSpecializedFields = () => {
    if (!formData.subcategory_id) return [];
    return specializedFields.filter(sf => sf.subcategory_id === formData.subcategory_id || sf.subcategory_id?._id === formData.subcategory_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = formData.photo;
      if (uploadFile) {
        photoUrl = await handleFileUpload(uploadFile, apiFetch, showToast);
      }

      const submissionData = {
        ...formData,
        photo: photoUrl
      };

      const { subcategory_id, ...mentorPayload } = submissionData;

      // Sanitize empty ObjectId fields to null to prevent MongoDB casting errors
      if (mentorPayload.category_id === '') mentorPayload.category_id = null;
      if (mentorPayload.specialized_field_id === '') mentorPayload.specialized_field_id = null;
      if (mentorPayload.episode_id === '') mentorPayload.episode_id = null;

      if (formData._id) {
        await apiFetch(`/admin/mentors/${formData._id}`, {
          method: 'PUT',
          body: JSON.stringify(mentorPayload)
        });
        showToast('Dedicated mentor updated!');
      } else {
        await apiFetch('/admin/mentors', {
          method: 'POST',
          body: JSON.stringify(mentorPayload)
        });
        showToast('Dedicated mentor added successfully!');
      }
      loadMentors();
      setEditingMentor(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Delete this dedicated mentor permanently?', async () => {
      try {
        await apiFetch(`/admin/mentors/${id}`, { method: 'DELETE' });
        showToast('Mentor deleted successfully.');
        loadMentors();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  if (editingMentor === null) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dedicated Mentors Manager</h1>
            <p className="subtitle">Manage mentors who are NOT episode guests.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleEditClick(false)}>
            <Plus size={16} /> Add Dedicated Mentor
          </button>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading mentors list...</div>
        ) : list.length === 0 ? (
          <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>👩‍🏫</span>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No dedicated mentors yet. Click 'Add Dedicated Mentor' to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Linked Episode</th>
                  <th>Rate / Avail</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {m.photo ? (
                          <img src={m.photo} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600' }}>{m.name}</div>
                          {m.linkedin && (
                            <a href={m.linkedin} target="_blank" style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              LinkedIn <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{m.role || '—'}</td>
                    <td>
                      <div>{m.category_id?.icon} {m.category_id?.name || '—'}</div>
                      {m.specialized_field_id && (
                        <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>
                          &#x21B3; {m.specialized_field_id.name || (typeof m.specialized_field_id === 'object' ? m.specialized_field_id.name : '')}
                        </div>
                      )}
                    </td>
                    <td>
                      {m.episode_id ? (
                        <div style={{ fontSize: '13px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>EP. {m.episode_id.episode_number}</span> &mdash; {m.episode_id.guest_name}
                        </div>
                      ) : (
                        <span style={{ color: 'hsl(var(--text-muted))', fontSize: '12px' }}>Dedicated (None)</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{m.rate || '—'}</div>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{m.availability || '—'}</span>
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'published' ? 'badge-actioned' : 'badge-draft'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(m)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER EDITOR / ADD
  return (
    <div>
      <div className="page-header">
        <h1>{formData._id ? 'Edit Dedicated Mentor' : 'Add Dedicated Mentor'}</h1>
        <button className="btn btn-secondary" onClick={() => setEditingMentor(null)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-cols-12" style={{ alignItems: 'start' }}>
          
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Mentor Details</h2>
              
              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" className="input-field" name="name" required value={formData.name} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Role / Job Title</label>
                  <input type="text" className="input-field" name="role" placeholder="e.g. Founder, Doctor, CEO" value={formData.role} onChange={handleTextChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Photo</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.photo && !uploadFile && (
                    <img src={formData.photo} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--border-color))' }} alt="" />
                  )}
                  <input 
                    type="file" accept="image/*" id="mentor-photo-upload" style={{ display: 'none' }}
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <label htmlFor="mentor-photo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    Choose Photo File
                  </label>
                  {uploadFile && <span style={{ fontSize: '12px' }}>{uploadFile.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea className="textarea-field" name="bio" value={formData.bio} onChange={handleTextChange} />
              </div>

              <div className="form-group">
                <label>Quote</label>
                <input type="text" className="input-field" name="quote" value={formData.quote} onChange={handleTextChange} />
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label>Rate</label>
                  <input type="text" className="input-field" name="rate" placeholder="e.g. Free / Paid" value={formData.rate} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <input type="text" className="input-field" name="availability" placeholder="e.g. Monthly slots" value={formData.availability} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="url" className="input-field" name="linkedin" placeholder="https://linkedin.com/..." value={formData.linkedin} onChange={handleTextChange} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Expertise Areas (comma separated)</label>
                <input type="text" className="input-field" name="expertise_areas" placeholder="e.g. Law, Startups, Design" value={formData.expertise_areas} onChange={handleTextChange} />
              </div>
            </div>
          </div>

          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Publish Settings</h2>

              <div className="form-group">
                <label>Status</label>
                <select className="select-field" name="status" value={formData.status} onChange={handleTextChange}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="select-field" name="category_id" value={formData.category_id || ''} onChange={handleTextChange}>
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-category</label>
                <select 
                  className="select-field" name="subcategory_id"
                  value={formData.subcategory_id || ''} onChange={handleTextChange}
                  disabled={!formData.category_id}
                >
                  <option value="">None</option>
                  {getFilteredSubs().map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Specialized Field (Level 3)</label>
                <select 
                  className="select-field" name="specialized_field_id"
                  value={formData.specialized_field_id || ''} onChange={handleTextChange}
                  disabled={!formData.subcategory_id}
                >
                  <option value="">None</option>
                  {getFilteredSpecializedFields().map(sf => (
                    <option key={sf._id} value={sf._id}>{sf.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Linked Episode (optional)</label>
                <select className="select-field" name="episode_id" value={formData.episode_id || ''} onChange={handleTextChange}>
                  <option value="">None — dedicated mentor</option>
                  {episodes.map(e => (
                    <option key={e._id} value={e._id}>EP. {e.episode_number} — {e.guest_name}</option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>Link if this person is also an episode guest.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleTextChange} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Featured Mentor</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={uploading}>
                {uploading ? 'Saving...' : formData._id ? 'Update Mentor' : 'Add Dedicated Mentor'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// ── 4. CATEGORIES VIEW ───────────────────────────────────────────────
function CategoriesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, loadGlobalLists }) {
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
  
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ category_id: '', name: '', sort_order: 0 });

  const [editingSfId, setEditingSfId] = useState(null);
  const [sfForm, setSfForm] = useState({ subcategory_id: '', name: '', sort_order: 0 });

  const [expandedCatId, setExpandedCatId] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !expandedCatId) {
      setExpandedCatId(categories[0]._id);
    }
  }, [categories]);

  const scrollToForm = (formId) => {
    setTimeout(() => {
      const el = document.getElementById(formId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Handle Category Submit
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await apiFetch(`/admin/categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(catForm)
        });
        showToast('Category updated!');
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(catForm)
        });
        showToast('Category created!');
      }
      setEditingCatId(null);
      setCatForm({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Handle Subcategory Submit
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubId) {
        await apiFetch(`/admin/subcategories/${editingSubId}`, {
          method: 'PUT',
          body: JSON.stringify(subForm)
        });
        showToast('Sub-category updated!');
      } else {
        await apiFetch('/admin/subcategories', {
          method: 'POST',
          body: JSON.stringify(subForm)
        });
        showToast('Sub-category created!');
      }
      setEditingSubId(null);
      setSubForm({ category_id: '', name: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Handle Specialized Field Submit
  const handleSfSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSfId) {
        await apiFetch(`/admin/specialized-fields/${editingSfId}`, {
          method: 'PUT',
          body: JSON.stringify(sfForm)
        });
        showToast('Specialized field updated!');
      } else {
        await apiFetch('/admin/specialized-fields', {
          method: 'POST',
          body: JSON.stringify(sfForm)
        });
        showToast('Specialized field created!');
      }
      setEditingSfId(null);
      setSfForm({ subcategory_id: '', name: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDeleteCat = async (id) => {
    showConfirm('Delete category and all its nested subcategories permanently?', async () => {
      try {
        await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
        showToast('Category deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const handleDeleteSub = async (id) => {
    showConfirm('Delete this subcategory?', async () => {
      try {
        await apiFetch(`/admin/subcategories/${id}`, { method: 'DELETE' });
        showToast('Sub-category deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const handleDeleteSf = async (id) => {
    showConfirm('Delete this specialized field?', async () => {
      try {
        await apiFetch(`/admin/specialized-fields/${id}`, { method: 'DELETE' });
        showToast('Specialized field deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categories & Sub-categories</h1>
          <p className="subtitle">Manage page taxonomies, filters, color pills, and emojis.</p>
        </div>
      </div>

      <div className="grid-cols-12" style={{ alignItems: 'start' }}>
        {/* Left Side: Listing */}
        <div className="col-span-7">
          <div className="glass-box">
            <h2 style={{ marginBottom: '20px' }}>Taxonomy Tree</h2>
            
            {categories.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '32px 0' }}>No categories found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => {
                  const nested = subcategories.filter(s => s.category_id === cat._id || s.category_id?._id === cat._id);
                  const isExpanded = expandedCatId === cat._id;
                  return (
                    <div key={cat._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'hsl(var(--bg-dark) / 0.5)', padding: '12px 16px', borderRadius: 'var(--border-radius-lg)', border: '1px solid hsl(var(--border-color))', transition: 'var(--transition-smooth)' }}>
                      <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => setExpandedCatId(isExpanded ? null : cat._id)}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', width: '12px', display: 'inline-block' }}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          <span className="cat-pill" style={{ backgroundColor: cat.color, width: '16px', height: '16px' }}></span>
                          <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: isExpanded ? 'hsl(var(--primary))' : 'inherit' }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>({nested.length} subs)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => {
                            setEditingCatId(cat._id);
                            setCatForm({ ...cat });
                            scrollToForm('category-form-container');
                          }}>Edit</button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteCat(cat._id)}>Del</button>
                        </div>
                      </div>
                      
                      {/* Nested subcategories */}
                      {isExpanded && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                          {nested.map(sub => {
                            const fields = specializedFields.filter(f => f.subcategory_id === sub._id || f.subcategory_id?._id === sub._id);
                            return (
                              <div key={sub._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'hsl(var(--bg-card) / 0.3)', borderLeft: '2px solid var(--primary)', marginLeft: '16px', borderRadius: 'var(--border-radius-sm)', marginTop: '4px', padding: '8px 12px' }}>
                                <div className="flex-between" style={{ fontSize: '13px' }}>
                                  <span style={{ fontWeight: '600' }}>{sub.name}</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => {
                                      setEditingSubId(sub._id);
                                      setSubForm({ category_id: sub.category_id?._id || sub.category_id, name: sub.name, sort_order: sub.sort_order });
                                      scrollToForm('subcategory-form-container');
                                    }}>Edit</button>
                                    <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleDeleteSub(sub._id)}>Del</button>
                                  </div>
                                </div>
                                
                                {/* Level 3 Specialized Fields */}
                                {fields.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', paddingLeft: '8px' }}>
                                    {fields.map(f => (
                                      <div key={f._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'hsl(var(--bg-dark) / 0.8)', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>
                                        <span>{f.name}</span>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                          <button style={{ background: 'none', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer', padding: 0 }} onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSfId(f._id);
                                            setSfForm({ subcategory_id: f.subcategory_id?._id || f.subcategory_id, name: f.name, sort_order: f.sort_order });
                                            scrollToForm('sf-form-container');
                                          }} title="Edit Specialized Field">
                                            <Edit size={10} />
                                          </button>
                                          <button style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: 0 }} onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSf(f._id);
                                          }} title="Delete Specialized Field">
                                            <X size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add/Edit Forms */}
        <div className="col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category Form */}
          <div id="category-form-container" className={`glass-box ${editingCatId ? 'editing-active-box' : ''}`}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingCatId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Category <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Category'}
              </h2>
              {editingCatId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingCatId(null);
                  setCatForm({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>
            
            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Name *</label>
                <input 
                  type="text" className="input-field" required 
                  value={catForm.name} onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Icon (Emoji)</label>
                  <input 
                    type="text" className="input-field" maxLength={5}
                    value={catForm.icon} onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Color Picker</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" style={{ width: '48px', height: '40px', border: '1px solid hsl(var(--border-color))', background: 'none', padding: '2px', borderRadius: '4px', cursor: 'pointer' }}
                      value={catForm.color} onChange={(e) => setCatForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{catForm.color}</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <input 
                  type="text" className="input-field" 
                  value={catForm.description} onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={catForm.sort_order} onChange={(e) => setCatForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingCatId ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Subcategory Form */}
          <div id="subcategory-form-container" className={`glass-box ${editingSubId ? 'editing-active-box' : ''}`} style={{ marginBottom: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingSubId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Sub-category <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Sub-category'}
              </h2>
              {editingSubId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingSubId(null);
                  setSubForm({ category_id: '', name: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>

            <form onSubmit={handleSubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parent Category *</label>
                <select 
                  className="select-field" required
                  value={subForm.category_id} onChange={(e) => setSubForm(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sub-category Name *</label>
                <input 
                  type="text" className="input-field" required
                  value={subForm.name} onChange={(e) => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={subForm.sort_order} onChange={(e) => setSubForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingSubId ? 'Update Sub-category' : 'Add Sub-category'}
              </button>
            </form>
          </div>

          {/* Specialized Field Form */}
          <div id="sf-form-container" className={`glass-box ${editingSfId ? 'editing-active-box' : ''}`}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingSfId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Specialized Field <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Specialized Field'}
              </h2>
              {editingSfId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingSfId(null);
                  setSfForm({ subcategory_id: '', name: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>

            <form onSubmit={handleSfSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parent Sub-category *</label>
                <select 
                  className="select-field" required
                  value={sfForm.subcategory_id} onChange={(e) => setSfForm(prev => ({ ...prev, subcategory_id: e.target.value }))}
                >
                  <option value="">Select Sub-category...</option>
                  {categories.map(c => {
                    const subs = subcategories.filter(s => s.category_id === c._id || s.category_id?._id === c._id);
                    if (subs.length === 0) return null;
                    return (
                      <optgroup key={c._id} label={`${c.icon} ${c.name}`}>
                        {subs.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Field Name *</label>
                <input 
                  type="text" className="input-field" required
                  value={sfForm.name} onChange={(e) => setSfForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={sfForm.sort_order} onChange={(e) => setSfForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingSfId ? 'Update Field' : 'Add Field'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5. RESOURCES VIEW ────────────────────────────────────────────────
function ResourcesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRes, setEditingRes] = useState(null); // null = listing, else object
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resourceTypes = {
    'pdf': 'Episode PDF',
    'guide': 'Career Guide',
    'template': 'Template',
    'worksheet': 'Workbook',
    'reading': 'Reading List',
    'toolkit': 'Toolkit',
    'salary': 'Salary Report',
    'script': 'Scripts & Emails'
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/resources');
      setList(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleEditClick = (res) => {
    setEditingRes(res);
    setFormData(res ? {
      ...res,
      category_id: res.category_id?._id || res.category_id || '',
      subcategory_id: res.subcategory_id?._id || res.subcategory_id || '',
      specialized_field_id: res.specialized_field_id?._id || res.specialized_field_id || ''
    } : {
      title: '', description: '', resource_type: 'pdf', category_id: '',
      subcategory_id: '', specialized_field_id: '', episode_ref: '', file_url: '', external_link: '',
      pages: 0, icon: '📄', cover_color: '', is_featured: false, is_coming_soon: true,
      sort_order: 0, status: 'published'
    });
    setUploadFile(null);
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let fileUrl = formData.file_url;
      if (uploadFile) {
        fileUrl = await handleFileUpload(uploadFile, apiFetch, showToast);
      }

      const submissionData = {
        ...formData,
        file_url: fileUrl
      };

      // Sanitize empty ObjectId fields to null to prevent MongoDB casting errors
      if (submissionData.category_id === '') submissionData.category_id = null;
      if (submissionData.subcategory_id === '') submissionData.subcategory_id = null;
      if (submissionData.specialized_field_id === '') submissionData.specialized_field_id = null;
      if (submissionData.episode_ref === '') submissionData.episode_ref = null;

      if (formData._id) {
        await apiFetch(`/admin/resources/${formData._id}`, {
          method: 'PUT',
          body: JSON.stringify(submissionData)
        });
        showToast('Resource updated successfully!');
      } else {
        await apiFetch('/admin/resources', {
          method: 'POST',
          body: JSON.stringify(submissionData)
        });
        showToast('Resource added successfully!');
      }
      loadResources();
      setEditingRes(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Delete this resource permanently?', async () => {
      try {
        await apiFetch(`/admin/resources/${id}`, { method: 'DELETE' });
        showToast('Resource deleted.');
        loadResources();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const getFilteredSubs = () => {
    if (!formData.category_id) return [];
    return subcategories.filter(s => s.category_id === formData.category_id || s.category_id?._id === formData.category_id);
  };

  const getFilteredSpecializedFields = () => {
    if (!formData.subcategory_id) return [];
    return specializedFields.filter(sf => sf.subcategory_id === formData.subcategory_id || sf.subcategory_id?._id === formData.subcategory_id);
  };

  if (editingRes === null) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Resources Manager</h1>
            <p className="subtitle">Manage PDFs, Career Guides, Salary Reports, and tools.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleEditClick(false)}>
            <Plus size={16} /> Add Resource
          </button>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading resources list...</div>
        ) : list.length === 0 ? (
          <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>📚</span>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No resources added yet. Click 'Add Resource' to start.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Ref</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: '600' }}>{r.title}</div>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Pages: {r.pages || '—'} {r.is_coming_soon ? '(Coming Soon)' : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-reviewed" style={{ fontSize: '10px' }}>{resourceTypes[r.resource_type] || r.resource_type}</span>
                    </td>
                    <td>
                      <div>{r.category_id?.icon} {r.category_id?.name || '—'}</div>
                      {r.subcategory_id && (
                        <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', paddingLeft: '18px' }}>&#x21B3; {r.subcategory_id.name || (typeof r.subcategory_id === 'object' ? r.subcategory_id.name : '')}</div>
                      )}
                      {r.specialized_field_id && (
                        <div style={{ fontSize: '11px', color: 'var(--primary)', paddingLeft: '32px' }}>&#x21B3; {r.specialized_field_id.name || (typeof r.specialized_field_id === 'object' ? r.specialized_field_id.name : '')}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '13px' }}>{r.episode_ref || '—'}</td>
                    <td>
                      <span className={`badge ${r.status === 'published' ? 'badge-actioned' : 'badge-draft'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(r)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER EDITOR / ADD
  return (
    <div>
      <div className="page-header">
        <h1>{formData._id ? 'Edit Resource' : 'Add Resource'}</h1>
        <button className="btn btn-secondary" onClick={() => setEditingRes(null)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-cols-12" style={{ alignItems: 'start' }}>
          
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Resource Details</h2>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="input-field" required name="title" value={formData.title} onChange={handleTextChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="textarea-field" name="description" value={formData.description} onChange={handleTextChange} />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Episode Reference</label>
                  <input type="text" className="input-field" name="episode_ref" placeholder="e.g. EP. 01 · Guest Name" value={formData.episode_ref} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Pages Count</label>
                  <input type="number" className="input-field" min={0} name="pages" value={formData.pages} onChange={handleTextChange} />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Emoji Icon</label>
                  <input type="text" className="input-field" maxLength={5} name="icon" value={formData.icon} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Cover Gradient CSS (CSS background)</label>
                  <input type="text" className="input-field" name="cover_color" placeholder="linear-gradient(135deg,#6B21A8,#EC4899)" value={formData.cover_color} onChange={handleTextChange} />
                </div>
              </div>
            </div>

            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>File / Download Link</h2>
              
              <div className="form-group">
                <label>Upload File (PDF/Document)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.file_url && !uploadFile && (
                    <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold' }}>Has file: {formData.file_url.split('/').pop()}</span>
                  )}
                  <input 
                    type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" id="res-file-upload" style={{ display: 'none' }}
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <label htmlFor="res-file-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    Choose File
                  </label>
                  {uploadFile && <span style={{ fontSize: '12px' }}>{uploadFile.name}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>OR External Link URL</label>
                <input type="url" className="input-field" name="external_link" placeholder="https://drive.google.com/..." value={formData.external_link} onChange={handleTextChange} />
              </div>
            </div>
          </div>

          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Publish Settings</h2>

              <div className="form-group">
                <label>Type</label>
                <select className="select-field" name="resource_type" value={formData.resource_type} onChange={handleTextChange}>
                  {Object.entries(resourceTypes).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="select-field" name="category_id" value={formData.category_id || ''} onChange={handleTextChange}>
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-category</label>
                <select 
                  className="select-field" name="subcategory_id" value={formData.subcategory_id || ''} onChange={handleTextChange}
                  disabled={!formData.category_id}
                >
                  <option value="">None</option>
                  {getFilteredSubs().map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Specialized Field (Level 3)</label>
                <select 
                  className="select-field" name="specialized_field_id"
                  value={formData.specialized_field_id || ''} onChange={handleTextChange}
                  disabled={!formData.subcategory_id}
                >
                  <option value="">None</option>
                  {getFilteredSpecializedFields().map(sf => (
                    <option key={sf._id} value={sf._id}>{sf.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select className="select-field" name="status" value={formData.status} onChange={handleTextChange}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleTextChange} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Featured Resource</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_coming_soon" checked={formData.is_coming_soon} onChange={handleTextChange} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Coming Soon (Download locked)</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={uploading}>
                {uploading ? 'Saving...' : formData._id ? 'Update Resource' : 'Publish Resource'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// ── 6. SUBMISSIONS VIEW ──────────────────────────────────────────────
function SubmissionsView({ apiFetch, showToast, onViewDetails }) {
  const [activeTab, setActiveTab] = useState('ask_guest');
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { key: 'ask_guest', label: 'Ask a Guest', icon: '💬' },
    { key: 'suggest_guest', label: 'Suggest a Guest', icon: '💡' },
    { key: 'community', label: 'Community Signups', icon: '🌟' },
    { key: 'quiz', label: 'Quiz Results', icon: '🎯' },
    { key: 'mentorship', label: 'Mentorship Request', icon: '🌱' },
    { key: 'guest_apply', label: 'Be Our Guest', icon: '🎙️' },
    { key: 'mentor_apply', label: 'Join as Mentor', icon: '🏛️' }
  ];

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const q = [
        `tab=${activeTab}`,
        `page=${page}`,
        statusFilter ? `status=${statusFilter}` : '',
        search ? `s=${encodeURIComponent(search)}` : ''
      ].filter(Boolean).join('&');

      const data = await apiFetch(`/admin/submissions?${q}`);
      setList(data.rows);
      setCounts(data.counts);
      setTotalPages(Math.ceil(data.total / 30));
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [activeTab, page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadSubmissions();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiFetch(`/admin/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showToast('Status updated successfully.');
      loadSubmissions();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const getCols = (t) => {
    const mapping = {
      'ask_guest': ['name', 'email', 'question', 'guest_for'],
      'suggest_guest': ['name', 'email', 'field', 'suggestion'],
      'community': ['name', 'email', 'age', 'field', 'dream', 'source'],
      'quiz': ['name', 'email', 'stage', 'result', 'match_pct'],
      'mentorship': ['name', 'email', 'field', 'stage', 'goals', 'urgency', 'session_pref'],
      'guest_apply': ['name', 'email', 'job_title', 'pitch', 'motivation'],
      'mentor_apply': ['name', 'email', 'job_title', 'years_exp', 'expertise', 'hours']
    };
    return mapping[t] || ['name', 'email'];
  };

  const handleExport = (single = true) => {
    const token = localStorage.getItem('bbg_token');
    const url = `${API_BASE}/admin/submissions/export?${single ? `form=${activeTab}` : ''}`;
    
    // Download using standard token authorization in URL or fetch
    // Since browser standard link triggers don't send auth headers, we can fetch, convert to blob, and save
    showToast('Preparing download...', 'info');
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `bbg-export-${single ? activeTab : 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      showToast('Download started!');
    })
    .catch(err => {
      showToast('Export failed', 'danger');
      console.error(err);
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Form Submissions</h1>
          <p className="subtitle">Manage user entries, applications, and feedback.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleExport(false)}>
          <Download size={16} /> Download ALL Forms (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-row">
        {tabs.map(t => (
          <button 
            key={t.key} 
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(t.key);
              setPage(1);
              setSearch('');
              setStatusFilter('');
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span className="badge-pill-count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
        <form onSubmit={handleSearchSubmit} className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <input 
              type="text" className="input-field" placeholder="Search entries..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              className="select-field" style={{ width: '160px' }}
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="actioned">Actioned</option>
              <option value="spam">Spam</option>
            </select>
            
            <button type="button" className="btn btn-secondary" onClick={() => handleExport(true)} style={{ display: 'flex', gap: '6px' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading submission list...</div>
      ) : list.length === 0 ? (
        <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
          <Inbox size={32} style={{ color: 'hsl(var(--text-muted))' }} />
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No submissions found for this form category.</p>
        </div>
      ) : (
        <div>
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {getCols(activeTab).map(c => (
                    <th key={c}>{c.replace('_', ' ')}</th>
                  ))}
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map(row => {
                  const d = row.data || {};
                  return (
                    <tr key={row._id}>
                      <td style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      {getCols(activeTab).map(c => {
                        let cellVal = d[c];
                        if (activeTab === 'quiz') {
                          if (c === 'name' && !cellVal) {
                            cellVal = `${d.firstName || ''} ${d.lastName || ''}`.trim();
                          }
                          if (c === 'result' && !cellVal) {
                            const careerNames = {
                              entrepreneur: 'Entrepreneur & Founder',
                              creative_leader: 'Creative Director & Brand Builder',
                              health_leader: 'Health & Wellness Leader',
                              tech_innovator: 'Tech Innovator & Digital Builder',
                              changemaker: 'Social Changemaker & Advocate',
                              finance_strategist: 'Finance & Investment Strategist',
                              educator_coach: 'Educator, Coach & People Developer',
                              media_journalist: 'Journalist & Media Personality'
                            };
                            const topResult = d.results && d.results[0];
                            cellVal = careerNames[topResult] || topResult || '';
                          }
                          if (c === 'match_pct' && !cellVal) {
                            cellVal = d.results ? '100%' : '';
                          }
                        }
                        if (cellVal === undefined || cellVal === null) {
                          cellVal = '';
                        }
                        return (
                          <td key={c} style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(cellVal)}>
                            {typeof cellVal === 'object' ? JSON.stringify(cellVal) : String(cellVal)}
                          </td>
                        );
                      })}
                      <td>
                        <span className={`badge badge-${row.status}`}>{row.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <select 
                            className="select-field" style={{ padding: '4px 8px', fontSize: '12px', width: '90px' }}
                            value={row.status}
                            onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
                          >
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="actioned">Actioned</option>
                            <option value="spam">Spam</option>
                          </select>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                            title="View Details"
                            onClick={() => onViewDetails(row)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '20px', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 7. STATS VIEW ───────────────────────────────────────────────────
function StatsView({ apiFetch, showToast }) {
  const [stats, setStats] = useState({
    episodes: '', mentors: '', community: '', downloads: '', 
    countries: '', response: '', industries: '', views: '', views_unit: 'M+'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fields = {
    'episodes': { icon: '🎙️', label: 'Episodes', hint: 'Published episodes count' },
    'mentors': { icon: '👩‍🏫', label: 'Mentors', hint: 'Active mentors' },
    'community': { icon: '👥', label: 'Community', hint: 'Community members signups' },
    'downloads': { icon: '📥', label: 'Downloads', hint: 'Total materials downloaded' },
    'countries': { icon: '🌍', label: 'Countries', hint: 'Countries represented' },
    'response': { icon: '⚡', label: 'Response days', hint: 'Average days taken to respond' },
    'industries': { icon: '💼', label: 'Industries', hint: 'Distinct industry categories' },
    'views': { icon: '👀', label: 'Views', hint: 'Platform views' },
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetch('/admin/stats');
        setStats(data);
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/stats', {
        method: 'PUT',
        body: JSON.stringify(stats)
      });
      showToast('Live website statistics saved successfully!');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading stats fields...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Stats Manager</h1>
          <p className="subtitle">Update indicators and numbers displayed on the public landing page.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="glass-box">
          <div className="grid-cols-4" style={{ gap: '20px' }}>
            {Object.entries(fields).map(([key, f]) => (
              <div key={key} className="glass-box" style={{ padding: '16px', background: 'hsl(var(--bg-dark))', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '28px' }}>{f.icon}</span>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>{f.label}</label>
                <input 
                  type="text" className="input-field" name={key}
                  value={stats[key]} onChange={handleChange}
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{f.hint}</span>
              </div>
            ))}
            
            <div className="glass-box" style={{ padding: '16px', background: 'hsl(var(--bg-dark))', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>🔤</span>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Views Unit</label>
              <select 
                className="select-field" name="views_unit"
                value={stats.views_unit} onChange={handleChange}
              >
                <option value="M+">M+</option>
                <option value="K+">K+</option>
                <option value="+">+</option>
              </select>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Suffix placed after the views number</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', minWidth: '180px', height: '44px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Stats'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── 8. SETTINGS VIEW ─────────────────────────────────────────────────
function SettingsView({ apiFetch, showToast }) {
  const [settings, setSettings] = useState({
    bbg_email: '', bbg_email_on_submit: true, bbg_quiz_gate: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch('/admin/settings');
        setSettings(data);
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      showToast('Settings saved.');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading system settings...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Configure platform triggers, email notifications, and quiz policies.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid-cols-12" style={{ alignItems: 'start' }}>
          
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Email Notifications</h2>
              <div className="form-group">
                <label>Recipient Notification Email</label>
                <input 
                  type="email" className="input-field" required
                  value={settings.bbg_email} 
                  onChange={(e) => setSettings(prev => ({ ...prev, bbg_email: e.target.value }))}
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>Form submission alerts are sent here.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.bbg_email_on_submit} 
                    onChange={() => handleToggle('bbg_email_on_submit')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Send email alerts on submission</span>
              </div>
            </div>

            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Quiz Settings</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.bbg_quiz_gate} 
                    onChange={() => handleToggle('bbg_quiz_gate')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Require YouTube subscription to display quiz results</span>
              </div>
            </div>

            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Migrated Public API Endpoints</h2>
              <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '16px' }}>Your frontend HTML pages can hook into these replicated endpoints on this server:</p>
              
              {['stats', 'episodes', 'mentors', 'resources', 'categories'].map(endpoint => (
                <div key={endpoint} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'hsl(var(--bg-dark))', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', fontSize: '13px', marginBottom: '8px' }}>
                  <span className="badge badge-actioned" style={{ padding: '2px 8px', fontSize: '9px' }}>GET</span>
                  <code style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{`/api/${endpoint}`}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-4">
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Save Changes</h2>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// ── 9. CMS MANAGER VIEW ──────────────────────────────────────────────
function CmsView({ apiFetch, showToast }) {
  const [cms, setCms] = useState({
    cms_navbar_logo: '',
    cms_footer_tagline: '',
    cms_footer_social_insta: '',
    cms_footer_social_yt: '',
    cms_footer_privacy_link: '',
    cms_footer_terms_link: '',
    cms_footer_copyright: '',
    cms_hero_eyebrow: '',
    cms_hero_title: '',
    cms_hero_subtitle: '',
    cms_hero_cta_primary_text: '',
    cms_hero_cta_secondary_text: '',
    cms_hero_social_proof: '',
    cms_mission_kicker: '',
    cms_mission_statement: '',
    cms_mission_body: '',
    cms_mission_author: '',
    cms_why_eyebrow: '',
    cms_why_title: '',
    cms_why_subtitle: '',
    cms_why_card1_kicker: '', cms_why_card1_title: '', cms_why_card1_desc: '', cms_why_card1_cta: '',
    cms_why_card2_kicker: '', cms_why_card2_title: '', cms_why_card2_desc: '', cms_why_card2_cta: '',
    cms_why_card3_kicker: '', cms_why_card3_title: '', cms_why_card3_desc: '', cms_why_card3_cta: '',
    cms_why_card4_kicker: '', cms_why_card4_title: '', cms_why_card4_desc: '', cms_why_card4_cta: '',
    cms_about_host_photo: '',
    cms_about_ticker: '',
    cms_about_eyebrow_badge: '',
    cms_about_eyebrow_school: '',
    cms_about_hero_name: '',
    cms_about_hero_desc: '',
    cms_about_story_title: '',
    cms_about_story_body: '',
    cms_about_chapter1_label: '', cms_about_chapter1_title: '', cms_about_chapter1_body: '',
    cms_about_chapter2_label: '', cms_about_chapter2_title: '', cms_about_chapter2_body: '',
    cms_about_chapter3_label: '', cms_about_chapter3_title: '', cms_about_chapter3_body: '',
    cms_about_chapter4_label: '', cms_about_chapter4_title: '', cms_about_chapter4_body: '',
    cms_about_quote_text: '',
    cms_about_quote_attr: '',
    cms_about_pillar1_title: '', cms_about_pillar1_body: '',
    cms_about_pillar2_title: '', cms_about_pillar2_body: '',
    cms_about_pillar3_title: '', cms_about_pillar3_body: '',
    cms_about_hobby1_name: '', cms_about_hobby1_desc: '', cms_about_hobby1_pill: '',
    cms_about_hobby2_name: '', cms_about_hobby2_desc: '', cms_about_hobby2_pill: '',
    cms_about_hobby3_name: '', cms_about_hobby3_desc: '', cms_about_hobby3_pill: '',
    cms_about_player_title: '',
    cms_about_player_sub: '',
    cms_about_listen_title: '',
    cms_about_listen_body: '',
    cms_about_contact_email: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [uploadingField, setUploadingField] = useState('');

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const data = await apiFetch('/admin/cms');
        setCms(prev => ({ ...prev, ...data }));
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchCms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCms(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const url = await handleFileUpload(file, apiFetch, showToast);
      setCms(prev => ({ ...prev, [fieldName]: url }));
      showToast('Image uploaded successfully!');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploadingField('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/cms', {
        method: 'PUT',
        body: JSON.stringify(cms)
      });
      showToast('CMS changes saved successfully!');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading CMS fields...</div>;
  }

  const renderImageUpload = (fieldName, labelText) => (
    <div className="form-group">
      <label>{labelText}</label>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
        {cms[fieldName] ? (
          <img 
            src={cms[fieldName]} 
            alt="Preview" 
            style={{ height: '64px', minWidth: '64px', objectFit: 'contain', borderRadius: 'var(--border-radius-sm)', background: 'hsl(var(--bg-dark))', border: '1px solid hsl(var(--border-color))', padding: '4px' }} 
          />
        ) : (
          <div style={{ height: '64px', width: '64px', borderRadius: 'var(--border-radius-sm)', background: 'hsl(var(--bg-dark))', border: '1px dotted hsl(var(--border-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'hsl(var(--text-muted))' }}>No Image</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '200px' }}>
          <input 
            type="text" className="input-field" name={fieldName} value={cms[fieldName]} onChange={handleChange} 
            placeholder="Or enter image URL manually..." style={{ fontSize: '12px', width: '100%', maxWidth: '320px' }}
          />
          <div>
            <input 
              type="file" accept="image/*" onChange={(e) => handleFileChange(e, fieldName)} 
              style={{ display: 'none' }} id={`file-${fieldName}`}
            />
            <label htmlFor={`file-${fieldName}`} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '6px 12px', display: 'inline-block' }}>
              {uploadingField === fieldName ? 'Uploading...' : 'Upload Image File'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CMS Manager</h1>
          <p className="subtitle">Manage website section copies, imagery, and links dynamically.</p>
        </div>
      </div>

      <div className="tab-row" style={{ marginBottom: '24px' }}>
        <button type="button" className={`tab-btn ${activeSubTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSubTab('general')}>General</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveSubTab('hero')}>Hero Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'mission' ? 'active' : ''}`} onClick={() => setActiveSubTab('mission')}>Mission Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'why' ? 'active' : ''}`} onClick={() => setActiveSubTab('why')}>Why Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'about' ? 'active' : ''}`} onClick={() => setActiveSubTab('about')}>About Page</button>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid-cols-12" style={{ alignItems: 'start', gap: '24px' }}>
          <div className="col-span-8">
            <div className="glass-box">
              {activeSubTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>General &amp; Layout Settings</h2>
                  {renderImageUpload('cms_navbar_logo', 'Navbar Logo')}
                  
                  <div className="form-group">
                    <label>Footer Tagline</label>
                    <textarea className="input-field" name="cms_footer_tagline" value={cms.cms_footer_tagline} onChange={handleChange} rows={3} placeholder="Real Stories. Real Women. Real Possibilities..." />
                  </div>
                  
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Instagram Link</label>
                      <input type="text" className="input-field" name="cms_footer_social_insta" value={cms.cms_footer_social_insta} onChange={handleChange} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="form-group">
                      <label>YouTube Channel Link</label>
                      <input type="text" className="input-field" name="cms_footer_social_yt" value={cms.cms_footer_social_yt} onChange={handleChange} placeholder="https://youtube.com/..." />
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Privacy Policy URL</label>
                      <input type="text" className="input-field" name="cms_footer_privacy_link" value={cms.cms_footer_privacy_link} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Terms of Service URL</label>
                      <input type="text" className="input-field" name="cms_footer_terms_link" value={cms.cms_footer_terms_link} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Footer Copyright Copy</label>
                    <input type="text" className="input-field" name="cms_footer_copyright" value={cms.cms_footer_copyright} onChange={handleChange} placeholder="&copy; 2026 Bold &amp; Brilliant Girls..." />
                  </div>
                </div>
              )}

              {activeSubTab === 'hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Hero Section</h2>
                  
                  <div className="form-group">
                    <label>Hero Eyebrow Copy</label>
                    <input type="text" className="input-field" name="cms_hero_eyebrow" value={cms.cms_hero_eyebrow} onChange={handleChange} placeholder="New Episode Live Now" />
                  </div>

                  <div className="form-group">
                    <label>Hero Title Copy (Allows HTML)</label>
                    <input type="text" className="input-field" name="cms_hero_title" value={cms.cms_hero_title} onChange={handleChange} placeholder="Bold &amp; <em class='gold'>Brilliant</em> Girls" />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Tip: Use <code>&lt;em className="gold"&gt;text&lt;/em&gt;</code> to highlight in gold.</span>
                  </div>

                  <div className="form-group">
                    <label>Hero Subtitle Copy</label>
                    <textarea className="input-field" name="cms_hero_subtitle" value={cms.cms_hero_subtitle} onChange={handleChange} rows={3} placeholder="Real stories from inspiring women..." />
                  </div>

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Primary Button Text</label>
                      <input type="text" className="input-field" name="cms_hero_cta_primary_text" value={cms.cms_hero_cta_primary_text} onChange={handleChange} placeholder="Watch Now" />
                    </div>
                    <div className="form-group">
                      <label>Secondary Button Text</label>
                      <input type="text" className="input-field" name="cms_hero_cta_secondary_text" value={cms.cms_hero_cta_secondary_text} onChange={handleChange} placeholder="Find a Mentor &rarr;" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Social Proof Copy</label>
                    <input type="text" className="input-field" name="cms_hero_social_proof" value={cms.cms_hero_social_proof} onChange={handleChange} placeholder="Loved by 50+ bold women" />
                  </div>
                </div>
              )}

              {activeSubTab === 'mission' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Mission Section</h2>

                  <div className="form-group">
                    <label>Purpose Kicker</label>
                    <input type="text" className="input-field" name="cms_mission_kicker" value={cms.cms_mission_kicker} onChange={handleChange} placeholder="Our Purpose" />
                  </div>

                  <div className="form-group">
                    <label>Blockquote Quote Statement</label>
                    <textarea className="input-field" name="cms_mission_statement" value={cms.cms_mission_statement} onChange={handleChange} rows={4} placeholder="Every young woman deserves to see herself..." />
                  </div>

                  <div className="form-group">
                    <label>Body copy text</label>
                    <textarea className="input-field" name="cms_mission_body" value={cms.cms_mission_body} onChange={handleChange} rows={4} placeholder="We connect ambitious young women..." />
                  </div>

                  <div className="form-group">
                    <label>Author Attribution</label>
                    <input type="text" className="input-field" name="cms_mission_author" value={cms.cms_mission_author} onChange={handleChange} placeholder="— The Bold &amp; Brilliant Girls Team" />
                  </div>
                </div>
              )}

              {activeSubTab === 'why' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Why Section Settings</h2>
                  
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Section Eyebrow</label>
                      <input type="text" className="input-field" name="cms_why_eyebrow" value={cms.cms_why_eyebrow} onChange={handleChange} placeholder="What We Offer" />
                    </div>
                    <div className="form-group">
                      <label>Section Title</label>
                      <input type="text" className="input-field" name="cms_why_title" value={cms.cms_why_title} onChange={handleChange} placeholder="Why Bold &amp; Brilliant Girls?" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <textarea className="input-field" name="cms_why_subtitle" value={cms.cms_why_subtitle} onChange={handleChange} rows={2} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  
                  <h3>Box Card 1: Podcast</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card1_kicker" value={cms.cms_why_card1_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card1_title" value={cms.cms_why_card1_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card1_cta" value={cms.cms_why_card1_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card1_desc" value={cms.cms_why_card1_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 2: Mentorship</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card2_kicker" value={cms.cms_why_card2_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card2_title" value={cms.cms_why_card2_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card2_cta" value={cms.cms_why_card2_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card2_desc" value={cms.cms_why_card2_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 3: Resources</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card3_kicker" value={cms.cms_why_card3_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card3_title" value={cms.cms_why_card3_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card3_cta" value={cms.cms_why_card3_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card3_desc" value={cms.cms_why_card3_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 4: Community</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card4_kicker" value={cms.cms_why_card4_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card4_title" value={cms.cms_why_card4_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card4_cta" value={cms.cms_why_card4_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card4_desc" value={cms.cms_why_card4_desc} onChange={handleChange} rows={2} /></div>
                </div>
              )}

              {activeSubTab === 'about' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>About Page CMS</h2>
                  {renderImageUpload('cms_about_host_photo', 'Host Profile Photo')}

                  <div className="form-group">
                    <label>Moving Marquee Ticker Copy</label>
                    <input type="text" className="input-field" name="cms_about_ticker" value={cms.cms_about_ticker} onChange={handleChange} placeholder="Bold and Brilliant Girls; Podcast for Teens; Dream Boldly..." />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Separate phrases with semicolons (<code>;</code>)</span>
                  </div>

                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Eyebrow Badge</label><input type="text" className="input-field" name="cms_about_eyebrow_badge" value={cms.cms_about_eyebrow_badge} onChange={handleChange} /></div>
                    <div className="form-group"><label>Eyebrow School</label><input type="text" className="input-field" name="cms_about_eyebrow_school" value={cms.cms_about_eyebrow_school} onChange={handleChange} /></div>
                    <div className="form-group"><label>Host Name</label><input type="text" className="input-field" name="cms_about_hero_name" value={cms.cms_about_hero_name} onChange={handleChange} /></div>
                  </div>

                  <div className="form-group">
                    <label>Hero Biography Description</label>
                    <textarea className="input-field" name="cms_about_hero_desc" value={cms.cms_about_hero_desc} onChange={handleChange} rows={3} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Origin Story Section</h3>
                  <div className="form-group">
                    <label>Origin Story Title</label>
                    <input type="text" className="input-field" name="cms_about_story_title" value={cms.cms_about_story_title} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Origin Story Body Copy</label>
                    <textarea className="input-field" name="cms_about_story_body" value={cms.cms_about_story_body} onChange={handleChange} rows={4} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Biography Chapters (1-4)</h3>
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '16px' }}>
                      <h4>Chapter {num}</h4>
                      <div className="grid-cols-2" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Kicker / Label</label><input type="text" className="input-field" name={`cms_about_chapter${num}_label`} value={cms[`cms_about_chapter${num}_label`]} onChange={handleChange} /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name={`cms_about_chapter${num}_title`} value={cms[`cms_about_chapter${num}_title`]} onChange={handleChange} /></div>
                      </div>
                      <div className="form-group"><label>Body Copy</label><textarea className="input-field" name={`cms_about_chapter${num}_body`} value={cms[`cms_about_chapter${num}_body`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Sanah Quote Strip</h3>
                  <div className="form-group">
                    <label>Quote Content</label>
                    <textarea className="input-field" name="cms_about_quote_text" value={cms.cms_about_quote_text} onChange={handleChange} rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Quote Attribution</label>
                    <input type="text" className="input-field" name="cms_about_quote_attr" value={cms.cms_about_quote_attr} onChange={handleChange} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Core Pillars (1-3)</h3>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                      <h4>Pillar {num}</h4>
                      <div className="form-group" style={{ marginBottom: '8px' }}><label>Title</label><input type="text" className="input-field" name={`cms_about_pillar${num}_title`} value={cms[`cms_about_pillar${num}_title`]} onChange={handleChange} /></div>
                      <div className="form-group"><label>Body copy</label><textarea className="input-field" name={`cms_about_pillar${num}_body`} value={cms[`cms_about_pillar${num}_body`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Hobbies &amp; Values (Swimming, Golf, Skiing)</h3>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                      <h4>Hobby {num}</h4>
                      <div className="grid-cols-2" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Name</label><input type="text" className="input-field" name={`cms_about_hobby${num}_name`} value={cms[`cms_about_hobby${num}_name`]} onChange={handleChange} /></div>
                        <div className="form-group"><label>Core Skill Pill</label><input type="text" className="input-field" name={`cms_about_hobby${num}_pill`} value={cms[`cms_about_hobby${num}_pill`]} onChange={handleChange} /></div>
                      </div>
                      <div className="form-group"><label>Description</label><textarea className="input-field" name={`cms_about_hobby${num}_desc`} value={cms[`cms_about_hobby${num}_desc`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Player Card &amp; Contact info</h3>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Player Title</label><input type="text" className="input-field" name="cms_about_player_title" value={cms.cms_about_player_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>Player Subtitle</label><input type="text" className="input-field" name="cms_about_player_sub" value={cms.cms_about_player_sub} onChange={handleChange} /></div>
                  </div>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Listen Header Title</label><input type="text" className="input-field" name="cms_about_listen_title" value={cms.cms_about_listen_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>Contact Email Address</label><input type="email" className="input-field" name="cms_about_contact_email" value={cms.cms_about_contact_email} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Listen Copy Body</label><textarea className="input-field" name="cms_about_listen_body" value={cms.cms_about_listen_body} onChange={handleChange} rows={2} /></div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4">
            <div className="glass-box" style={{ position: 'sticky', top: '24px' }}>
              <h2 style={{ marginBottom: '20px' }}>Publishing</h2>
              <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '20px' }}>Saving changes will write records to the live database, immediately updating content for all website visitors.</p>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={saving}>
                {saving ? 'Publishing...' : 'Publish Content Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
