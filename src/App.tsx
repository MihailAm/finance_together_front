// src/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen'; // Главный экран
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddAccount from './components/AddAccount';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

const AppNavigation: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Проверка аутентификации

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Если пользователь аутентифицирован, показываем главный экран */}
        {isAuthenticated ? (
          <><Stack.Screen name="Home" component={HomeScreen} /><Stack.Screen name="AddAccount" component={AddAccount} /></> 
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
