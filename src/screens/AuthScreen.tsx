import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import YandexLoginButton from '../components/OAuthButtons';

const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Переключение между регистрацией и логином

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      await register(name, surname, email, password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        {isLogin ? (
          <>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Email" 
            />
            <TextInput 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Password" 
              secureTextEntry 
            />
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.switchText}>Don't have an account?</Text>
            <Button title="Register" onPress={() => setIsLogin(false)} />
          </>
        ) : (
          <>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="Name" 
            />
            <TextInput 
              style={styles.input} 
              value={surname} 
              onChangeText={setSurname} 
              placeholder="Surname" 
            />
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Email" 
            />
            <TextInput 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Password" 
              secureTextEntry 
            />
            <Button title="Register" onPress={handleRegister} />
            <Text style={styles.switchText}>Already have an account?</Text>
            <Button title="Login" onPress={() => setIsLogin(true)} />
          </>
        )}
        <YandexLoginButton />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#555',
  },
});

export default AuthScreen;
