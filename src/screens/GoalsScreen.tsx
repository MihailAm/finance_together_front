import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import axios from "../services/TokenService";
import { AccountGoalsSchema } from "../types/AccountGoalsSchema";
import { RootStackParamList } from "../utils/navigation";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../services/config";

type GoalsRouteProp = RouteProp<RootStackParamList, "Goals">;

export default function GoalsScreen() {
  const route = useRoute<GoalsRouteProp>();
  const { accountId } = route.params;
  const [goals, setGoals] = useState<AccountGoalsSchema[]>([]);
  const [groupGoals, setGroupGoals] = useState<AccountGoalsSchema[]>([]);
  const navigation = useNavigation<RootStackParamList>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<AccountGoalsSchema | null>(
    null
  );
  const [newAmount, setNewAmount] = useState("");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [highlightedStatus, setHighlightedStatus] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/goals/account/${accountId}`);
      const goalsWithStatus = await Promise.all(
        response.data.map(async (goal: AccountGoalsSchema) => {
          const status = await AsyncStorage.getItem(`goal_status_${goal.id}`);
          return { ...goal, status: status || goal.status };
        })
      );
      setGoals(goalsWithStatus);
    } catch (error) {
      console.log("Ошибка загрузки целей", error);
    }
  };

  const handleEditGoal = (goal: AccountGoalsSchema) => {
    setSelectedGoal(goal);
    setNewAmount(goal.current_amount.toString());
    setModalVisible(true);
  };

  const handleSaveAmount = async () => {
    if (!selectedGoal) return;
    try {
      await axios.post(`${API_URL}/goals/contributions/`, {
        amount: parseFloat(newAmount),
        is_active_pay: false,
        goal_id: selectedGoal.id,
      });
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === selectedGoal.id
            ? { ...goal, amount: parseFloat(newAmount) }
            : goal
        )
      );

      setModalVisible(false);
    } catch (error) {
      console.log("Ошибка при обновлении цели", error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    Alert.alert("Удаление цели", "Вы уверены, что хотите удалить эту цель?", [
      {
        text: "Отмена",
        style: "cancel",
      },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/goals/${goalId}`);
            setGoals(goals.filter((goal) => goal.id !== goalId));
            setGroupGoals(groupGoals.filter((goal) => goal.id !== goalId));
          } catch (error) {
            console.log("Ошибка при удалении цели", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const getGoalTextColor = (status: string) => {
    switch (status) {
      case "Достигнута":
        return "green";
      case "Отменена":
        return "gray";
      default:
        return "black";
    }
  };

  const updateGoalStatus = async () => {
    if (!selectedGoal || !newStatus) {
      setErrorMessage("Выберите новый статус");
      return;
    }

    try {
      await AsyncStorage.setItem(`goal_status_${selectedGoal.id}`, newStatus);

      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === selectedGoal.id ? { ...goal, status: newStatus } : goal
        )
      );

      setStatusModalVisible(false);
      setErrorMessage(null);
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const renderGoal = ({ item }: { item: AccountGoalsSchema }) => (
    <View style={styles.card}>
      <View style={styles.EDicon}>
        <TouchableOpacity onPress={() => handleEditGoal(item)}>
          <Image
            style={styles.edit}
            source={require("../../assets/edit.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
          <Image
            style={styles.delete}
            source={require("../../assets/delete.png")}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.goalText, { color: getGoalTextColor(item.status) }]}>
        Цель: {item.name}
      </Text>
      <Text>
        Сколько нужно:{" "}
        <Text style={styles.valuesGoals}>{item.target_amount} ₽</Text>
      </Text>
      <Text>
        Накоплено:{" "}
        <Text style={styles.valuesGoals}>{item.current_amount} ₽</Text>
      </Text>
      <Text>
        До:{" "}
        <Text style={styles.valuesGoals}>
          {item.due_date.toString().split("T")[0]}
        </Text>
      </Text>
      <Text
        onPress={() => {
          setSelectedGoal(item);
          setNewStatus(item.status);
          setStatusModalVisible(true);
        }}
      >
        Статус: <Text style={styles.statusGoals}>{item.status}</Text>
      </Text>
      <Text>
        Описание: <Text style={styles.valuesGoals}>{item.description}</Text>
      </Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("HistoryExpense", { goalId: item.id })
        }
        style={styles.historyExpense}
      >
        <Text style={styles.historyExpenseText}>История пополнения</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.Addbutton}>
          <Button
            title="Добавить цель"
            onPress={() => navigation.navigate("AddGoal", { accountId })}
            color="#FF6347"
          />
        </View>
        <FlatList data={goals} renderItem={renderGoal} scrollEnabled={false} />
      </ScrollView>

      {/* Модальное окно редактирования */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.goalText}>На сколько пополнить</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveAmount}
            >
              <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Выберите новый статус:</Text>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("В процессе накопления");
                setHighlightedStatus("В процессе накопления");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "В процессе накопления" &&
                    styles.highlightedOption,
                ]}
              >
                В процессе накопления
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("Достигнута");
                setHighlightedStatus("Достигнута");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "Достигнута" &&
                    styles.highlightedOption,
                ]}
              >
                Достигнута
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("Отменена");
                setHighlightedStatus("Отменена");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "Отменена" && styles.highlightedOption,
                ]}
              >
                Отменена
              </Text>
            </TouchableOpacity>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={updateGoalStatus}
            >
              <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStatusModalVisible(false);
                setErrorMessage(null);
              }}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  Addbutton: {
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  personalORgroupAccount: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personalORgroupAccountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  arrowIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noGoalsText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  valuesGoals: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FF6347",
  },
  EDicon: {
    flexDirection: "row",
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  edit: {
    width: 35,
    height: 35,
    tintColor: "#3338EB",
    marginRight: 5,
  },
  delete: {
    width: 35,
    height: 35,
    tintColor: "red",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    marginVertical: 10,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
  cancelText: { color: "red", marginTop: 10 },
  optionText: {
    fontSize: 18,
    paddingVertical: 8,
  },
  highlightedOption: {
    color: "blue",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },

  statusGoals: {
    fontSize: 18,
    color: "#FF6347",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  historyExpense: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",

    marginTop: 20,
  },
  historyExpenseText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});
