import { getAccessToken, refreshAccessToken } from './TokenService';

export const makeRequest = async (url: string, options: RequestInit = {}) => {
  try {
    let token = await getAccessToken();

    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Если токен истек, пробуем обновить его
      const newToken = await refreshAccessToken();

      // Повторяем запрос с новым токеном
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });

      return retryResponse;
    }

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
