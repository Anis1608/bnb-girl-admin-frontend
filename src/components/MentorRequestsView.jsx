import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';

export default function MentorRequestsView({ apiFetch, showToast, showConfirm, onRefreshCount }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null); // for detail modal

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/mentor-applications');
      setApplications(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleAccept = (app) => {
    showConfirm(
      `Are you sure you want to ACCEPT ${app.name} as a mentor? This will make their profile live and send them an approval email.`, 
      async () => {
        try {
          const res = await apiFetch(`/admin/mentor-applications/${app._id}/accept`, {
            method: 'PUT'
          });
          showToast('Application accepted successfully!', 'success');
          loadApplications();
          if (onRefreshCount) onRefreshCount();
        } catch (err) {
          showToast(err.message, 'danger');
        }
      },
      {
        title: 'Accept Application',
        confirmText: 'Accept & Publish',
        confirmClass: 'btn-primary',
        type: 'success'
      }
    );
  };

  const handleReject = (app) => {
    showConfirm(
      `Are you sure you want to REJECT ${app.name}'s mentor application? This will send them a polite rejection email.`, 
      async () => {
        try {
          const res = await apiFetch(`/admin/mentor-applications/${app._id}/reject`, {
            method: 'PUT'
          });
          showToast('Application rejected.', 'info');
          loadApplications();
          if (onRefreshCount) onRefreshCount();
        } catch (err) {
          showToast(err.message, 'danger');
        }
      },
      {
        title: 'Reject Application',
        confirmText: 'Reject Application',
        confirmClass: 'btn-danger',
        type: 'danger'
      }
    );
  };

  const handleDelete = (app) => {
    showConfirm(`Are you sure you want to DELETE this application record for ${app.name}? This will permanently remove it from the database.`, async () => {
      try {
        await apiFetch(`/admin/mentor-applications/${app._id}`, {
          method: 'DELETE'
        });
        showToast('Application deleted.', 'success');
        loadApplications();
        if (onRefreshCount) onRefreshCount();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  // Filter and search applications
  const filteredApps = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = 
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.role && app.role.toLowerCase().includes(search.toLowerCase())) ||
      (app.organisation && app.organisation.toLowerCase().includes(search.toLowerCase())) ||
      (app.expertise && app.expertise.toLowerCase().includes(search.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge badge-success" style={{ background: 'hsl(var(--success) / 0.15)', color: 'hsl(var(--success))', border: '1px solid hsl(var(--success) / 0.3)' }}>Accepted</span>;
      case 'rejected':
        return <span className="badge badge-danger" style={{ background: 'hsl(var(--danger) / 0.15)', color: 'hsl(var(--danger))', border: '1px solid hsl(var(--danger) / 0.3)' }}>Rejected</span>;
      case 'pending':
      default:
        return <span className="badge badge-warning" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))', border: '1px solid hsl(var(--warning) / 0.3)' }}>Pending</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Page Applications</h1>
          <p className="subtitle">Review and approve applications to become a registered mentor.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-row" style={{ marginBottom: '24px' }}>
        {[
          { key: 'pending', label: 'Pending Requests', count: applications.filter(a => a.status === 'pending').length },
          { key: 'accepted', label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length },
          { key: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
          { key: 'all', label: 'All Applications', count: applications.length }
        ].map(t => (
          <button 
            key={t.key} 
            className={`tab-btn ${statusFilter === t.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(t.key)}
          >
            <span>{t.label}</span>
            <span className="badge-pill-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <input 
            type="text" className="input-field" placeholder="Search applications by name, email, role, company..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: 'hsl(var(--bg-dark) / 0.2)', border: '1px solid hsl(var(--border-color))', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', color: 'hsl(var(--text-main))' }}
          />
          {search && (
            <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear</button>
          )}
        </div>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>📨</span>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No mentor applications found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredApps.map(app => (
            <div key={app._id} className="glass-box" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {app.photo ? (
                  <img src={app.photo} alt={app.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                    {app.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.role} {app.organisation ? `at ${app.organisation}` : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                    {app.years_exp ? `${app.years_exp} yrs experience` : ''}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid hsl(var(--border-color))', borderBottom: '1px solid hsl(var(--border-color))', padding: '12px 0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Email:</strong> <a href={`mailto:${app.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{app.email}</a></div>
                {app.linkedin && (
                  <div>
                    <strong>LinkedIn:</strong> <a href={app.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Profile <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {app.expertise && (
                  <div>
                    <strong>Expertise:</strong> <span style={{ color: 'hsl(var(--text-secondary))' }}>{app.expertise}</span>
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                  Applied: {new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Bio / About:</strong>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'hsl(var(--text-muted))', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.bio}
                </p>
              </div>

              {app.motivation && (
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Why mentor?</strong>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'hsl(var(--text-muted))', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {app.motivation}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(app)} style={{ marginRight: 'auto' }}>
                  View Details
                </button>
                
                {app.status === 'pending' && (
                  <>
                    <button className="btn btn-secondary btn-sm" style={{ border: '1px solid hsl(var(--danger) / 0.4)', color: 'hsl(var(--danger))' }} onClick={() => handleReject(app)}>
                      Reject
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(app)}>
                      Accept
                    </button>
                  </>
                )}

                {app.status !== 'pending' && (
                  <button className="btn btn-secondary btn-sm" style={{ color: 'hsl(var(--danger))' }} onClick={() => handleDelete(app)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing full application details */}
      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="glass-box" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {selectedApp.photo ? (
                  <img src={selectedApp.photo} alt={selectedApp.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {selectedApp.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedApp.name}</h2>
                  <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>
                    {selectedApp.role} {selectedApp.organisation ? `at ${selectedApp.organisation}` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', background: 'hsl(var(--bg-dark) / 0.3)', padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
              <div><strong>Status:</strong> {getStatusBadge(selectedApp.status)}</div>
              <div><strong>Experience:</strong> {selectedApp.years_exp ? `${selectedApp.years_exp} years` : 'N/A'}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selectedApp.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{selectedApp.email}</a></div>
              <div><strong>LinkedIn:</strong> {selectedApp.linkedin ? <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Profile <ExternalLink size={12} /></a> : 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Expertise Areas:</strong> {selectedApp.expertise || 'None'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Submitted:</strong> {new Date(selectedApp.created_at).toLocaleString()}</div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Bio / Background:</strong>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-muted))', whiteSpace: 'pre-wrap' }}>
                {selectedApp.bio}
              </p>
            </div>

            {selectedApp.motivation && (
              <div>
                <strong style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Motivation for Mentoring:</strong>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-muted))', whiteSpace: 'pre-wrap' }}>
                  {selectedApp.motivation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                Close Details
              </button>
              
              {selectedApp.status === 'pending' && (
                <>
                  <button className="btn btn-secondary" style={{ border: '1px solid hsl(var(--danger) / 0.4)', color: 'hsl(var(--danger))' }} onClick={() => { handleReject(selectedApp); setSelectedApp(null); }}>
                    Reject
                  </button>
                  <button className="btn btn-primary" onClick={() => { handleAccept(selectedApp); setSelectedApp(null); }}>
                    Accept &amp; Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
