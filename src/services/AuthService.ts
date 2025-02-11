import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "./TokenService";
import { API_URL } from "./config";

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login/`, {
    email,
    password,
  });
  const { access_token } = response.data;

  if (response.data && access_token) {
    await AsyncStorage.setItem("access_token", access_token);
  }

  return { access_token };
};

export const registerUser = async (
  name: string,
  surname: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_URL}/users/`, {
    name,
    surname,
    email,
    password,
  });

  const { access_token } = response.data;

  if (response.data && access_token) {
    await AsyncStorage.setItem("access_token", access_token);
  }

  return { access_token };
};
