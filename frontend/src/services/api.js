/**
 * Centralized API Service for AdjournAID Frontend.
 * Standardizes endpoints, request timeouts, error normalization, and session lifecycle.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 45000, // 45 seconds for LLM inference
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected communication error occurred.';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  /** Health check */
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  /** Active inference provider */
  getProvider: async () => {
    const res = await apiClient.get('/provider');
    return res.data;
  },

  /** Switch active inference provider */
  setProvider: async (provider) => {
    const res = await apiClient.post('/provider', { provider });
    return res.data;
  },

  /** Get list of available sample contracts */
  getSampleContracts: async () => {
    const res = await apiClient.get('/sample-contracts');
    return res.data;
  },

  /** Load a sample contract */
  loadSampleContract: async (sampleId) => {
    const res = await apiClient.post(`/sample-contracts/${sampleId}/load`);
    return res.data;
  },

  /** Upload a document file (PDF, DOCX, TXT) */
  uploadFile: async (file, docTitle, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (docTitle) formData.append('doc_title', docTitle);

    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return res.data;
  },

  /** Ingest raw text */
  uploadRawText: async (text, title) => {
    const formData = new FormData();
    formData.append('raw_text', text);
    formData.append('doc_title', title || 'Pasted Legal Text');

    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Execute CLAIM legal analysis */
  analyzeDocument: async (documentId, taskType, customQuery = null) => {
    const res = await apiClient.post('/analyze', {
      document_id: documentId,
      task_type: taskType,
      custom_query: customQuery,
    });
    return res.data;
  },

  /** Purge ephemeral session data (ZDR) */
  purgeSession: async (sessionId) => {
    const res = await apiClient.delete(`/session/${sessionId}`);
    return res.data;
  },
};

export default api;
