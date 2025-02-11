import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import axios from "../services/TokenService";
import { RootStackParamList } from "../utils/navigation";
import { Picker } from "@react-native-picker/picker";
import { CategoriesSchema } from "../types/CategoriesSchema";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type TransactionsRouteProp = RouteProp<RootStackParamList, "AddTransactions">;

export default function AddTransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const { accountId, type } = route.params;
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categories, setCategories] = useState<CategoriesSchema[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchCategories = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    }
  };

  const addTransaction = async () => {
    if (!amount) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все обязательные поля.");
      return;
    }
    const token = await getToken();
    if (token) {
      try {
        await axios.post(
          `${API_URL}/transactions/`,
          {
            amount: parseFloat(amount),
            description,
            type,
            account_id: accountId,
            category_id: selectedCategory,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.alert("Успешно", "Транзакция добавлена!");
      } catch (error) {
        console.log("Error adding transaction:", error);
        Alert.alert("Ошибка", "Не удалось провести транзакцию.");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id.toString());
    }
  }, [categories]);

  const buttonText = type === "доход" ? "Пополнить" : "Списать";

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Введите сумму*"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholderTextColor="#ccc"
      />
      <TextInput
        style={styles.input}
        placeholder="Введите описание (необязательно)"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#ccc"
      />
      <Text style={styles.label}>
        Категория<Text style={styles.starReq}>*</Text>
      </Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        {categories.map((category: any) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>
      <TouchableOpacity style={styles.button} onPress={addTransaction}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: "#DDD",
    borderWidth: 1,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginBottom: 15,
    height: 50,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  starReq: { color: "red" },
});
