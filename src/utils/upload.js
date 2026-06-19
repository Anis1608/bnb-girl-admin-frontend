export const API_BASE = 'https://api.bnbgirl.com/api';

// Helper to handle uploading files
export async function handleFileUpload(file, showToast) {
  if (!file) return '';
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('bbg_token');
  const response = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'File upload failed');
  }
  return data.url;
}
