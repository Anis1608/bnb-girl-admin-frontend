import React, { useState, useEffect } from 'react';
import { Edit, X } from 'lucide-react';

export default function CategoriesView({ apiFetch, showToast, showConfirm, categories, subcategories, specializedFields, loadGlobalLists }) {
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
  
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ category_id: '', name: '', sort_order: 0 });

  const [editingSfId, setEditingSfId] = useState(null);
  const [sfForm, setSfForm] = useState({ subcategory_id: '', name: '', sort_order: 0 });

  const [expandedCatId, setExpandedCatId] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !expandedCatId) {
      setExpandedCatId(categories[0]._id);
    }
  }, [categories]);

  const scrollToForm = (formId) => {
    setTimeout(() => {
      const el = document.getElementById(formId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Handle Category Submit
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await apiFetch(`/admin/categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(catForm)
        });
        showToast('Category updated!');
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(catForm)
        });
        showToast('Category created!');
      }
      setEditingCatId(null);
      setCatForm({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Handle Subcategory Submit
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubId) {
        await apiFetch(`/admin/subcategories/${editingSubId}`, {
          method: 'PUT',
          body: JSON.stringify(subForm)
        });
        showToast('Sub-category updated!');
      } else {
        await apiFetch('/admin/subcategories', {
          method: 'POST',
          body: JSON.stringify(subForm)
        });
        showToast('Sub-category created!');
      }
      setEditingSubId(null);
      setSubForm({ category_id: '', name: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Handle Specialized Field Submit
  const handleSfSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSfId) {
        await apiFetch(`/admin/specialized-fields/${editingSfId}`, {
          method: 'PUT',
          body: JSON.stringify(sfForm)
        });
        showToast('Specialized field updated!');
      } else {
        await apiFetch('/admin/specialized-fields', {
          method: 'POST',
          body: JSON.stringify(sfForm)
        });
        showToast('Specialized field created!');
      }
      setEditingSfId(null);
      setSfForm({ subcategory_id: '', name: '', sort_order: 0 });
      loadGlobalLists();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDeleteCat = async (id) => {
    showConfirm('Delete category and all its nested subcategories permanently?', async () => {
      try {
        await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
        showToast('Category deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const handleDeleteSub = async (id) => {
    showConfirm('Delete this subcategory?', async () => {
      try {
        await apiFetch(`/admin/subcategories/${id}`, { method: 'DELETE' });
        showToast('Sub-category deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  const handleDeleteSf = async (id) => {
    showConfirm('Delete this specialized field?', async () => {
      try {
        await apiFetch(`/admin/specialized-fields/${id}`, { method: 'DELETE' });
        showToast('Specialized field deleted.');
        loadGlobalLists();
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categories & Sub-categories</h1>
          <p className="subtitle">Manage page taxonomies, filters, color pills, and emojis.</p>
        </div>
      </div>

      <div className="grid-cols-12" style={{ alignItems: 'start' }}>
        {/* Left Side: Listing */}
        <div className="col-span-7">
          <div className="glass-box">
            <h2 style={{ marginBottom: '20px' }}>Taxonomy Tree</h2>
            
            {categories.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '32px 0' }}>No categories found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => {
                  const nested = subcategories.filter(s => s.category_id === cat._id || s.category_id?._id === cat._id);
                  const isExpanded = expandedCatId === cat._id;
                  return (
                    <div key={cat._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'hsl(var(--bg-dark) / 0.5)', padding: '12px 16px', borderRadius: 'var(--border-radius-lg)', border: '1px solid hsl(var(--border-color))', transition: 'var(--transition-smooth)' }}>
                      <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => setExpandedCatId(isExpanded ? null : cat._id)}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', width: '12px', display: 'inline-block' }}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          <span className="cat-pill" style={{ backgroundColor: cat.color, width: '16px', height: '16px' }}></span>
                          <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: isExpanded ? 'hsl(var(--primary))' : 'inherit' }}>{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>({nested.length} subs)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => {
                            setEditingCatId(cat._id);
                            setCatForm({ ...cat });
                            scrollToForm('category-form-container');
                          }}>Edit</button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteCat(cat._id)}>Del</button>
                        </div>
                      </div>
                      
                      {/* Nested subcategories */}
                      {isExpanded && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                          {nested.map(sub => {
                            const fields = specializedFields.filter(f => f.subcategory_id === sub._id || f.subcategory_id?._id === sub._id);
                            return (
                              <div key={sub._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'hsl(var(--bg-card) / 0.3)', borderLeft: '2px solid var(--primary)', marginLeft: '16px', borderRadius: 'var(--border-radius-sm)', marginTop: '4px', padding: '8px 12px' }}>
                                <div className="flex-between" style={{ fontSize: '13px' }}>
                                  <span style={{ fontWeight: '600' }}>{sub.name}</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => {
                                      setEditingSubId(sub._id);
                                      setSubForm({ category_id: sub.category_id?._id || sub.category_id, name: sub.name, sort_order: sub.sort_order });
                                      scrollToForm('subcategory-form-container');
                                    }}>Edit</button>
                                    <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleDeleteSub(sub._id)}>Del</button>
                                  </div>
                                </div>
                                
                                {/* Level 3 Specialized Fields */}
                                {fields.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', paddingLeft: '8px' }}>
                                    {fields.map(f => (
                                      <div key={f._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'hsl(var(--bg-dark) / 0.8)', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>
                                        <span>{f.name}</span>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                          <button style={{ background: 'none', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer', padding: 0 }} onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSfId(f._id);
                                            setSfForm({ subcategory_id: f.subcategory_id?._id || f.subcategory_id, name: f.name, sort_order: f.sort_order });
                                            scrollToForm('sf-form-container');
                                          }} title="Edit Specialized Field">
                                            <Edit size={10} />
                                          </button>
                                          <button style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: 0 }} onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSf(f._id);
                                          }} title="Delete Specialized Field">
                                            <X size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add/Edit Forms */}
        <div className="col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category Form */}
          <div id="category-form-container" className={`glass-box ${editingCatId ? 'editing-active-box' : ''}`}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingCatId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Category <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Category'}
              </h2>
              {editingCatId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingCatId(null);
                  setCatForm({ name: '', color: '#9333EA', icon: '📚', description: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>
            
            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Name *</label>
                <input 
                  type="text" className="input-field" required 
                  value={catForm.name} onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Icon (Emoji)</label>
                  <input 
                    type="text" className="input-field" maxLength={5}
                    value={catForm.icon} onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Color Picker</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" style={{ width: '48px', height: '40px', border: '1px solid hsl(var(--border-color))', background: 'none', padding: '2px', borderRadius: '4px', cursor: 'pointer' }}
                      value={catForm.color} onChange={(e) => setCatForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{catForm.color}</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <input 
                  type="text" className="input-field" 
                  value={catForm.description} onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={catForm.sort_order} onChange={(e) => setCatForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingCatId ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Subcategory Form */}
          <div id="subcategory-form-container" className={`glass-box ${editingSubId ? 'editing-active-box' : ''}`} style={{ marginBottom: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingSubId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Sub-category <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Sub-category'}
              </h2>
              {editingSubId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingSubId(null);
                  setSubForm({ category_id: '', name: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>

            <form onSubmit={handleSubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parent Category *</label>
                <select 
                  className="select-field" required
                  value={subForm.category_id} onChange={(e) => setSubForm(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sub-category Name *</label>
                <input 
                  type="text" className="input-field" required
                  value={subForm.name} onChange={(e) => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={subForm.sort_order} onChange={(e) => setSubForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingSubId ? 'Update Sub-category' : 'Add Sub-category'}
              </button>
            </form>
          </div>

          {/* Specialized Field Form */}
          <div id="sf-form-container" className={`glass-box ${editingSfId ? 'editing-active-box' : ''}`}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2>
                {editingSfId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✏️ Edit Specialized Field <span className="editing-badge">Active</span>
                  </span>
                ) : 'Add Specialized Field'}
              </h2>
              {editingSfId && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setEditingSfId(null);
                  setSfForm({ subcategory_id: '', name: '', sort_order: 0 });
                }}>Cancel</button>
              )}
            </div>

            <form onSubmit={handleSfSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parent Sub-category *</label>
                <select 
                  className="select-field" required
                  value={sfForm.subcategory_id} onChange={(e) => setSfForm(prev => ({ ...prev, subcategory_id: e.target.value }))}
                >
                  <option value="">Select Sub-category...</option>
                  {categories.map(c => {
                    const subs = subcategories.filter(s => s.category_id === c._id || s.category_id?._id === c._id);
                    if (subs.length === 0) return null;
                    return (
                      <optgroup key={c._id} label={`${c.icon} ${c.name}`}>
                        {subs.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Field Name *</label>
                <input 
                  type="text" className="input-field" required
                  value={sfForm.name} onChange={(e) => setSfForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sort Order</label>
                <input 
                  type="number" className="input-field" min={0}
                  value={sfForm.sort_order} onChange={(e) => setSfForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingSfId ? 'Update Field' : 'Add Field'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
