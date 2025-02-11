import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/AuthService";
import GoogleLogin from "../components/GoogleLogin";
import YandexLogin from "../components/YandexLogin";

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useAuth();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Некорректный email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{5,}$/;
    if (!regex.test(password)) {
      setPasswordError(
        "Пароль должен содержать минимум 5 символов, одну заглавную букву и одну цифру"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail(email) || !validatePassword(password)) return;

    try {
      const response = await loginUser(email, password);
      const accessToken = response.access_token;
      await login(accessToken);
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка", "Неверный email или пароль");
    }
  };

  const handleRegister = async () => {
    if (!validateEmail(email) || !validatePassword(password)) return;

    try {
      await registerUser(name, surname, email, password);
      setIsLogin(true);
      Alert.alert("Успех", "Регистрация прошла успешно");
    } catch (error) {
      console.log(error);
      Alert.alert("Ошибка", "Не удалось зарегистрироваться");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        {isLogin ? (
          <>
            <Text style={styles.header}>Авторизация</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              placeholder="Пароль"
              secureTextEntry
            />
            {passwordError ? (
              <Text style={styles.error}>{passwordError}</Text>
            ) : null}
            <Button color="#FF6347" title="Войти" onPress={handleLogin} />
            <Text style={styles.switchText}>У вас нет аккаунта?</Text>
            <Button
              color="#FF6347"
              title="Зарегистрироваться"
              onPress={() => setIsLogin(false)}
            />
            <TouchableOpacity>
              {/*<GoogleLogin />
              <YandexLogin />*/}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.header}>Регистрация</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Имя*"
            />
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Фамилия*"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              placeholder="E-mail*"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              placeholder="Пароль*"
              secureTextEntry
            />
            {passwordError ? (
              <Text style={styles.error}>{passwordError}</Text>
            ) : null}
            <Button
              color="#FF6347"
              title="Зарегистрироваться"
              onPress={handleRegister}
            />
            <Text style={styles.switchText}>У вас уже есть аккаунт?</Text>
            <Button
              color="#FF6347"
              title="Войти"
              onPress={() => setIsLogin(true)}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f9",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  switchText: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 14,
    color: "#555",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default AuthScreen;
