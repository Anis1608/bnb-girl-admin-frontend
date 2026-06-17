import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';

// Global memory caches for dashboard views to prevent redundant network fetches on tab-switching
let globalDashboardCache = null;
let globalRecentSubsCache = [];

export default function DashboardView({ apiFetch, setView, showToast }) {
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
      globalDashboardCache = data;
      setDashboardData(data);

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
    const originalSubs = [...recentSubs];

    // Optimistically update local submissions state instantly
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

  const { episodes, mentors, resources, submissions, categories } = dashboardData;

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

  const subTotal = submissions.total || 1;
  const newPct = ((submissions.byStatus.new || 0) / subTotal) * 100;
  const reviewedPct = ((submissions.byStatus.reviewed || 0) / subTotal) * 100;
  const actionedPct = ((submissions.byStatus.actioned || 0) / subTotal) * 100;
  const spamPct = ((submissions.byStatus.spam || 0) / subTotal) * 100;

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
