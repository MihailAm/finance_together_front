import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import axios from "../services/TokenService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import DatePicker from "@react-native-community/datetimepicker";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

export default function AddDebtsScreen() {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const navigation = useNavigation<RootStackParamList>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const formattedDate = dueDate.toISOString().split("T")[0];

  const addDebt = async () => {
    if (!name || !amount || !dueDate) {
      Alert.alert(
        "Ошибка",
        "Заполните все обязательные поля (Имя, Сумма, Дата)"
      );
      return;
    }

    const token = await getToken();

    if (!token) {
      Alert.alert("Ошибка", "Не удалось получить токен");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/debts/`,
        {
          name,
          amount: parseFloat(amount),
          description,
          due_date: formattedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Успех", "Долг добавлен успешно");
      navigation.goBack();
    } catch (error) {
      console.log("Error adding debt:", error);
      Alert.alert("Ошибка", "Не удалось добавить долг");
    }
  };

  const handleConfirm = (date: Date) => {
    setDueDate(date);
    setIsPickerOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Имя<Text style={styles.starReq}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Введите имя"
      />

      <Text style={styles.label}>
        Сумма<Text style={styles.starReq}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Введите сумму"
      />

      <Text style={styles.label}>Описание (необязательно)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Введите описание"
      />

      <Text style={styles.label}>
        Дата возврата<Text style={styles.starReq}>*</Text>
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
            value={dueDate}
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDueDate(selectedDate);
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
              onPress={() => handleConfirm(dueDate)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Выбрать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={addDebt}>
        <Text style={styles.buttonText}>Добавить долг</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
    padding: 10,
  },
  button: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  starReq: {
    color: "red",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
