import axios from 'axios';
import { Platform } from 'react-native';
import { SecureStorage } from '@/helpers/adapters/secure-storage';

const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export const API_URL =
  STAGE === 'prod'
    ? process.env.EXPO_PUBLIC_API_URL_PROD
    : Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_API_URL_IOS
      : process.env.EXPO_PUBLIC_API_URL_ANDROID;

const quizslothApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

quizslothApi.interceptors.request.use(async (config) => {
  const token = await SecureStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { quizslothApi };
