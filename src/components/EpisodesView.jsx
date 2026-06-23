import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Check } from 'lucide-react';
import { handleFileUpload } from '../utils/upload';

export default function EpisodesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, loadGlobalLists }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Editor view states
  const [editingEp, setEditingEp] = useState(null); // null means listing. {}/obj means edit/new form.
  const [formData, setFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [pdfUploadFile, setPdfUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const queryStr = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/admin/episodes${queryStr}`);
      setList(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, [search]);

  const handleEditClick = (ep) => {
    setEditingEp(ep);
    setFormData(ep ? {
      ...ep,
      category_id: ep.category_id?._id || ep.category_id || '',
      subcategory_id: ep.subcategory_id?._id || ep.subcategory_id || '',
      specialized_field_id: ep.specialized_field_id?._id || ep.specialized_field_id || '',
      episode_type: ep.episode_type || 'Interview',
      pdf_url: ep.pdf_url || '',
      slots_str: (ep.slots && ep.slots.length > 0) ? ep.slots.join(', ') : '',
      pricing_arr: ep.pricing ? Object.entries(ep.pricing).map(([dur, price]) => ({ dur, price })) : [],
      mentor_meet_link: ep.mentor_meet_link || ''
    } : {
      title: '', guest_name: '', guest_role: '', guest_photo: '', guest_bio: '', guest_quote: '',
      episode_number: '', category_id: '', subcategory_id: '', specialized_field_id: '', episode_type: 'Interview',
      youtube_id: '', spotify_url: '', audio_url: '', pdf_url: '', duration: '', description: '', tags: '', is_featured: false, is_new: true,
      is_mentor: false, mentor_rate: '', mentor_avail: '', mentor_linkedin: '', mentor_fields: '', mentor_meet_link: '', status: 'published',
      slots_str: '', pricing_arr: []
    });
    setUploadFile(null);
    setPdfUploadFile(null);
  };

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // YouTube URL extraction helper
  const handleYoutubePasted = (e) => {
    const val = e.target.value;
    let ytId = val;
    if (val.includes('youtu')) {
      const match = val.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        ytId = match[1];
      }
    }
    setFormData(prev => ({ ...prev, youtube_id: ytId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = formData.guest_photo;
      if (uploadFile) {
        photoUrl = await handleFileUpload(uploadFile, showToast);
      }

      let pdfUrl = formData.pdf_url;
      if (pdfUploadFile) {
        pdfUrl = await handleFileUpload(pdfUploadFile, showToast);
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
        guest_photo: photoUrl,
        pdf_url: pdfUrl,
        slots,
        pricing,
        durs: durs.length > 0 ? durs : (formData.durs || ['30', '60'])
      };

      // Sanitize empty slots_str and pricing_arr fields that are not in DB schema
      delete submissionData.slots_str;
      delete submissionData.pricing_arr;

      // Sanitize empty ObjectId fields to null to prevent casting errors in MongoDB
      if (submissionData.category_id === '') submissionData.category_id = null;
      if (submissionData.subcategory_id === '') submissionData.subcategory_id = null;
      if (submissionData.specialized_field_id === '') submissionData.specialized_field_id = null;

      if (formData._id) {
        // Update
        await apiFetch(`/admin/episodes/${formData._id}`, {
          method: 'PUT',
          body: JSON.stringify(submissionData)
        });
        showToast('Episode updated successfully!');
      } else {
        // Create
        await apiFetch('/admin/episodes', {
          method: 'POST',
          body: JSON.stringify(submissionData)
        });
        showToast('New episode published successfully!');
      }
      loadEpisodes();
      loadGlobalLists(); // update dropdown counts
      setEditingEp(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to permanently delete this episode?', async () => {
      try {
        await apiFetch(`/admin/episodes/${id}`, { method: 'DELETE' });
        showToast('Episode deleted successfully.');
        loadEpisodes();
        loadGlobalLists();
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

  // RENDER LISTING
  if (editingEp === null) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Episodes Manager</h1>
            <p className="subtitle">Manage podcast episodes, media URLs, and guests.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleEditClick(false)}>
            <Plus size={16} /> Add New Episode
          </button>
        </div>

        {/* Search */}
        <div className="glass-box" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '48px' }}
              placeholder="Search episodes by title, guest name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading episodes list...</div>
        ) : list.length === 0 ? (
          <div className="glass-box" style={{ padding: '64px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>🎙️</span>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '12px' }}>No episodes found. Click 'Add New Episode' to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Episode</th>
                  <th>Guest</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(ep => (
                  <tr key={ep._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>EP. {ep.episode_number || '—'}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{ep.title}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Duration: {ep.duration || '—'}</span>
                        <span className="badge badge-reviewed" style={{ fontSize: '10px', padding: '1px 6px' }}>{ep.episode_type || 'Interview'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {ep.guest_photo ? (
                          <img src={ep.guest_photo} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                            {(ep.guest_name || 'G').charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '500' }}>{ep.guest_name || '—'}</div>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{ep.guest_role || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="cat-pill" style={{ backgroundColor: ep.category_id?.color || '#ccc' }}></span>
                        <span>{ep.category_id?.icon} {ep.category_id?.name || 'None'}</span>
                      </div>
                      {ep.subcategory_id && (
                        <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', paddingLeft: '18px' }}>&#x21B3; {ep.subcategory_id.name || (typeof ep.subcategory_id === 'object' ? ep.subcategory_id.name : '')}</div>
                      )}
                      {ep.specialized_field_id && (
                        <div style={{ fontSize: '11px', color: 'var(--primary)', paddingLeft: '32px' }}>&#x21B3; {ep.specialized_field_id.name || (typeof ep.specialized_field_id === 'object' ? ep.specialized_field_id.name : '')}</div>
                      )}
                    </td>
                    <td>
                      {ep.is_featured ? (
                        <span className="badge badge-actioned" style={{ padding: '2px 8px', fontSize: '10px' }}>Featured</span>
                      ) : (
                        <span style={{ color: 'hsl(var(--text-muted))', fontSize: '12px' }}>No</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${ep.status === 'published' ? 'badge-actioned' : 'badge-draft'}`}>
                        {ep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(ep)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ep._id)}>
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

  // RENDER EDITOR / ADD NEW
  return (
    <div>
      <div className="page-header">
        <h1>{formData._id ? 'Edit Episode' : 'Create Episode'}</h1>
        <button className="btn btn-secondary" onClick={() => setEditingEp(null)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-cols-12" style={{ alignItems: 'start' }}>
          {/* Form Main Area */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Episode Details */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Episode Details</h2>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" className="input-field" required name="title"
                  value={formData.title} onChange={handleTextChange} 
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Episode Number</label>
                  <input 
                    type="number" className="input-field" name="episode_number" placeholder="e.g. 1" min="0"
                    value={formData.episode_number} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" className="input-field" name="duration" placeholder="e.g. 18 min"
                    value={formData.duration} onChange={handleTextChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="textarea-field" name="description"
                  value={formData.description} onChange={handleTextChange} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tags (comma separated)</label>
                <input 
                  type="text" className="input-field" name="tags" placeholder="e.g. stem, oxbridge, startup"
                  value={formData.tags} onChange={handleTextChange} 
                />
              </div>
            </div>

            {/* Media URLs */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Media links</h2>
              
              <div className="form-group">
                <label>YouTube Link or Video ID</label>
                <input 
                  type="text" className="input-field" name="youtube_id" placeholder="Paste full YouTube URL or ID"
                  value={formData.youtube_id || ''} onChange={handleYoutubePasted}
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>Pasting a URL will automatically extract the ID.</span>
              </div>

              {formData.youtube_id && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '8px' }}>Thumbnail Preview</label>
                  <img 
                    src={`https://img.youtube.com/vi/${formData.youtube_id}/mqdefault.jpg`} 
                    style={{ borderRadius: 'var(--border-radius-md)', maxWidth: '240px', border: '1px solid hsl(var(--border-color))' }} 
                    alt="" 
                  />
                </div>
              )}

              <div className="grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Spotify URL</label>
                  <input 
                    type="url" className="input-field" name="spotify_url" placeholder="https://open.spotify.com/..."
                    value={formData.spotify_url || ''} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Direct Audio URL</label>
                  <input 
                    type="url" className="input-field" name="audio_url" placeholder="https://..."
                    value={formData.audio_url || ''} onChange={handleTextChange} 
                  />
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Guest Information</h2>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label>Guest Name</label>
                  <input 
                    type="text" className="input-field" name="guest_name"
                    value={formData.guest_name || ''} onChange={handleTextChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Guest Role / Title</label>
                  <input 
                    type="text" className="input-field" name="guest_role" placeholder="e.g. Entrepreneur · Oxford"
                    value={formData.guest_role || ''} onChange={handleTextChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Guest Photo</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.guest_photo && !uploadFile && (
                    <img src={formData.guest_photo} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--border-color))' }} alt="" />
                  )}
                  {uploadFile && (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                  )}
                  <input 
                    type="file" accept="image/*" id="guest-photo-upload" style={{ display: 'none' }}
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <label htmlFor="guest-photo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    Choose Photo File
                  </label>
                  {uploadFile && <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>{uploadFile.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Guest PDF / Career Guide</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {formData.pdf_url && !pdfUploadFile && (
                    <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent)', textDecoration: 'underline' }}>
                      <FileText size={16} /> View Current PDF
                    </a>
                  )}
                  {pdfUploadFile && (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                  )}
                  <input 
                    type="file" accept=".pdf" id="guest-pdf-upload" style={{ display: 'none' }}
                    onChange={(e) => setPdfUploadFile(e.target.files[0])}
                  />
                  <label htmlFor="guest-pdf-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    Choose PDF File
                  </label>
                  {pdfUploadFile && <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>{pdfUploadFile.name}</span>}
                </div>
                <input 
                  type="text" className="input-field" name="pdf_url" placeholder="Or paste PDF url manually..."
                  value={formData.pdf_url || ''} onChange={handleTextChange}
                  style={{ marginTop: '8px', fontSize: '12px' }}
                />
              </div>

              <div className="form-group">
                <label>Guest Bio</label>
                <textarea 
                  className="textarea-field" name="guest_bio"
                  value={formData.guest_bio || ''} onChange={handleTextChange} 
                />
              </div>

              <div className="form-group">
                <label>Guest Quote</label>
                <input 
                  type="text" className="input-field" name="guest_quote" placeholder="e.g. The bravest thing I ever did..."
                  value={formData.guest_quote || ''} onChange={handleTextChange} 
                />
              </div>

              {/* Toggle Mentor Capabilities */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed hsl(var(--border-color))' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: formData.is_mentor ? '20px' : 0 }}>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" name="is_mentor"
                      checked={formData.is_mentor || false} onChange={handleTextChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>This guest is also available as a Mentor</span>
                </div>

                {formData.is_mentor && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'hsl(var(--bg-dark))', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)' }}>Mentor Details (Shows on Mentorship public page)</h4>
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label>Mentorship Rate</label>
                        <input 
                          type="text" className="input-field" name="mentor_rate" placeholder="e.g. Free / Paid"
                          value={formData.mentor_rate || ''} onChange={handleTextChange} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Availability</label>
                        <input 
                          type="text" className="input-field" name="mentor_avail" placeholder="e.g. Monthly, By request"
                          value={formData.mentor_avail || ''} onChange={handleTextChange} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input 
                        type="url" className="input-field" name="mentor_linkedin" placeholder="https://linkedin.com/in/..."
                        value={formData.mentor_linkedin || ''} onChange={handleTextChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Personal Meeting Link (Google Meet / Zoom / Calendly / Teams)</label>
                      <input 
                        type="url" className="input-field" name="mentor_meet_link" placeholder="e.g. https://meet.google.com/... or https://zoom.us/..."
                        value={formData.mentor_meet_link || ''} onChange={handleTextChange} 
                      />
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>If provided, bookings for this mentor will bypass the auto-generator and use this custom link.</span>
                    </div>
                    <div className="form-group">
                      <label>Expertise Areas (comma separated)</label>
                      <input 
                        type="text" className="input-field" name="mentor_fields" placeholder="e.g. Tech, Leadership, STEM"
                        value={formData.mentor_fields || ''} onChange={handleTextChange} 
                      />
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
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
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
                )}
              </div>
            </div>
          </div>

          {/* Form Sidebar Publish settings */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Publish Settings</h2>
              
              <div className="form-group">
                <label>Status</label>
                <select className="select-field" name="status" value={formData.status} onChange={handleTextChange}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" name="is_new"
                    checked={formData.is_new || false} onChange={handleTextChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Mark as NEW badge</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" name="is_featured"
                    checked={formData.is_featured || false} onChange={handleTextChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Featured Episode</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={uploading}>
                {uploading ? 'Publishing...' : formData._id ? 'Update Episode' : 'Publish Episode'}
              </button>
            </div>

            <div className="glass-box">
              <h2 style={{ marginBottom: '20px' }}>Category & Taxonomy</h2>
              
              <div className="form-group">
                <label>Main Category</label>
                <select 
                  className="select-field" name="category_id"
                  value={formData.category_id || ''} onChange={handleTextChange}
                >
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Episode Type</label>
                <select 
                  className="select-field" name="episode_type"
                  value={formData.episode_type || 'Interview'} onChange={handleTextChange}
                >
                  <option value="Interview">Interview</option>
                  <option value="Solo">Solo</option>
                  <option value="Panel">Panel</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Coaching">Coaching</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
