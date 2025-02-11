import React from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../utils/navigation";

const API_URL = "http://192.168.56.1:8000"; // Адрес твоего бэкенда

const YandexLogin = () => {
  const navigation = useNavigation<RootStackParamList>();

  const handleYandexLogin = async () => {
    try {
      // Прямо отправляем запрос на сервер для авторизации через Яндекс
      const response = await fetch(`${API_URL}/auth/login/yandex`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      //const data = await response.json();

      //if (data.access_token) {
      //await AsyncStorage.setItem("access_token", data.access_token);
      //Alert.alert("Успех", "Авторизация прошла успешно!");
      //navigation.navigate("HomeScreen"); // Перенаправляем на главный экран
      //} else {
      //Alert.alert("Ошибка", "Не удалось получить access_token.");
      //}
    } catch (error) {
      console.log("Ошибка при запросе авторизации через Яндекс:", error);
      Alert.alert("Ошибка", "Не удалось авторизоваться через Яндекс.");
    }
  };

  return (
    <TouchableOpacity onPress={handleYandexLogin}>
      <Image
        style={{ width: 40, height: 40 }}
        source={require("../../assets/yandex-icon.png")}
      />
    </TouchableOpacity>
  );
};

export default YandexLogin;
