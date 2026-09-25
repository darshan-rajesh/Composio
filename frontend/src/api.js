import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Research Endpoints
  startResearch: (batchSize = 5) => 
    axios.post(`${API_BASE_URL}/research/start`, null, { params: { batch_size: batchSize } }),
    
  getResearchProgress: () => 
    axios.get(`${API_BASE_URL}/research/progress`),
    
  getApps: (params = {}) => 
    axios.get(`${API_BASE_URL}/research/apps`, { params }),
    
  getAppDetail: (appId) => 
    axios.get(`${API_BASE_URL}/research/apps/${appId}`),

  // Audit Endpoints
  getAuditSample: (size = 15) => 
    axios.get(`${API_BASE_URL}/audit/sample`, { params: { sample_size: size } }),
    
  submitAudit: (appId, auditData) => 
    axios.post(`${API_BASE_URL}/audit/submit/${appId}`, auditData),
    
  getAuditMetrics: () => 
    axios.get(`${API_BASE_URL}/audit/metrics`),

  // Analytics Endpoints
  getOverview: () => 
    axios.get(`${API_BASE_URL}/analytics/overview`),
    
  getAuthDistribution: () => 
    axios.get(`${API_BASE_URL}/analytics/auth-distribution`),
    
  getMcpStats: () => 
    axios.get(`${API_BASE_URL}/analytics/mcp-stats`),
    
  getTopCategories: () => 
    axios.get(`${API_BASE_URL}/analytics/categories`),
    
  getConfidenceDistribution: () => 
    axios.get(`${API_BASE_URL}/analytics/confidence-distribution`),

  // Export Endpoints
  exportData: (format = 'json') => 
    axios.get(`${API_BASE_URL}/export/${format}`, { responseType: format === 'json' ? 'json' : 'blob' }),
    
  generateCaseStudy: () => 
    axios.post(`${API_BASE_URL}/export/case-study`)
};
