import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Для работы с AsyncStorage
import { AccountCreateSchemaUser } from '../types/AccountSchema';
import { AccountSchema } from '../types/AccountSchema';
import CreateAccount from '../components/CreateAccount'; 

// URL вашего API
const API_URL = 'http://localhost:8000/accounts/user';

const HomeScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountSchema[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Получаем токен из AsyncStorage
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token'); // Берем токен из AsyncStorage
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Получаем все аккаунты при монтировании компонента
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = await getToken(); // Получаем токен
    if (token) {
      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Передаем токен в заголовке
          },
        });

        if (response.ok) {
          const data: AccountSchema[] = await response.json();
          setAccounts(data);
        } else {
          console.error('Failed to fetch accounts');
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    } else {
      console.log('No token found');
    }
  };

  const handleAddAccount = async (newAccount: AccountCreateSchemaUser) => {
    const token = await getToken(); // Получаем токен
    if (token) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Передаем токен в заголовке
          },
          body: JSON.stringify(newAccount), // Отправляем данные о новом аккаунте
        });

        if (response.ok) {
          fetchAccounts(); // Обновляем список аккаунтов после создания
          setIsCreating(false); // Закрываем форму добавления
        } else {
          console.error('Failed to create account');
        }
      } catch (error) {
        console.error('Error creating account:', error);
      }
    } else {
      console.log('No token found');
    }
  };

  const handleCreateAccount = () => {
    setIsCreating(true); // Открываем форму для добавления аккаунта
  };

  const renderAccount = ({ item }: { item: AccountSchema }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.account_name}</Text>
      <Text style={styles.cardBalance}>Balance:{item.balance} рублей</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {accounts.length === 0 ? (
        isCreating ? (
          <CreateAccount onAddAccount={handleAddAccount} />
        ) : (
          <View style={styles.addAccountContainer}>
            <Text>No accounts found.</Text>
            <Button title="Add Account" onPress={handleCreateAccount} />
          </View>
        )
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  addAccountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 250,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBalance: {
    fontSize: 16,
    color: '#555',
  },
});

export default HomeScreen;
