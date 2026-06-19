import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, Calendar, RefreshCw, Search } from 'lucide-react';

export default function AnalysisView({ apiFetch, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalysis = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiFetch('/admin/analytics/mentorship');
      setData(res);
    } catch (err) {
      showToast(err.message || 'Failed to load analytics.', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px', color: 'hsl(var(--text-secondary))' }}>
        <RefreshCw className="spin" size={24} style={{ marginRight: '8px' }} />
        <span>Loading mentorship analytics...</span>
      </div>
    );
  }

  const { totalSessions = 0, totalEarnings = 0, mentorsBreakdown = [] } = data || {};

  // Find top earning mentor
  const topMentor = mentorsBreakdown.length > 0 ? mentorsBreakdown[0] : null;

  // Filter breakdown list based on search query
  const filteredMentors = mentorsBreakdown.filter(m =>
    m.mentor_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mentorship Analytics</h1>
          <p className="subtitle">Track booked mentorship sessions, revenue generated, and individual mentor performance.</p>
        </div>
        <div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => loadAnalysis(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw className={refreshing ? 'spin' : ''} size={14} />
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '24px', gap: '20px' }}>
        <div className="glass-box hoverable metric-card">
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sessions Booked</span>
            <span style={{ fontSize: '20px' }}><Calendar size={20} style={{ color: 'hsl(var(--primary))' }} /></span>
          </div>
          <div style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '2px', lineHeight: '1.1' }}>{totalSessions}</div>
          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>Total sessions scheduled by students</div>
        </div>

        <div className="glass-box hoverable metric-card">
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Money Generated</span>
            <span style={{ fontSize: '20px' }}><DollarSign size={20} style={{ color: '#10b981' }} /></span>
          </div>
          <div style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '2px', lineHeight: '1.1' }}>${totalEarnings}</div>
          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>Gross revenue before standard gateway fees</div>
        </div>

        <div className="glass-box hoverable metric-card">
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Performing Mentor</span>
            <span style={{ fontSize: '20px' }}><BarChart3 size={20} style={{ color: '#eab308' }} /></span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '4px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topMentor ? topMentor.mentor_name : 'No sessions booked'}>
            {topMentor ? topMentor.mentor_name : 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>
            {topMentor ? `Generated $${topMentor.earnings} (${topMentor.sessions_count} sessions)` : 'No session earnings recorded yet'}
          </div>
        </div>
      </div>

      {/* Search Filter Box */}
      <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
          <div className="input-with-icon-wrapper" style={{ flex: 1, marginBottom: 0 }}>
            <span className="input-icon-left">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              className="input-field input-field-with-icon" 
              placeholder="Search mentor by name..."
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Mentor Performance Breakdown Table */}
      <div className="glass-box">
        <h2 style={{ marginBottom: '8px' }}>Mentor Performance Rankings</h2>
        <p className="subtitle" style={{ marginBottom: '20px' }}>List of all registered mentors and their total mentorship business metrics.</p>

        {filteredMentors.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No mentors found matching your search.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Mentor Name</th>
                  <th>Sessions Booked</th>
                  <th>Total Revenue Generated</th>
                  <th>Avg. Earnings Per Session</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.map((mentor, index) => {
                  const avgEarnings = mentor.sessions_count > 0 
                    ? (mentor.earnings / mentor.sessions_count).toFixed(2) 
                    : '0.00';
                  
                  return (
                    <tr key={mentor.mentor_id}>
                      <td style={{ fontWeight: 'bold', width: '80px' }}>
                        {index + 1} {index === 0 && '👑'}
                      </td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>
                        {mentor.mentor_name}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 'bold' }}>
                          {mentor.sessions_count} sessions
                        </span>
                      </td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>
                        ${mentor.earnings}
                      </td>
                      <td style={{ color: 'hsl(var(--text-secondary))' }}>
                        ${avgEarnings}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
