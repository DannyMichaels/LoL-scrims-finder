import api from './apiConfig';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOneUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserCreatedScrims = async (id) => {
  try {
    const response = await api.get(`users/${id}/created-scrims`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsersInRegion = async (region) => {
  // this one is unused
  try {
    const response = await api.get(`/users?region=${region}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
