import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import axios from "../services/TokenService";
import DatePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type AddGoalRouteProp = RouteProp<RootStackParamList, "AddGoal">;

export default function AddGoalScreen() {
  const route = useRoute<AddGoalRouteProp>();
  const { accountId } = route.params;
  const navigation = useNavigation<RootStackParamList>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const formattedDate = dueDate.toISOString().split("T")[0];

  const handleGoalSubmit = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const payload = {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        description,
        due_date: formattedDate,
        status: "В процессе накопления",
        account_id: accountId,
      };

      const response = await axios.post(`${API_URL}/goals/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        Alert.alert("Цель добавлена", "Цель успешно добавлена!");
        navigation.goBack();
      } else {
        Alert.alert("Ошибка", "Не удалось добавить цель.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Название<Text style={styles.starReq}>*</Text>
      </Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>
        Сумма, сколько нужно накопить<Text style={styles.starReq}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={targetAmount}
        onChangeText={setTargetAmount}
      />

      <Text style={styles.label}>
        Текущая сумма<Text style={styles.starReq}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={currentAmount}
        onChangeText={setCurrentAmount}
      />

      <Text style={styles.label}>Описание (необязательно)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>
        Дата накопления<Text style={styles.starReq}>*</Text>
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
          </View>
        </View>
      </Modal>

      <Button
        title="Добавить цель"
        onPress={handleGoalSubmit}
        color="#FF6347"
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  starReq: { color: "red" },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginBottom: 15,
    height: 50,
    justifyContent: "center",
  },
});
