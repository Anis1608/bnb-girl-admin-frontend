import React, { useState, useEffect } from 'react';

export default function SettingsView({ apiFetch, showToast }) {
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
