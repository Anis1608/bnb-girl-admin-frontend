import React, { useState, useEffect } from 'react';
import { Download, Inbox, Eye } from 'lucide-react';
import { API_BASE } from '../utils/upload';

export default function SubmissionsView({ apiFetch, showToast, onViewDetails }) {
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
