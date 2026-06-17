import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { handleFileUpload } from '../utils/upload';

export default function MentorsView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, episodes }) {
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
      subcategory_id: initialSubId,
      slots_str: (mentor.slots && mentor.slots.length > 0) ? mentor.slots.join(', ') : '',
      pricing_arr: mentor.pricing ? Object.entries(mentor.pricing).map(([dur, price]) => ({ dur, price })) : []
    } : {
      name: '', role: '', photo: '', bio: '', quote: '', episode_id: '',
      linkedin: '', expertise_areas: '', rate: '', availability: '', category_id: '',
      subcategory_id: '', specialized_field_id: '', is_featured: false, status: 'published',
      slots_str: '', pricing_arr: []
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
        photoUrl = await handleFileUpload(uploadFile, showToast);
      }

      const slots = typeof formData.slots_str === 'string'
        ? formData.slots_str.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.slots || []);

      const pricing = {};
      (formData.pricing_arr || []).forEach(item => {
        if (item.dur && item.price) {
          pricing[item.dur] = item.price;
        }
      });
      const durs = Object.keys(pricing).sort((a, b) => parseInt(a) - parseInt(b));

      const submissionData = {
        ...formData,
        photo: photoUrl,
        slots,
        pricing,
        durs: durs.length > 0 ? durs : (formData.durs || ['30', '60'])
      };

      const { subcategory_id, ...mentorPayload } = submissionData;

      // Sanitize empty slots_str and pricing_arr fields that are not in DB schema
      delete mentorPayload.slots_str;
      delete mentorPayload.pricing_arr;

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
                            <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
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

  // RENDER EDITOR / ADD
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
                  <input type="text" className="input-field" name="name" required value={formData.name || ''} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Role / Job Title</label>
                  <input type="text" className="input-field" name="role" placeholder="e.g. Founder, Doctor, CEO" value={formData.role || ''} onChange={handleTextChange} />
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
                <textarea className="textarea-field" name="bio" value={formData.bio || ''} onChange={handleTextChange} />
              </div>

              <div className="form-group">
                <label>Quote</label>
                <input type="text" className="input-field" name="quote" value={formData.quote || ''} onChange={handleTextChange} />
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label>Rate</label>
                  <input type="text" className="input-field" name="rate" placeholder="e.g. Free / Paid" value={formData.rate || ''} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <input type="text" className="input-field" name="availability" placeholder="e.g. Monthly slots" value={formData.availability || ''} onChange={handleTextChange} />
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="url" className="input-field" name="linkedin" placeholder="https://linkedin.com/..." value={formData.linkedin || ''} onChange={handleTextChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Expertise Areas (comma separated)</label>
                <input type="text" className="input-field" name="expertise_areas" placeholder="e.g. Law, Startups, Design" value={formData.expertise_areas || ''} onChange={handleTextChange} />
              </div>

              {/* Custom Slots Config */}
              <div className="form-group">
                <label>Available Slots (comma-separated times)</label>
                <input 
                  type="text" className="input-field" name="slots_str" placeholder="e.g. 09:00, 09:30, 10:00, 11:30, 14:00"
                  value={formData.slots_str || ''} onChange={handleTextChange} 
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>Leave empty to use defaults (09:00 - 16:30 slots).</span>
              </div>

              {/* Pricing & Durations List */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', justifyStyle: 'space-between', alignItems: 'center', fontWeight: '600' }}>
                  <span>Custom Pricing by Duration</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '12px', height: 'auto' }}
                    onClick={() => {
                      const current = formData.pricing_arr || [];
                      setFormData(prev => ({
                        ...prev,
                        pricing_arr: [...current, { dur: '', price: '' }]
                      }));
                    }}
                  >
                    + Add Rate Option
                  </button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {(formData.pricing_arr || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        className="input-field"
                        style={{ flex: 1 }}
                        placeholder="Duration (minutes) e.g. 30"
                        value={item.dur}
                        onChange={(e) => {
                          const list = [...formData.pricing_arr];
                          list[idx].dur = e.target.value;
                          setFormData(prev => ({ ...prev, pricing_arr: list }));
                        }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        style={{ flex: 1 }}
                        placeholder="Price e.g. $20"
                        value={item.price}
                        onChange={(e) => {
                          const list = [...formData.pricing_arr];
                          list[idx].price = e.target.value;
                          setFormData(prev => ({ ...prev, pricing_arr: list }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '8px 12px' }}
                        onClick={() => {
                          const list = (formData.pricing_arr || []).filter((_, i) => i !== idx);
                          setFormData(prev => ({ ...prev, pricing_arr: list }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(formData.pricing_arr || []).length === 0 && (
                    <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                      No custom rates added. Standard calculations ($20 for 30m, $36 for 60m) will apply.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Publish Settings</h2>

              <div className="form-group">
                <label>Status</label>
                <select className="select-field" name="status" value={formData.status || 'published'} onChange={handleTextChange}>
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
                  <input type="checkbox" name="is_featured" checked={formData.is_featured || false} onChange={handleTextChange} />
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
