import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'access';

const getHeaders = async () => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    console.log('Retrieved token:', token);
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
    };
  } catch (error) {
    console.error('Error retrieving token:', error);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
};

export const fetchUserData = async () => {
  try {
    const headers = await getHeaders();
    console.log('Headers being sent:', headers);
    const response = await axios.get(`${BASE_URL}/users/profile/me`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const fetchJournals = async (categoryId?: number) => {
  try {
    const headers = await getHeaders();
    const url = categoryId
      ? `${BASE_URL}/journal/entries/category/${categoryId}/`
      : `${BASE_URL}/journal/entries/`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    throw error;
  }
};

export const addJournal = async (journalData: any) => {
  try {
    const headers = await getHeaders();
    const response = await axios.post(`${BASE_URL}/journal/entries/`, journalData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error adding journal:', error);
    throw error;
  }
};

export const updateJournal = async (id: number, journalData: any) => {
  try {
    const headers = await getHeaders();
    const response = await axios.put(`${BASE_URL}/journal/entries/${id}/`, journalData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error updating journal:', error);
    throw error;
  }
};

export const deleteJournal = async (id: number) => {
  try {
    const headers = await getHeaders();
    const response = await axios.delete(`${BASE_URL}/journal/entries/${id}/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error deleting journal:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${BASE_URL}/journal/categories/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};