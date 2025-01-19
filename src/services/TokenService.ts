import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

// Сохраняем токены
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

// Получаем access токен
export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
};

// Получаем refresh токен
export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const removeTokens = async () => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

// Обновляем access токен с помощью refresh токена
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await fetch('http://localhost:8000/auth/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to refresh token');
  }

  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;

  // Сохраняем обновленные токены
  await saveTokens(newAccessToken, newRefreshToken);

  return newAccessToken;
};
