import React from "react";
import { Alert, Image, TouchableOpacity, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../utils/navigation";
import axios from "axios";

const API_URL = "http://192.168.56.1:8000/auth/login/google";

export default function GoogleLogin() {
  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get(API_URL);
      const { token } = response.data;

      if (token) {
        await AsyncStorage.setItem("token", token);
        Alert.alert("Успех", "Вы успешно авторизованы!");
      } else {
        Alert.alert("Ошибка", "Не удалось получить токен");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выполнить авторизацию");
      console.error("Ошибка авторизации:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGoogleLogin}
      style={{
        backgroundColor: "#4285F4",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16 }}>Войти через Google</Text>
    </TouchableOpacity>
  );
}
