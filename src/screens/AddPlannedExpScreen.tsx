import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "@react-native-community/datetimepicker";
import axios from "../services/TokenService";
import { RootStackParamList } from "../utils/navigation";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { CategoriesSchema } from "../types/CategoriesSchema";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type PlannedExpRouteProp = RouteProp<RootStackParamList, "AddTransactions">;

export default function AddPlannedExpScreen() {
  const route = useRoute<PlannedExpRouteProp>();
  const { accountId } = route.params;

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [durDate, setDurDate] = useState<Date>(new Date());
  const [type, setType] = useState<string>("доход");
  const [categories, setCategories] = useState<CategoriesSchema[]>([]);
  const navigation = useNavigation<RootStackParamList>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const formattedDate = durDate.toISOString().split("T")[0];

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
        Alert.alert("Ошибка", "Не удалось загрузить категории.");
      }
    }
  };

  const handleAddPlannedExp = async () => {
    if (!amount || !durDate) {
      Alert.alert("Ошибка", "Заполните обязательные поля!");
      return;
    }

    const token = await getToken();

    try {
      const response = await axios.post(
        `${API_URL}/planned_expenses/`,
        {
          amount: parseFloat(amount),
          description,
          dur_date: formattedDate,
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

      if (response.status === 201) {
        Alert.alert("Успех", "Плановая операция успешно добавлена.");
        navigation.goBack();
      } else {
        Alert.alert("Ошибка", "Не удалось добавить плановую операцию.");
      }
    } catch (error) {
      console.log("Ошибка при добавлении плановой операции:", error);
      Alert.alert("Ошибка", "Произошла ошибка при добавлении операции.");
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

  const handleConfirm = (date: Date) => {
    setDurDate(date);
    setIsPickerOpen(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Сумма*"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Описание (необязательно)"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>
        Дата<Text style={styles.starReq}>*</Text>
      </Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setIsPickerOpen(true)}
      >
        <Text>{formattedDate}</Text>
      </TouchableOpacity>

      <Modal visible={isPickerOpen} transparent={true}>
        <View style={styles.modal}>
          <DatePicker
            value={durDate}
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDurDate(selectedDate);
              setIsPickerOpen(false);
            }}
            mode="date"
            minimumDate={new Date()}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => setIsPickerOpen(false)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Отменить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleConfirm(durDate)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Выбрать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>
        Тип операции<Text style={styles.starReq}>*</Text>
      </Text>
      <Picker
        selectedValue={type}
        style={styles.picker}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        <Picker.Item label="Доход" value="доход" />
        <Picker.Item label="Расход" value="расход" />
      </Picker>

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

      <Button title="Добавить" onPress={handleAddPlannedExp} color="#FF6347" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
    color: "#555",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginBottom: 15,
    height: 50,
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePicker: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  starReq: { color: "red" },
});
