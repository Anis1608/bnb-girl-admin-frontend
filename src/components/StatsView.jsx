import React, { useState, useEffect } from 'react';

export default function StatsView({ apiFetch, showToast }) {
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
