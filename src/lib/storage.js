const STORAGE_KEY = 'consular_service_draft';

export const saveDraft = (serviceId, formData) => {
  try {
    const draft = {
      serviceId,
      formData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

export const loadDraft = () => {
  try {
    const draftStr = localStorage.getItem(STORAGE_KEY);
    if (!draftStr) return null;
    
    const draft = JSON.parse(draftStr);
    
    // Check if draft is not too old (7 days)
    const draftDate = new Date(draft.timestamp);
    const now = new Date();
    const daysDiff = (now - draftDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      clearDraft();
      return null;
    }
    
    return draft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing draft:', error);
    return false;
  }
};

export const hasDraft = () => {
  return loadDraft() !== null;
};

// Auto-save functionality
let autoSaveTimeout;

export const autoSave = (serviceId, formData, delay = 2000) => {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveDraft(serviceId, formData);
  }, delay);
};