import api from '@/services/apiConfig';

export const createDraft = async (draftData) => {
  try {
    const response = await api.post('/drafts', draftData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating draft:', error);
    throw error;
  }
};

export const getDraftById = async (id) => {
  try {
    const response = await api.get(`/drafts/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

export const cancelDraft = async (id) => {
  try {
    const response = await api.patch(`/drafts/${id}/cancel`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error cancelling draft:', error);
    throw error;
  }
};

export const getDraftByScrimId = async (scrimId) => {
  try {
    const response = await api.get(`/drafts/scrim/${scrimId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching draft by scrim:', error);
    throw error;
  }
};
