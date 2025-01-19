import React, { useEffect } from 'react';
import { Button, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { saveTokens } from '../services/TokenService';

const YandexLoginButton: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Получаем setIsAuthenticated из контекста

  // Обработчик редиректа
  useEffect(() => {
    const handleRedirect = async (url: string | null) => {
      if (!url) return;
    
      const { queryParams } = Linking.parse(url);
      if (queryParams && queryParams.access_token) {
        // Проверяем, является ли access_token массивом и получаем первый элемент, если это так
        const accessToken = Array.isArray(queryParams.access_token)
          ? queryParams.access_token[0]
          : queryParams.access_token;
    
        // Проверяем, является ли refresh_token массивом и получаем первый элемент, если это так
        const refreshToken = Array.isArray(queryParams.refresh_token)
          ? queryParams.refresh_token[0]
          : queryParams.refresh_token;
    
        // Убедимся, что accessToken и refreshToken — это строки
        if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
          try {
            await saveTokens(accessToken, refreshToken);
          
            Alert.alert('Успешная авторизация', 'Вы вошли через Яндекс.');
          } catch (error) {
            console.error('Error saving tokens:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить токены.');
          }
        } else {
          Alert.alert('Ошибка', 'Токены неверного формата.');
        }
      }
    };

    // Подписка на изменение URL
    const subscription = Linking.addEventListener('url', (event) => handleRedirect(event.url));

    return () => {
      subscription.remove(); // Удаляем подписку при размонтировании
    };
  }, []); // Указываем только необходимые зависимости

  // Обработчик нажатия кнопки
  const handleLogin = () => {
    const yandexAuthUrl = 'http://localhost:8000/auth/login/yandex';
    Linking.openURL(yandexAuthUrl); // Открыть страницу авторизации Яндекса
  };

  return <Button title="Войти через Яндекс" onPress={handleLogin} />;
};

export default YandexLoginButton;
