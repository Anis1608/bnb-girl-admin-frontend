import React, { useState, useEffect } from 'react';
import { handleFileUpload } from '../utils/upload';

export default function CmsView({ apiFetch, showToast, episodes }) {
  const [cms, setCms] = useState({
    cms_navbar_logo: '',
    cms_footer_tagline: '',
    cms_footer_social_insta: '',
    cms_footer_social_yt: '',
    cms_footer_privacy_link: '',
    cms_footer_terms_link: '',
    cms_footer_copyright: '',
    cms_hero_eyebrow: '',
    cms_hero_title: '',
    cms_hero_subtitle: '',
    cms_hero_cta_primary_text: '',
    cms_hero_cta_secondary_text: '',
    cms_hero_social_proof: '',
    cms_mission_kicker: '',
    cms_mission_statement: '',
    cms_mission_body: '',
    cms_mission_author: '',
    cms_why_eyebrow: '',
    cms_why_title: '',
    cms_why_subtitle: '',
    cms_why_card1_kicker: '', cms_why_card1_title: '', cms_why_card1_desc: '', cms_why_card1_cta: '',
    cms_why_card2_kicker: '', cms_why_card2_title: '', cms_why_card2_desc: '', cms_why_card2_cta: '',
    cms_why_card3_kicker: '', cms_why_card3_title: '', cms_why_card3_desc: '', cms_why_card3_cta: '',
    cms_why_card4_kicker: '', cms_why_card4_title: '', cms_why_card4_desc: '', cms_why_card4_cta: '',
    cms_about_host_photo: '',
    cms_about_ticker: '',
    cms_about_eyebrow_badge: '',
    cms_about_eyebrow_school: '',
    cms_about_hero_name: '',
    cms_about_hero_desc: '',
    cms_about_story_title: '',
    cms_about_story_body: '',
    cms_about_chapter1_label: '', cms_about_chapter1_title: '', cms_about_chapter1_body: '',
    cms_about_chapter2_label: '', cms_about_chapter2_title: '', cms_about_chapter2_body: '',
    cms_about_chapter3_label: '', cms_about_chapter3_title: '', cms_about_chapter3_body: '',
    cms_about_chapter4_label: '', cms_about_chapter4_title: '', cms_about_chapter4_body: '',
    cms_about_quote_text: '',
    cms_about_quote_attr: '',
    cms_about_pillar1_title: '', cms_about_pillar1_body: '',
    cms_about_pillar2_title: '', cms_about_pillar2_body: '',
    cms_about_pillar3_title: '', cms_about_pillar3_body: '',
    cms_about_hobby1_name: '', cms_about_hobby1_desc: '', cms_about_hobby1_pill: '',
    cms_about_hobby2_name: '', cms_about_hobby2_desc: '', cms_about_hobby2_pill: '',
    cms_about_hobby3_name: '', cms_about_hobby3_desc: '', cms_about_hobby3_pill: '',
    cms_about_player_title: '',
    cms_about_player_sub: '',
    cms_about_listen_title: '',
    cms_about_listen_body: '',
    cms_about_contact_email: '',
    // Series Collections
    cms_series_stem_title: '', cms_series_stem_epcount: '', cms_series_stem_category: '', cms_series_stem_youtube: '', cms_series_stem_percentage: '',
    cms_series_entrepreneurship_title: '', cms_series_entrepreneurship_epcount: '', cms_series_entrepreneurship_category: '', cms_series_entrepreneurship_youtube: '', cms_series_entrepreneurship_percentage: '',
    cms_series_mental_title: '', cms_series_mental_epcount: '', cms_series_mental_category: '', cms_series_mental_youtube: '', cms_series_mental_percentage: '',
    cms_series_law_title: '', cms_series_law_epcount: '', cms_series_law_category: '', cms_series_law_youtube: '', cms_series_law_percentage: '',
    cms_series_creative_title: '', cms_series_creative_epcount: '', cms_series_creative_category: '', cms_series_creative_youtube: '', cms_series_creative_percentage: '',
    cms_series_finance_title: '', cms_series_finance_epcount: '', cms_series_finance_category: '', cms_series_finance_youtube: '', cms_series_finance_percentage: '',
    // Spotlight
    cms_spotlight_mentor_id: '',
    // Resources page titles & stats
    cms_resources_hero_eyebrow: '',
    cms_resources_hero_title: '',
    cms_resources_hero_subtitle: '',
    cms_resources_stat_resources_num: '',
    cms_resources_stat_resources_lbl: '',
    cms_resources_stat_pdfs_num: '',
    cms_resources_stat_pdfs_lbl: '',
    cms_resources_stat_fields_num: '',
    cms_resources_stat_fields_lbl: '',
    cms_resources_stat_templates_num: '',
    cms_resources_stat_templates_lbl: '',
    // Resources page types explainer & coming soon
    cms_resources_types_kicker: '',
    cms_resources_types_title: '',
    cms_resources_type_pdf_desc: '',
    cms_resources_type_guide_desc: '',
    cms_resources_type_template_desc: '',
    cms_resources_type_worksheet_desc: '',
    cms_resources_type_reading_desc: '',
    cms_resources_type_toolkit_desc: '',
    cms_resources_type_salary_desc: '',
    cms_resources_type_script_desc: '',
    cms_resources_coming_kicker: '',
    cms_resources_coming_title: '',
    cms_resources_coming_subtitle: '',
    cms_resources_coming_card1_icon: '',
    cms_resources_coming_card1_title: '',
    cms_resources_coming_card1_desc: '',
    cms_resources_coming_card1_tag: '',
    cms_resources_coming_card1_notify: '',
    cms_resources_coming_card2_icon: '',
    cms_resources_coming_card2_title: '',
    cms_resources_coming_card2_desc: '',
    cms_resources_coming_card2_tag: '',
    cms_resources_coming_card2_notify: '',
    cms_resources_coming_card3_icon: '',
    cms_resources_coming_card3_title: '',
    cms_resources_coming_card3_desc: '',
    cms_resources_coming_card3_tag: '',
    cms_resources_coming_card3_notify: '',
    cms_resources_coming_card4_icon: '',
    cms_resources_coming_card4_title: '',
    cms_resources_coming_card4_desc: '',
    cms_resources_coming_card4_tag: '',
    cms_resources_coming_card4_notify: '',
    // Mentorship Page CMS
    cms_mentor_hero_badge: '',
    cms_mentor_hero_title: '',
    cms_mentor_hero_subtitle1: '',
    cms_mentor_hero_subtitle2: '',
    cms_mentor_hero_podcast_text: '',
    cms_mentor_hero_metric1_val: '',
    cms_mentor_hero_metric1_lbl: '',
    cms_mentor_hero_metric2_val: '',
    cms_mentor_hero_metric2_lbl: '',
    cms_mentor_hero_metric3_val: '',
    cms_mentor_hero_metric3_lbl: '',
    cms_mentor_hero_metric4_val: '',
    cms_mentor_hero_metric4_lbl: '',
    cms_mentor_ticker: '',
    cms_mentor_list_title: '',
    cms_mentor_list_quiz_lbl: '',
    cms_mentor_stories_eyebrow: '',
    cms_mentor_stories_title: '',
    cms_mentor_stories_subtitle: '',
    cms_mentor_stories_trust1_val: '',
    cms_mentor_stories_trust1_lbl: '',
    cms_mentor_stories_trust2_val: '',
    cms_mentor_stories_trust2_lbl: '',
    cms_mentor_stories_trust3_val: '',
    cms_mentor_stories_trust3_lbl: '',
    cms_mentor_story1_quote: '',
    cms_mentor_story1_outcome: '',
    cms_mentor_story1_author: '',
    cms_mentor_story1_title: '',
    cms_mentor_story1_via: '',
    cms_mentor_story2_quote: '',
    cms_mentor_story2_outcome: '',
    cms_mentor_story2_author: '',
    cms_mentor_story2_title: '',
    cms_mentor_story2_via: '',
    cms_mentor_story3_quote: '',
    cms_mentor_story3_outcome: '',
    cms_mentor_story3_author: '',
    cms_mentor_story3_title: '',
    cms_mentor_story3_via: '',
    cms_mentor_companies_title: '',
    cms_mentor_companies_list: '',
    cms_mentor_why_eyebrow: '',
    cms_mentor_why_title: '',
    cms_mentor_why_subtitle: '',
    cms_mentor_why_stat1_val: '',
    cms_mentor_why_stat1_lbl: '',
    cms_mentor_why_stat1_sub: '',
    cms_mentor_why_stat2_val: '',
    cms_mentor_why_stat2_lbl: '',
    cms_mentor_why_stat2_sub: '',
    cms_mentor_why_stat3_val: '',
    cms_mentor_why_stat3_lbl: '',
    cms_mentor_why_stat3_sub: '',
    cms_mentor_why_stat4_val: '',
    cms_mentor_why_stat4_lbl: '',
    cms_mentor_why_stat4_sub: '',
    cms_mentor_why_foot_text: '',
    cms_mentor_why_foot_btn: '',
    cms_mentor_faq_eyebrow: '',
    cms_mentor_faq_title: '',
    cms_mentor_faq_subtitle: '',
    cms_mentor_faq_q1: '', cms_mentor_faq_a1: '',
    cms_mentor_faq_q2: '', cms_mentor_faq_a2: '',
    cms_mentor_faq_q3: '', cms_mentor_faq_a3: '',
    cms_mentor_faq_q4: '', cms_mentor_faq_a4: '',
    cms_mentor_faq_q5: '', cms_mentor_faq_a5: '',
    cms_mentor_faq_q6: '', cms_mentor_faq_a6: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [activeMentorshipSection, setActiveMentorshipSection] = useState('hero');
  const [uploadingField, setUploadingField] = useState('');
  const [adminMentors, setAdminMentors] = useState([]);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const data = await apiFetch('/admin/cms');
        setCms(prev => ({ ...prev, ...data }));
        
        try {
          const mentorsData = await apiFetch('/mentors');
          setAdminMentors(mentorsData);
        } catch (mErr) {
          console.error('Failed to load mentors for spotlight CMS', mErr);
        }
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchCms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCms(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const url = await handleFileUpload(file, showToast);
      setCms(prev => ({ ...prev, [fieldName]: url }));
      showToast('Image uploaded successfully!');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setUploadingField('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/cms', {
        method: 'PUT',
        body: JSON.stringify(cms)
      });
      showToast('CMS changes saved successfully!');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '200px', color: 'hsl(var(--text-secondary))' }}>Loading CMS fields...</div>;
  }

  const renderImageUpload = (fieldName, labelText) => (
    <div className="form-group">
      <label>{labelText}</label>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
        {cms[fieldName] ? (
          <img 
            src={cms[fieldName]} 
            alt="Preview" 
            style={{ height: '64px', minWidth: '64px', objectFit: 'contain', borderRadius: 'var(--border-radius-sm)', background: 'hsl(var(--bg-dark))', border: '1px solid hsl(var(--border-color))', padding: '4px' }} 
          />
        ) : (
          <div style={{ height: '64px', width: '64px', borderRadius: 'var(--border-radius-sm)', background: 'hsl(var(--bg-dark))', border: '1px dotted hsl(var(--border-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'hsl(var(--text-muted))' }}>No Image</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '200px' }}>
          <input 
            type="text" className="input-field" name={fieldName} value={cms[fieldName]} onChange={handleChange} 
            placeholder="Or enter image URL manually..." style={{ fontSize: '12px', width: '100%', maxWidth: '320px' }}
          />
          <div>
            <input 
              type="file" accept="image/*" onChange={(e) => handleFileChange(e, fieldName)} 
              style={{ display: 'none' }} id={`file-${fieldName}`}
            />
            <label htmlFor={`file-${fieldName}`} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '6px 12px', display: 'inline-block' }}>
              {uploadingField === fieldName ? 'Uploading...' : 'Upload Image File'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CMS Manager</h1>
          <p className="subtitle">Manage website section copies, imagery, and links dynamically.</p>
        </div>
      </div>

      <div className="tab-row" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
        <button type="button" className={`tab-btn ${activeSubTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSubTab('general')}>General</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveSubTab('hero')}>Hero Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'mission' ? 'active' : ''}`} onClick={() => setActiveSubTab('mission')}>Mission Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'why' ? 'active' : ''}`} onClick={() => setActiveSubTab('why')}>Why Section</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'about' ? 'active' : ''}`} onClick={() => setActiveSubTab('about')}>About Page</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'series' ? 'active' : ''}`} onClick={() => setActiveSubTab('series')}>Series Collections</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'spotlight' ? 'active' : ''}`} onClick={() => setActiveSubTab('spotlight')}>🌟 Spotlight Guest</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'resources_page' ? 'active' : ''}`} onClick={() => setActiveSubTab('resources_page')}>📚 Resources Page</button>
        <button type="button" className={`tab-btn ${activeSubTab === 'mentorship_page' ? 'active' : ''}`} onClick={() => setActiveSubTab('mentorship_page')}>🤝 Mentorship Page</button>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid-cols-12" style={{ alignItems: 'start', gap: '24px' }}>
          <div className="col-span-8">
            <div className="glass-box">
              {activeSubTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>General &amp; Layout Settings</h2>
                  {renderImageUpload('cms_navbar_logo', 'Navbar Logo')}
                  
                  <div className="form-group">
                    <label>Footer Tagline</label>
                    <textarea className="input-field" name="cms_footer_tagline" value={cms.cms_footer_tagline} onChange={handleChange} rows={3} placeholder="Real Stories. Real Women. Real Possibilities..." />
                  </div>
                  
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Instagram Link</label>
                      <input type="text" className="input-field" name="cms_footer_social_insta" value={cms.cms_footer_social_insta} onChange={handleChange} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="form-group">
                      <label>YouTube Channel Link</label>
                      <input type="text" className="input-field" name="cms_footer_social_yt" value={cms.cms_footer_social_yt} onChange={handleChange} placeholder="https://youtube.com/..." />
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Privacy Policy URL</label>
                      <input type="text" className="input-field" name="cms_footer_privacy_link" value={cms.cms_footer_privacy_link} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Terms of Service URL</label>
                      <input type="text" className="input-field" name="cms_footer_terms_link" value={cms.cms_footer_terms_link} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Footer Copyright Copy</label>
                    <input type="text" className="input-field" name="cms_footer_copyright" value={cms.cms_footer_copyright} onChange={handleChange} placeholder="&copy; 2026 Bold &amp; Brilliant Girls..." />
                  </div>
                </div>
              )}

              {activeSubTab === 'hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Hero Section</h2>
                  
                  <div className="form-group">
                    <label>Hero Eyebrow Copy</label>
                    <input type="text" className="input-field" name="cms_hero_eyebrow" value={cms.cms_hero_eyebrow} onChange={handleChange} placeholder="New Episode Live Now" />
                  </div>

                  <div className="form-group">
                    <label>Hero Title Copy (Allows HTML)</label>
                    <input type="text" className="input-field" name="cms_hero_title" value={cms.cms_hero_title} onChange={handleChange} placeholder="Bold &amp; <em class='gold'>Brilliant</em> Girls" />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Tip: Use <code>&lt;em className="gold"&gt;text&lt;/em&gt;</code> to highlight in gold.</span>
                  </div>

                  <div className="form-group">
                    <label>Hero Subtitle Copy</label>
                    <textarea className="input-field" name="cms_hero_subtitle" value={cms.cms_hero_subtitle} onChange={handleChange} rows={3} placeholder="Real stories from inspiring women..." />
                  </div>

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Primary Button Text</label>
                      <input type="text" className="input-field" name="cms_hero_cta_primary_text" value={cms.cms_hero_cta_primary_text} onChange={handleChange} placeholder="Watch Now" />
                    </div>
                    <div className="form-group">
                      <label>Secondary Button Text</label>
                      <input type="text" className="input-field" name="cms_hero_cta_secondary_text" value={cms.cms_hero_cta_secondary_text} onChange={handleChange} placeholder="Find a Mentor &rarr;" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Social Proof Copy</label>
                    <input type="text" className="input-field" name="cms_hero_social_proof" value={cms.cms_hero_social_proof} onChange={handleChange} placeholder="Loved by 50+ bold women" />
                  </div>
                </div>
              )}

              {activeSubTab === 'mission' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Mission Section</h2>

                  <div className="form-group">
                    <label>Purpose Kicker</label>
                    <input type="text" className="input-field" name="cms_mission_kicker" value={cms.cms_mission_kicker} onChange={handleChange} placeholder="Our Purpose" />
                  </div>

                  <div className="form-group">
                    <label>Blockquote Quote Statement</label>
                    <textarea className="input-field" name="cms_mission_statement" value={cms.cms_mission_statement} onChange={handleChange} rows={4} placeholder="Every young woman deserves to see herself..." />
                  </div>

                  <div className="form-group">
                    <label>Body copy text</label>
                    <textarea className="input-field" name="cms_mission_body" value={cms.cms_mission_body} onChange={handleChange} rows={4} placeholder="We connect ambitious young women..." />
                  </div>

                  <div className="form-group">
                    <label>Author Attribution</label>
                    <input type="text" className="input-field" name="cms_mission_author" value={cms.cms_mission_author} onChange={handleChange} placeholder="— The Bold &amp; Brilliant Girls Team" />
                  </div>
                </div>
              )}

              {activeSubTab === 'why' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Why Section Settings</h2>
                  
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Section Eyebrow</label>
                      <input type="text" className="input-field" name="cms_why_eyebrow" value={cms.cms_why_eyebrow} onChange={handleChange} placeholder="What We Offer" />
                    </div>
                    <div className="form-group">
                      <label>Section Title</label>
                      <input type="text" className="input-field" name="cms_why_title" value={cms.cms_why_title} onChange={handleChange} placeholder="Why Bold &amp; Brilliant Girls?" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <textarea className="input-field" name="cms_why_subtitle" value={cms.cms_why_subtitle} onChange={handleChange} rows={2} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  
                  <h3>Box Card 1: Podcast</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card1_kicker" value={cms.cms_why_card1_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card1_title" value={cms.cms_why_card1_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card1_cta" value={cms.cms_why_card1_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card1_desc" value={cms.cms_why_card1_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 2: Mentorship</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card2_kicker" value={cms.cms_why_card2_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card2_title" value={cms.cms_why_card2_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card2_cta" value={cms.cms_why_card2_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card2_desc" value={cms.cms_why_card2_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 3: Resources</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card3_kicker" value={cms.cms_why_card3_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card3_title" value={cms.cms_why_card3_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card3_cta" value={cms.cms_why_card3_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card3_desc" value={cms.cms_why_card3_desc} onChange={handleChange} rows={2} /></div>

                  <h3>Box Card 4: Community</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Kicker</label><input type="text" className="input-field" name="cms_why_card4_kicker" value={cms.cms_why_card4_kicker} onChange={handleChange} /></div>
                    <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_why_card4_title" value={cms.cms_why_card4_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>CTA Label</label><input type="text" className="input-field" name="cms_why_card4_cta" value={cms.cms_why_card4_cta} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea className="input-field" name="cms_why_card4_desc" value={cms.cms_why_card4_desc} onChange={handleChange} rows={2} /></div>
                </div>
              )}

              {activeSubTab === 'about' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>About Page CMS</h2>
                  {renderImageUpload('cms_about_host_photo', 'Host Profile Photo')}

                  <div className="form-group">
                    <label>Moving Marquee Ticker Copy</label>
                    <input type="text" className="input-field" name="cms_about_ticker" value={cms.cms_about_ticker} onChange={handleChange} placeholder="Bold and Brilliant Girls; Podcast for Teens; Dream Boldly..." />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Separate phrases with semicolons (<code>;</code>)</span>
                  </div>

                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Eyebrow Badge</label><input type="text" className="input-field" name="cms_about_eyebrow_badge" value={cms.cms_about_eyebrow_badge} onChange={handleChange} /></div>
                    <div className="form-group"><label>Eyebrow School</label><input type="text" className="input-field" name="cms_about_eyebrow_school" value={cms.cms_about_eyebrow_school} onChange={handleChange} /></div>
                    <div className="form-group"><label>Host Name</label><input type="text" className="input-field" name="cms_about_hero_name" value={cms.cms_about_hero_name} onChange={handleChange} /></div>
                  </div>

                  <div className="form-group">
                    <label>Hero Biography Description</label>
                    <textarea className="input-field" name="cms_about_hero_desc" value={cms.cms_about_hero_desc} onChange={handleChange} rows={3} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Origin Story Section</h3>
                  <div className="form-group">
                    <label>Origin Story Title</label>
                    <input type="text" className="input-field" name="cms_about_story_title" value={cms.cms_about_story_title} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Origin Story Body Copy</label>
                    <textarea className="input-field" name="cms_about_story_body" value={cms.cms_about_story_body} onChange={handleChange} rows={4} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Biography Chapters (1-4)</h3>
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '16px' }}>
                      <h4>Chapter {num}</h4>
                      <div className="grid-cols-2" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Kicker / Label</label><input type="text" className="input-field" name={`cms_about_chapter${num}_label`} value={cms[`cms_about_chapter${num}_label`]} onChange={handleChange} /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name={`cms_about_chapter${num}_title`} value={cms[`cms_about_chapter${num}_title`]} onChange={handleChange} /></div>
                      </div>
                      <div className="form-group"><label>Body Copy</label><textarea className="input-field" name={`cms_about_chapter${num}_body`} value={cms[`cms_about_chapter${num}_body`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Sanah Quote Strip</h3>
                  <div className="form-group">
                    <label>Quote Content</label>
                    <textarea className="input-field" name="cms_about_quote_text" value={cms.cms_about_quote_text} onChange={handleChange} rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Quote Attribution</label>
                    <input type="text" className="input-field" name="cms_about_quote_attr" value={cms.cms_about_quote_attr} onChange={handleChange} />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Core Pillars (1-3)</h3>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                      <h4>Pillar {num}</h4>
                      <div className="form-group" style={{ marginBottom: '8px' }}><label>Title</label><input type="text" className="input-field" name={`cms_about_pillar${num}_title`} value={cms[`cms_about_pillar${num}_title`]} onChange={handleChange} /></div>
                      <div className="form-group"><label>Body copy</label><textarea className="input-field" name={`cms_about_pillar${num}_body`} value={cms[`cms_about_pillar${num}_body`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Hobbies &amp; Values (Swimming, Golf, Skiing)</h3>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                      <h4>Hobby {num}</h4>
                      <div className="grid-cols-2" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Name</label><input type="text" className="input-field" name={`cms_about_hobby${num}_name`} value={cms[`cms_about_hobby${num}_name`]} onChange={handleChange} /></div>
                        <div className="form-group"><label>Core Skill Pill</label><input type="text" className="input-field" name={`cms_about_hobby${num}_pill`} value={cms[`cms_about_hobby${num}_pill`]} onChange={handleChange} /></div>
                      </div>
                      <div className="form-group"><label>Description</label><textarea className="input-field" name={`cms_about_hobby${num}_desc`} value={cms[`cms_about_hobby${num}_desc`]} onChange={handleChange} rows={2} /></div>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Player Card &amp; Contact info</h3>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Player Title</label><input type="text" className="input-field" name="cms_about_player_title" value={cms.cms_about_player_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>Player Subtitle</label><input type="text" className="input-field" name="cms_about_player_sub" value={cms.cms_about_player_sub} onChange={handleChange} /></div>
                  </div>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div className="form-group"><label>Listen Header Title</label><input type="text" className="input-field" name="cms_about_listen_title" value={cms.cms_about_listen_title} onChange={handleChange} /></div>
                    <div className="form-group"><label>Contact Email Address</label><input type="email" className="input-field" name="cms_about_contact_email" value={cms.cms_about_contact_email} onChange={handleChange} /></div>
                  </div>
                  <div className="form-group"><label>Listen Copy Body</label><textarea className="input-field" name="cms_about_listen_body" value={cms.cms_about_listen_body} onChange={handleChange} rows={2} /></div>
                </div>
              )}

              {activeSubTab === 'series' && (() => {
                const SERIES_DEFS = [
                  { id: 'stem', label: 'Women in STEM', icon: '🔬', colorHint: 'Teal / STEM' },
                  { id: 'entrepreneurship', label: 'Entrepreneurship Diaries', icon: '🚀', colorHint: 'Amber / Business' },
                  { id: 'mental', label: 'Mental Health & Career', icon: '🌸', colorHint: 'Pink / Health' },
                  { id: 'law', label: 'Breaking Barriers in Law', icon: '⚖️', colorHint: 'Slate / Law' },
                  { id: 'creative', label: 'The Creative Career', icon: '🎨', colorHint: 'Orange / Arts' },
                  { id: 'finance', label: 'Corporate & Finance', icon: '💼', colorHint: 'Blue / Finance' },
                ];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2>Series Collections</h2>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
                      Manage the 6 Curated Collection cards shown on the homepage. Set a YouTube URL to redirect externally, or leave it blank to redirect internally to that category on the Episodes page.
                    </p>
                    {SERIES_DEFS.map(s => (
                      <div key={s.id} style={{ background: 'hsl(var(--bg-dark) / 0.3)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                        <h4 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                          <span style={{ fontSize: '11px', fontWeight: '400', color: 'hsl(var(--text-muted))', marginLeft: '4px' }}>({s.colorHint})</span>
                        </h4>
                        <div className="grid-cols-2" style={{ gap: '12px', marginBottom: '8px' }}>
                          <div className="form-group">
                            <label>Card Title</label>
                            <input type="text" className="input-field" name={`cms_series_${s.id}_title`} value={cms[`cms_series_${s.id}_title`] || ''} onChange={handleChange} placeholder={s.label} />
                          </div>
                          <div className="form-group">
                            <label>Episode Count Label</label>
                            <input type="text" className="input-field" name={`cms_series_${s.id}_epcount`} value={cms[`cms_series_${s.id}_epcount`] || ''} onChange={handleChange} placeholder="e.g. 8 Episodes" />
                          </div>
                        </div>
                        <div className="grid-cols-3" style={{ gap: '12px' }}>
                          <div className="form-group">
                            <label>Category Slug (local filter)</label>
                            <input type="text" className="input-field" name={`cms_series_${s.id}_category`} value={cms[`cms_series_${s.id}_category`] || ''} onChange={handleChange} placeholder="e.g. tech" />
                            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Used as ?category= in episodes page</span>
                          </div>
                          <div className="form-group">
                            <label>Completion % (progress bar)</label>
                            <input type="text" className="input-field" name={`cms_series_${s.id}_percentage`} value={cms[`cms_series_${s.id}_percentage`] || ''} onChange={handleChange} placeholder="e.g. 25%" />
                          </div>
                          <div className="form-group">
                            <label>YouTube URL (optional)</label>
                            <input type="text" className="input-field" name={`cms_series_${s.id}_youtube`} value={cms[`cms_series_${s.id}_youtube`] || ''} onChange={handleChange} placeholder="https://youtube.com/... or leave blank" />
                            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Blank → local redirect; URL → opens YouTube</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {activeSubTab === 'spotlight' && (() => {
                const selectedMentor = adminMentors.find(m => String(m.id) === String(cms.cms_spotlight_mentor_id));
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2>🌟 Spotlight: This Week's Guest</h2>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
                      Select which guest/mentor appears in the "This Week's Guest" section on the homepage. The selected mentor's full profile will be featured.
                    </p>

                    <div className="form-group">
                      <label>Select Featured Mentor</label>
                      <select
                        className="select-field"
                        name="cms_spotlight_mentor_id"
                        value={cms.cms_spotlight_mentor_id || ''}
                        onChange={handleChange}
                      >
                        <option value="">— Use default (most recently featured episode guest) —</option>
                        {adminMentors.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.role ? `· ${m.role}` : ''} ({m.source === 'episode' ? `EP. ${m.episode_number || '?'}` : 'Dedicated Mentor'})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '4px', display: 'block' }}>
                        Leave empty to automatically show the most recently featured episode guest.
                      </span>
                    </div>

                    {selectedMentor && (
                      <div style={{ background: 'hsl(var(--bg-dark) / 0.4)', border: '1px solid hsl(var(--border-color))', borderRadius: 'var(--border-radius-md)', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        {selectedMentor.photo ? (
                          <img src={selectedMentor.photo} alt={selectedMentor.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsl(var(--bg-surface))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🎙️</div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{selectedMentor.name}</div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>{selectedMentor.role}</div>
                          <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                            {selectedMentor.source === 'episode' ? `EP. ${selectedMentor.episode_number}` : 'Dedicated Mentor'} · {selectedMentor.cat_name || ''}
                          </div>
                          {selectedMentor.bio && (
                            <div style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', marginTop: '8px', lineHeight: '1.5' }}>
                              {selectedMentor.bio.slice(0, 180)}{selectedMentor.bio.length > 180 ? '...' : ''}
                            </div>
                          )}
                          {selectedMentor.quote && (
                            <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--accent)', marginTop: '8px', borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>
                              "{selectedMentor.quote.slice(0, 120)}{selectedMentor.quote.length > 120 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!cms.cms_spotlight_mentor_id && (
                      <div style={{ background: 'hsl(var(--info) / 0.08)', border: '1px solid hsl(var(--info) / 0.2)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', fontSize: '13px', color: 'hsl(var(--info))' }}>
                        ℹ️ No guest selected — the homepage will auto-show the first featured or most recent episode guest.
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeSubTab === 'resources_page' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>Resources Page Configuration</h2>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
                    Configure the header text, subtitles, and stats display on the main Resources library page.
                  </p>

                  <div className="form-group">
                    <label>Hero Eyebrow Text</label>
                    <input type="text" className="input-field" name="cms_resources_hero_eyebrow" value={cms.cms_resources_hero_eyebrow} onChange={handleChange} placeholder="Resource Library" />
                  </div>

                  <div className="form-group">
                    <label>Hero Title (Allows HTML / &lt;br/&gt;)</label>
                    <input type="text" className="input-field" name="cms_resources_hero_title" value={cms.cms_resources_hero_title} onChange={handleChange} placeholder="Everything You Need to Build Your Career" />
                  </div>

                  <div className="form-group">
                    <label>Hero Subtitle</label>
                    <textarea className="input-field" name="cms_resources_hero_subtitle" value={cms.cms_resources_hero_subtitle} onChange={handleChange} rows={3} placeholder="Episode PDFs, career guides, templates..." />
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '12px 0' }}></div>
                  <h3>Stat Counter Boxes (Homepage / Resources Page)</h3>
                  
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Stat Box 1</label>
                      <div className="form-group"><label>Value</label><input type="text" className="input-field" name="cms_resources_stat_resources_num" value={cms.cms_resources_stat_resources_num} onChange={handleChange} placeholder="48" /></div>
                      <div className="form-group"><label>Label</label><input type="text" className="input-field" name="cms_resources_stat_resources_lbl" value={cms.cms_resources_stat_resources_lbl} onChange={handleChange} placeholder="Resources" /></div>
                    </div>

                    <div style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Stat Box 2</label>
                      <div className="form-group"><label>Value</label><input type="text" className="input-field" name="cms_resources_stat_pdfs_num" value={cms.cms_resources_stat_pdfs_num} onChange={handleChange} placeholder="28" /></div>
                      <div className="form-group"><label>Label</label><input type="text" className="input-field" name="cms_resources_stat_pdfs_lbl" value={cms.cms_resources_stat_pdfs_lbl} onChange={handleChange} placeholder="Episode PDFs" /></div>
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ gap: '16px', marginTop: '12px' }}>
                    <div style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Stat Box 3</label>
                      <div className="form-group"><label>Value</label><input type="text" className="input-field" name="cms_resources_stat_fields_num" value={cms.cms_resources_stat_fields_num} onChange={handleChange} placeholder="8" /></div>
                      <div className="form-group"><label>Label</label><input type="text" className="input-field" name="cms_resources_stat_fields_lbl" value={cms.cms_resources_stat_fields_lbl} onChange={handleChange} placeholder="Career Fields" /></div>
                    </div>

                    <div style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Stat Box 4</label>
                      <div className="form-group"><label>Value</label><input type="text" className="input-field" name="cms_resources_stat_templates_num" value={cms.cms_resources_stat_templates_num} onChange={handleChange} placeholder="12" /></div>
                      <div className="form-group"><label>Label</label><input type="text" className="input-field" name="cms_resources_stat_templates_lbl" value={cms.cms_resources_stat_templates_lbl} onChange={handleChange} placeholder="Templates" /></div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '20px 0' }}></div>
                  <h3>8 Types of Resources Section</h3>
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                      <label>Types Kicker</label>
                      <input type="text" className="input-field" name="cms_resources_types_kicker" value={cms.cms_resources_types_kicker} onChange={handleChange} placeholder="What's Inside" />
                    </div>
                    <div className="form-group">
                      <label>Types Title (Allows HTML)</label>
                      <input type="text" className="input-field" name="cms_resources_types_title" value={cms.cms_resources_types_title} onChange={handleChange} placeholder="8 Types of Resources, All Free to Download" />
                    </div>
                  </div>

                  <div style={{ background: 'hsl(var(--bg-dark) / 0.1)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginTop: '12px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Descriptions for Resource Type Cards</h4>
                    <div className="grid-cols-2" style={{ gap: '16px' }}>
                      <div className="form-group">
                        <label>1. Episode PDFs Description</label>
                        <textarea className="input-field" name="cms_resources_type_pdf_desc" value={cms.cms_resources_type_pdf_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>2. Career Guides Description</label>
                        <textarea className="input-field" name="cms_resources_type_guide_desc" value={cms.cms_resources_type_guide_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>3. Templates Description</label>
                        <textarea className="input-field" name="cms_resources_type_template_desc" value={cms.cms_resources_type_template_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>4. Workbooks Description</label>
                        <textarea className="input-field" name="cms_resources_type_worksheet_desc" value={cms.cms_resources_type_worksheet_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>5. Reading Lists Description</label>
                        <textarea className="input-field" name="cms_resources_type_reading_desc" value={cms.cms_resources_type_reading_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>6. Toolkits Description</label>
                        <textarea className="input-field" name="cms_resources_type_toolkit_desc" value={cms.cms_resources_type_toolkit_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>7. Salary Reports Description</label>
                        <textarea className="input-field" name="cms_resources_type_salary_desc" value={cms.cms_resources_type_salary_desc} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>8. Scripts &amp; Emails Description</label>
                        <textarea className="input-field" name="cms_resources_type_script_desc" value={cms.cms_resources_type_script_desc} onChange={handleChange} rows={2} />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '20px 0' }}></div>
                  <h3>🔒 Coming Soon Section Settings</h3>
                  <div className="grid-cols-3" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label>Coming Soon Kicker</label>
                      <input type="text" className="input-field" name="cms_resources_coming_kicker" value={cms.cms_resources_coming_kicker} onChange={handleChange} placeholder="🔒 Coming Soon" />
                    </div>
                    <div className="form-group">
                      <label>Coming Soon Section Title</label>
                      <input type="text" className="input-field" name="cms_resources_coming_title" value={cms.cms_resources_coming_title} onChange={handleChange} placeholder="Resources in the Pipeline" />
                    </div>
                    <div className="form-group">
                      <label>Coming Soon Subtitle</label>
                      <input type="text" className="input-field" name="cms_resources_coming_subtitle" value={cms.cms_resources_coming_subtitle} onChange={handleChange} placeholder="Notify me when they drop." />
                    </div>
                  </div>

                  <div style={{ background: 'hsl(var(--bg-dark) / 0.1)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginTop: '16px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Pipeline / Coming Soon Cards</h4>

                    {/* Card 1 */}
                    <div style={{ borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px', marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: 'hsl(var(--text-primary))' }}>Card 1</h5>
                      <div className="grid-cols-3" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Icon / Emoji</label><input type="text" className="input-field" name="cms_resources_coming_card1_icon" value={cms.cms_resources_coming_card1_icon} onChange={handleChange} placeholder="🏛️" /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_resources_coming_card1_title" value={cms.cms_resources_coming_card1_title} onChange={handleChange} placeholder="Breaking Into Law" /></div>
                        <div className="form-group"><label>Tag (Category &amp; Date)</label><input type="text" className="input-field" name="cms_resources_coming_card1_tag" value={cms.cms_resources_coming_card1_tag} onChange={handleChange} placeholder="⚖️ Law · Q2 2026" /></div>
                      </div>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group"><label>Description</label><input type="text" className="input-field" name="cms_resources_coming_card1_desc" value={cms.cms_resources_coming_card1_desc} onChange={handleChange} placeholder="Description..." /></div>
                        <div className="form-group"><label>Notification Title Reference</label><input type="text" className="input-field" name="cms_resources_coming_card1_notify" value={cms.cms_resources_coming_card1_notify} onChange={handleChange} placeholder="Law Playbook" /></div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div style={{ borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px', marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: 'hsl(var(--text-primary))' }}>Card 2</h5>
                      <div className="grid-cols-3" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Icon / Emoji</label><input type="text" className="input-field" name="cms_resources_coming_card2_icon" value={cms.cms_resources_coming_card2_icon} onChange={handleChange} placeholder="🎙️" /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_resources_coming_card2_title" value={cms.cms_resources_coming_card2_title} onChange={handleChange} placeholder="Healthcare Career Guide" /></div>
                        <div className="form-group"><label>Tag (Category &amp; Date)</label><input type="text" className="input-field" name="cms_resources_coming_card2_tag" value={cms.cms_resources_coming_card2_tag} onChange={handleChange} placeholder="🏥 Healthcare · Coming June" /></div>
                      </div>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group"><label>Description</label><input type="text" className="input-field" name="cms_resources_coming_card2_desc" value={cms.cms_resources_coming_card2_desc} onChange={handleChange} placeholder="Description..." /></div>
                        <div className="form-group"><label>Notification Title Reference</label><input type="text" className="input-field" name="cms_resources_coming_card2_notify" value={cms.cms_resources_coming_card2_notify} onChange={handleChange} placeholder="Healthcare Guide" /></div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div style={{ borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px', marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: 'hsl(var(--text-primary))' }}>Card 3</h5>
                      <div className="grid-cols-3" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Icon / Emoji</label><input type="text" className="input-field" name="cms_resources_coming_card3_icon" value={cms.cms_resources_coming_card3_icon} onChange={handleChange} placeholder="💡" /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_resources_coming_card3_title" value={cms.cms_resources_coming_card3_title} onChange={handleChange} placeholder="Founder's Toolkit" /></div>
                        <div className="form-group"><label>Tag (Category &amp; Date)</label><input type="text" className="input-field" name="cms_resources_coming_card3_tag" value={cms.cms_resources_coming_card3_tag} onChange={handleChange} placeholder="🚀 Entrepreneurship · Q2 2026" /></div>
                      </div>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group"><label>Description</label><input type="text" className="input-field" name="cms_resources_coming_card3_desc" value={cms.cms_resources_coming_card3_desc} onChange={handleChange} placeholder="Description..." /></div>
                        <div className="form-group"><label>Notification Title Reference</label><input type="text" className="input-field" name="cms_resources_coming_card3_notify" value={cms.cms_resources_coming_card3_notify} onChange={handleChange} placeholder="Founder Toolkit" /></div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div>
                      <h5 style={{ margin: '0 0 12px 0', color: 'hsl(var(--text-primary))' }}>Card 4</h5>
                      <div className="grid-cols-3" style={{ gap: '12px', marginBottom: '8px' }}>
                        <div className="form-group"><label>Icon / Emoji</label><input type="text" className="input-field" name="cms_resources_coming_card4_icon" value={cms.cms_resources_coming_card4_icon} onChange={handleChange} placeholder="🎨" /></div>
                        <div className="form-group"><label>Title</label><input type="text" className="input-field" name="cms_resources_coming_card4_title" value={cms.cms_resources_coming_card4_title} onChange={handleChange} placeholder="Creative Industry Rate Card" /></div>
                        <div className="form-group"><label>Tag (Category &amp; Date)</label><input type="text" className="input-field" name="cms_resources_coming_card4_tag" value={cms.cms_resources_coming_card4_tag} onChange={handleChange} placeholder="🎨 Creative · Q3 2026" /></div>
                      </div>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group"><label>Description</label><input type="text" className="input-field" name="cms_resources_coming_card4_desc" value={cms.cms_resources_coming_card4_desc} onChange={handleChange} placeholder="Description..." /></div>
                        <div className="form-group"><label>Notification Title Reference</label><input type="text" className="input-field" name="cms_resources_coming_card4_notify" value={cms.cms_resources_coming_card4_notify} onChange={handleChange} placeholder="Creative Rate Guide" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'mentorship_page' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2>🤝 Mentorship Page CMS Settings</h2>
                  
                  <div className="form-group">
                    <label style={{ fontWeight: 'bold' }}>Choose Page Section to Edit</label>
                    <select
                      className="select-field"
                      value={activeMentorshipSection}
                      onChange={(e) => setActiveMentorshipSection(e.target.value)}
                      style={{ padding: '8px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))', width: '100%' }}
                    >
                      <option value="hero">Hero Section</option>
                      <option value="metrics">Metrics/Stats Grid</option>
                      <option value="ticker">Moving Ticker Phrases</option>
                      <option value="list">Mentors Directory Header</option>
                      <option value="stories">Student Success Stories</option>
                      <option value="why">Why It Works Section</option>
                      <option value="faq">FAQ Section</option>
                    </select>
                  </div>

                  <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>

                  {activeMentorshipSection === 'hero' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3>Hero Section Configuration</h3>
                      <div className="form-group">
                        <label>Hero Badge Text</label>
                        <input type="text" className="input-field" name="cms_mentor_hero_badge" value={cms.cms_mentor_hero_badge || ''} onChange={handleChange} placeholder="e.g. Verified women mentors · 100% confidential" />
                      </div>
                      <div className="form-group">
                        <label>Hero Title (Allows HTML / &lt;br/&gt; / &lt;em class="gold"&gt;)</label>
                        <textarea className="input-field" name="cms_mentor_hero_title" value={cms.cms_mentor_hero_title || ''} onChange={handleChange} rows={3} placeholder="The gap between where you are..." />
                      </div>
                      <div className="form-group">
                        <label>Hero Subtitle 1 (Lede Text)</label>
                        <textarea className="input-field" name="cms_mentor_hero_subtitle1" value={cms.cms_mentor_hero_subtitle1 || ''} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>Hero Subtitle 2 (Supporting Text)</label>
                        <textarea className="input-field" name="cms_mentor_hero_subtitle2" value={cms.cms_mentor_hero_subtitle2 || ''} onChange={handleChange} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>Hero Podcast Banner Text</label>
                        <input type="text" className="input-field" name="cms_mentor_hero_podcast_text" value={cms.cms_mentor_hero_podcast_text || ''} onChange={handleChange} />
                      </div>
                    </div>
                  )}

                  {activeMentorshipSection === 'metrics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3>Hero Metrics Grid</h3>
                      {[1, 2, 3, 4].map(num => (
                        <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                          <h4 style={{ margin: '0 0 10px 0' }}>Metric {num}</h4>
                          <div className="grid-cols-2" style={{ gap: '12px' }}>
                            <div className="form-group">
                              <label>Value (e.g. 87%, 3×, $85K)</label>
                              <input type="text" className="input-field" name={`cms_mentor_hero_metric${num}_val`} value={cms[`cms_mentor_hero_metric${num}_val`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Label / Explanation</label>
                              <input type="text" className="input-field" name={`cms_mentor_hero_metric${num}_lbl`} value={cms[`cms_mentor_hero_metric${num}_lbl`] || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeMentorshipSection === 'ticker' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3>Moving Marquee Ticker</h3>
                      <div className="form-group">
                        <label>Semicolon-separated Phrases</label>
                        <textarea className="input-field" name="cms_mentor_ticker" value={cms.cms_mentor_ticker || ''} onChange={handleChange} rows={6} placeholder="Phrase 1; Phrase 2; Phrase 3..." />
                        <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Separate phrases with semicolons (<code>;</code>)</span>
                      </div>
                    </div>
                  )}

                  {activeMentorshipSection === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3>Mentors Directory Header</h3>
                      <div className="form-group">
                        <label>Directory Section Title (Allows HTML / &lt;em&gt;)</label>
                        <input type="text" className="input-field" name="cms_mentor_list_title" value={cms.cms_mentor_list_title || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Quiz Match Banner Label</label>
                        <input type="text" className="input-field" name="cms_mentor_list_quiz_lbl" value={cms.cms_mentor_list_quiz_lbl || ''} onChange={handleChange} />
                      </div>
                    </div>
                  )}

                  {activeMentorshipSection === 'stories' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3>Student Success Stories</h3>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label>Section Eyebrow</label>
                          <input type="text" className="input-field" name="cms_mentor_stories_eyebrow" value={cms.cms_mentor_stories_eyebrow || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Section Title (Allows HTML)</label>
                          <input type="text" className="input-field" name="cms_mentor_stories_title" value={cms.cms_mentor_stories_title || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Section Subtitle</label>
                        <textarea className="input-field" name="cms_mentor_stories_subtitle" value={cms.cms_mentor_stories_subtitle || ''} onChange={handleChange} rows={2} />
                      </div>

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>Trust Ratings Row</h4>
                      <div className="grid-cols-3" style={{ gap: '12px' }}>
                        {[1, 2, 3].map(num => (
                          <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.1)', padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))' }}>
                            <div className="form-group">
                              <label>Metric {num} Value</label>
                              <input type="text" className="input-field" name={`cms_mentor_stories_trust${num}_val`} value={cms[`cms_mentor_stories_trust${num}_val`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Metric {num} Label</label>
                              <input type="text" className="input-field" name={`cms_mentor_stories_trust${num}_lbl`} value={cms[`cms_mentor_stories_trust${num}_lbl`] || ''} onChange={handleChange} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>Stories Cards</h4>
                      {[1, 2, 3].map(num => (
                        <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                          <h5 style={{ margin: '0 0 10px 0' }}>Story Card {num}</h5>
                          <div className="form-group">
                            <label>Quote Text</label>
                            <textarea className="input-field" name={`cms_mentor_story${num}_quote`} value={cms[`cms_mentor_story${num}_quote`] || ''} onChange={handleChange} rows={2} />
                          </div>
                          <div className="grid-cols-2" style={{ gap: '12px', marginTop: '8px' }}>
                            <div className="form-group">
                              <label>Outcome Title</label>
                              <input type="text" className="input-field" name={`cms_mentor_story${num}_outcome`} value={cms[`cms_mentor_story${num}_outcome`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Author Name</label>
                              <input type="text" className="input-field" name={`cms_mentor_story${num}_author`} value={cms[`cms_mentor_story${num}_author`] || ''} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="grid-cols-2" style={{ gap: '12px', marginTop: '8px' }}>
                            <div className="form-group">
                              <label>Author Title / Location</label>
                              <input type="text" className="input-field" name={`cms_mentor_story${num}_title`} value={cms[`cms_mentor_story${num}_title`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Via Mentor</label>
                              <input type="text" className="input-field" name={`cms_mentor_story${num}_via`} value={cms[`cms_mentor_story${num}_via`] || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>Mentors Placement/Company Banner</h4>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label>Banner Header Text</label>
                          <input type="text" className="input-field" name="cms_mentor_companies_title" value={cms.cms_mentor_companies_title || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Semicolon-separated Companies</label>
                          <input type="text" className="input-field" name="cms_mentor_companies_list" value={cms.cms_mentor_companies_list || ''} onChange={handleChange} placeholder="Google; Meta; Amazon; Spotify" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMentorshipSection === 'why' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3>Why It Works Section Copy</h3>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label>Eyebrow Label</label>
                          <input type="text" className="input-field" name="cms_mentor_why_eyebrow" value={cms.cms_mentor_why_eyebrow || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Section Title (Allows HTML / &lt;br/&gt;)</label>
                          <input type="text" className="input-field" name="cms_mentor_why_title" value={cms.cms_mentor_why_title || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Section Subtitle</label>
                        <textarea className="input-field" name="cms_mentor_why_subtitle" value={cms.cms_mentor_why_subtitle || ''} onChange={handleChange} rows={2} />
                      </div>

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>Statistical Stat Cards (1-4)</h4>
                      {[1, 2, 3, 4].map(num => (
                        <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                          <h5 style={{ margin: '0 0 10px 0' }}>Stat Card {num}</h5>
                          <div className="grid-cols-3" style={{ gap: '12px' }}>
                            <div className="form-group">
                              <label>Stat Value (e.g. 87%, 3×)</label>
                              <input type="text" className="input-field" name={`cms_mentor_why_stat${num}_val`} value={cms[`cms_mentor_why_stat${num}_val`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Stat Label</label>
                              <input type="text" className="input-field" name={`cms_mentor_why_stat${num}_lbl`} value={cms[`cms_mentor_why_stat${num}_lbl`] || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                              <label>Source / Subtext</label>
                              <input type="text" className="input-field" name={`cms_mentor_why_stat${num}_sub`} value={cms[`cms_mentor_why_stat${num}_sub`] || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>Footer Area</h4>
                      <div className="grid-cols-2" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label>Callout Text (Allows HTML)</label>
                          <input type="text" className="input-field" name="cms_mentor_why_foot_text" value={cms.cms_mentor_why_foot_text || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>Button Label</label>
                          <input type="text" className="input-field" name="cms_mentor_why_foot_btn" value={cms.cms_mentor_why_foot_btn || ''} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMentorshipSection === 'faq' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3>FAQ Header</h3>
                      <div className="grid-cols-3" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label>FAQ Eyebrow</label>
                          <input type="text" className="input-field" name="cms_mentor_faq_eyebrow" value={cms.cms_mentor_faq_eyebrow || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>FAQ Title (Allows HTML / &lt;br/&gt;)</label>
                          <input type="text" className="input-field" name="cms_mentor_faq_title" value={cms.cms_mentor_faq_title || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label>FAQ Subtitle</label>
                          <input type="text" className="input-field" name="cms_mentor_faq_subtitle" value={cms.cms_mentor_faq_subtitle || ''} onChange={handleChange} />
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'hsl(var(--border-color))', margin: '10px 0' }}></div>
                      <h4>FAQ Questions &amp; Answers</h4>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <div key={num} style={{ background: 'hsl(var(--bg-dark) / 0.2)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid hsl(var(--border-color))', marginBottom: '12px' }}>
                          <h5 style={{ margin: '0 0 10px 0' }}>FAQ Item {num}</h5>
                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label>Question {num}</label>
                            <input type="text" className="input-field" name={`cms_mentor_faq_q${num}`} value={cms[`cms_mentor_faq_q${num}`] || ''} onChange={handleChange} />
                          </div>
                          <div className="form-group">
                            <label>Answer {num}</label>
                            <textarea className="input-field" name={`cms_mentor_faq_a${num}`} value={cms[`cms_mentor_faq_a${num}`] || ''} onChange={handleChange} rows={3} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4">
            <div className="glass-box" style={{ position: 'sticky', top: '24px' }}>
              <h2 style={{ marginBottom: '20px' }}>Publishing</h2>
              <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '20px' }}>Saving changes will write records to the live database, immediately updating content for all website visitors.</p>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={saving}>
                {saving ? 'Publishing...' : 'Publish Content Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
