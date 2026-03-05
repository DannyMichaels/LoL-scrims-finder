import api from '@/services/apiConfig';

export const fetchChampions = async () => {
  try {
    const response = await api.get('/champions');
    if (response.data?.data) {
      return {
        champions: response.data.data,
        version: response.data.version,
      };
    }
    return { champions: [], version: null };
  } catch (error) {
    console.error('Error fetching champions:', error);
    throw error;
  }
};
