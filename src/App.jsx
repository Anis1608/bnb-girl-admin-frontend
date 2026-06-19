import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Mic, Users, FolderTree, BookOpen, Inbox, BarChart3, 
  Settings as SettingsIcon, LogOut, Plus, Search, Download, Trash2, 
  Edit, Save, Upload, Link, FileText, CheckCircle, AlertCircle, Info, ExternalLink, X, PlusCircle, Check,
  Lock, User, Eye, EyeOff, ShieldCheck, UserCheck
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import EpisodesView from './components/EpisodesView';
import MentorsView from './components/MentorsView';
import MentorRequestsView from './components/MentorRequestsView';
import CategoriesView from './components/CategoriesView';
import ResourcesView from './components/ResourcesView';
import SubmissionsView from './components/SubmissionsView';
import StatsView from './components/StatsView';
import CmsView from './components/CmsView';
import SettingsView from './components/SettingsView';

const API_BASE = 'https://api.bnbgirl.com/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('bbg_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('bbg_username') || '');
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showConfirm = (message, onConfirm, options = {}) => {
    setConfirmConfig({ message, onConfirm, ...options });
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
  const [pendingMentorCount, setPendingMentorCount] = useState(0);

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
      cache: 'no-store',
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

  const loadPendingMentorCount = async () => {
    if (!token) return;
    try {
      const apps = await apiFetch('/admin/mentor-applications');
      const pending = apps.filter(a => a.status === 'pending').length;
      setPendingMentorCount(pending);
    } catch (err) {
      console.error('Error fetching pending mentor count', err);
    }
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

      // Fetch pending mentor applications count
      await loadPendingMentorCount();
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
              <div className="confirm-icon-wrap" style={{
                background: confirmConfig.type === 'success' ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--danger) / 0.15)',
                color: confirmConfig.type === 'success' ? 'hsl(var(--success))' : 'hsl(var(--danger))'
              }}>
                {confirmConfig.type === 'success' ? <Check size={20} /> : <Trash2 size={20} />}
              </div>
              <div className="confirm-title">{confirmConfig.title || 'Are you sure?'}</div>
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
                className={`btn ${confirmConfig.confirmClass || 'btn-danger'}`}
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
              >
                {confirmConfig.confirmText || 'Delete'}
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
          <div className={`menu-item ${activeView === 'mentor-requests' ? 'active' : ''}`} onClick={() => handleViewChange('mentor-requests')}>
            <UserCheck size={18} />
            <span>Mentor Requests</span>
            {pendingMentorCount > 0 && (
              <span className="badge-pill-count" style={{ marginLeft: 'auto', background: 'hsl(var(--danger))', color: '#fff', fontSize: '10px', padding: '2px 6px', minWidth: 'unset', height: 'auto', borderRadius: '10px', fontWeight: 'bold' }}>
                {pendingMentorCount}
              </span>
            )}
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
              <Route path="/mentor-requests" element={<MentorRequestsView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} onRefreshCount={loadPendingMentorCount} />} />
              <Route path="/categories" element={<CategoriesView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} loadGlobalLists={loadGlobalLists} />} />
              <Route path="/resources" element={<ResourcesView apiFetch={apiFetch} showToast={showToast} showConfirm={showConfirm} categories={categories} subcategories={subcategories} specializedFields={specializedFields} />} />
              <Route path="/submissions" element={<SubmissionsView apiFetch={apiFetch} showToast={showToast} onViewDetails={setSelectedSub} />} />
              <Route path="/stats" element={<StatsView apiFetch={apiFetch} showToast={showToast} />} />
              <Route path="/cms" element={<CmsView apiFetch={apiFetch} showToast={showToast} episodes={episodes} />} />
              <Route path="/settings" element={<SettingsView apiFetch={apiFetch} showToast={showToast} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
