import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { handleFileUpload } from '../utils/upload';

export default function ResourcesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields }) {
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
        fileUrl = await handleFileUpload(uploadFile, showToast);
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
