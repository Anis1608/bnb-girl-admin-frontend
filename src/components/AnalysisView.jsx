import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, DollarSign, Calendar, RefreshCw, Search, Clock, ShieldAlert, CheckCircle2, User, HelpCircle, ToggleLeft
} from 'lucide-react';

export default function AnalysisView({ apiFetch, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'mentors', 'revenue'
  
  // Roster Filters
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [sessionMentor, setSessionMentor] = useState('');
  
  // Mentor Availability Filters
  const [mentorSearch, setMentorSearch] = useState('');

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

  const { 
    totalSessions = 0, 
    totalEarnings = 0, 
    mentorsBreakdown = [], 
    allSessions = [], 
    mentorsAvailability = [] 
  } = data || {};

  // Find top earning mentor
  const topMentor = mentorsBreakdown.length > 0 ? mentorsBreakdown[0] : null;

  // Filtered Sessions Roster
  const filteredSessions = allSessions.filter(s => {
    const matchesSearch = 
      s.student_name.toLowerCase().includes(sessionSearch.trim().toLowerCase()) ||
      s.student_email.toLowerCase().includes(sessionSearch.trim().toLowerCase()) ||
      s.mentor_name.toLowerCase().includes(sessionSearch.trim().toLowerCase());
    const matchesStatus = !sessionStatus || s.calculated_status === sessionStatus;
    const matchesMentor = !sessionMentor || s.mentor_name === sessionMentor;
    return matchesSearch && matchesStatus && matchesMentor;
  });

  // Filtered Mentors Availability & Performance
  const filteredMentors = mentorsAvailability.filter(m => 
    m.name.toLowerCase().includes(mentorSearch.trim().toLowerCase())
  );

  // Extract unique mentor names from sessions list for dropdowns
  const uniqueMentorNames = Array.from(new Set(allSessions.map(s => s.mentor_name))).sort();

  // Helper status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <span className="badge badge-info" style={{ fontWeight: 'bold' }}>Upcoming</span>;
      case 'completed':
        return <span className="badge badge-actioned" style={{ fontWeight: 'bold' }}>Completed</span>;
      case 'cancelled':
        return <span className="badge badge-draft" style={{ fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>Cancelled</span>;
      case 'reschedule_requested':
        return <span className="badge badge-new" style={{ fontWeight: 'bold', background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24' }}>Reschedule Requested</span>;
      default:
        return <span className="badge badge-new">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mentorship Session Dashboard</h1>
          <p className="subtitle">Track booked sessions, scheduling timelines, mentor status counts, and available hours.</p>
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
          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>Total sessions scheduled in the database</div>
        </div>

        <div className="glass-box hoverable metric-card">
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Value Generated</span>
            <span style={{ fontSize: '20px' }}><DollarSign size={20} style={{ color: '#10b981' }} /></span>
          </div>
          <div style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: '800', marginBottom: '2px', lineHeight: '1.1' }}>${totalEarnings}</div>
          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.2' }}>Revenue logged across mentorship ledger</div>
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

      {/* Tabs Menu */}
      <div className="tab-row" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <span>🗓️</span>
          <span>Booked Sessions Roster ({allSessions.length})</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <span>👩‍🏫</span>
          <span>Mentor Availability & Stats ({mentorsAvailability.length})</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <span>📈</span>
          <span>Mentor Business Rankings</span>
        </button>
      </div>

      {/* TAB 1: SESSIONS ROSTER */}
      {activeTab === 'sessions' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="input-with-icon-wrapper" style={{ flex: 2, minWidth: '240px', marginBottom: 0 }}>
                <span className="input-icon-left"><Search size={16} /></span>
                <input 
                  type="text" className="input-field input-field-with-icon" 
                  placeholder="Search by student or mentor name..."
                  value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>

              <select 
                className="select-field" style={{ flex: 1, minWidth: '150px' }}
                value={sessionStatus} onChange={(e) => setSessionStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="reschedule_requested">Reschedule Requested</option>
              </select>

              <select 
                className="select-field" style={{ flex: 1, minWidth: '150px' }}
                value={sessionMentor} onChange={(e) => setSessionMentor(e.target.value)}
              >
                <option value="">All Mentors</option>
                {uniqueMentorNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass-box">
            <h2>Booked Sessions List</h2>
            <p className="subtitle" style={{ marginBottom: '20px' }}>Comprehensive record of student and mentor session coordinates.</p>

            {filteredSessions.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                <Calendar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>No booked sessions found matching your filters.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Session Date & Time</th>
                      <th>Student</th>
                      <th>Mentor</th>
                      <th>Duration</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map(session => (
                      <tr key={session.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} style={{ color: 'hsl(var(--primary))' }} />
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#fff' }}>{session.date}</div>
                              <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>at {session.time}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{session.student_name}</div>
                          <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{session.student_email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'hsl(var(--primary-light))' }}>{session.mentor_name}</div>
                        </td>
                        <td>{session.duration} mins</td>
                        <td style={{ fontWeight: 'bold', color: session.amount.toLowerCase().includes('free') ? 'hsl(var(--text-muted))' : '#10b981' }}>
                          {session.amount}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {getStatusBadge(session.calculated_status)}
                            {session.calculated_status === 'reschedule_requested' && session.reschedule_request && (
                              <span style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(234,179,8,0.1)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                Proposal: {session.reschedule_request.date} at {session.reschedule_request.time}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MENTOR AVAILABILITY & STATS */}
      {activeTab === 'mentors' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}>
              <div className="input-with-icon-wrapper" style={{ flex: 1, marginBottom: 0 }}>
                <span className="input-icon-left"><Search size={16} /></span>
                <input 
                  type="text" className="input-field input-field-with-icon" 
                  placeholder="Search mentor by name..."
                  value={mentorSearch} onChange={(e) => setMentorSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mentors Grid / Table */}
          <div className="glass-box">
            <h2>Mentor Performance & Availability Directory</h2>
            <p className="subtitle" style={{ marginBottom: '20px' }}>Realtime active schedules, availability settings, and session status aggregates.</p>

            {filteredMentors.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>No mentors found matching your filters.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Mentor Name</th>
                      <th>Type</th>
                      <th>Slots Configuration</th>
                      <th>Stat Summary (Sessions)</th>
                      <th>Current Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentors.map(m => {
                      // Get stats from mentorsBreakdown if available
                      const performanceObj = mentorsBreakdown.find(b => b.mentor_name.toLowerCase() === m.name.toLowerCase()) || {
                        sessions_count: 0,
                        upcoming_count: 0,
                        completed_count: 0,
                        cancelled_count: 0,
                        reschedule_pending_count: 0
                      };

                      return (
                        <tr key={m.name}>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '15px' }}>{m.name}</div>
                            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Status: {m.status}</span>
                          </td>
                          <td>
                            <span style={{ 
                              fontSize: '11px', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              fontWeight: '600',
                              background: m.source === 'dedicated' ? 'rgba(147, 51, 234, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: m.source === 'dedicated' ? '#d8b4fe' : '#93c5fd'
                            }}>
                              {m.source === 'dedicated' ? 'Dedicated' : 'Guest Mentor'}
                            </span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '280px' }}>
                              <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>DEFAULT SLOTS ({m.slots.length}):</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                {m.slots.map(s => {
                                  const isBusy = m.busy.includes(s);
                                  return (
                                    <span 
                                      key={s} 
                                      style={{ 
                                        fontSize: '10px', 
                                        padding: '1px 5px', 
                                        borderRadius: '3px',
                                        background: isBusy ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                                        color: isBusy ? '#f87171' : '#e5e7eb',
                                        textDecoration: isBusy ? 'line-through' : 'none'
                                      }}
                                    >
                                      {s}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                              <div><strong>Total Booked:</strong> {performanceObj.sessions_count || 0}</div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#93c5fd' }}>📅 {performanceObj.upcoming_count || 0} Up</span>
                                <span style={{ color: '#34d399' }}>✓ {performanceObj.completed_count || 0} Done</span>
                                <span style={{ color: '#f87171' }}>✕ {performanceObj.cancelled_count || 0} Cancel</span>
                              </div>
                              {performanceObj.reschedule_pending_count > 0 && (
                                <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '600' }}>
                                  ⏳ {performanceObj.reschedule_pending_count} reschedule request pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{m.availability}</span>
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
      )}

      {/* TAB 3: BUSINESS RANKINGS */}
      {activeTab === 'revenue' && (
        <div className="glass-box">
          <h2 style={{ marginBottom: '8px' }}>Mentor Performance Rankings</h2>
          <p className="subtitle" style={{ marginBottom: '20px' }}>Rankings of registered mentors based on total mentorship session revenues generated.</p>

          {mentorsBreakdown.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No revenue data recorded yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Mentor Name</th>
                    <th>Sessions Booked</th>
                    <th>Total Revenue</th>
                    <th>Avg. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorsBreakdown.map((mentor, index) => {
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
      )}
    </div>
  );
}
