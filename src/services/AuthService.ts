import axios from 'axios';
import { saveTokens } from './TokenService';

const API_URL = 'http://localhost:8000'; // Замените на ваш URL API

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
  const { access_token, refresh_token } = response.data;

  // Сохраняем токены через TokenService
  await saveTokens(access_token, refresh_token);

  return { access_token, refresh_token };
};

export const registerUser = async (name: string, surname: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/users/`, { name, surname, email, password });
  const { access_token, refresh_token } = response.data;

  // Сохраняем токены через TokenService
  await saveTokens(access_token, refresh_token);

  return { access_token, refresh_token };
};