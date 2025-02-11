import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import axios from "../services/TokenService";
import { PlannedExpSchema } from "../types/PlannedExpSchema";
import { ScrollView } from "react-native-gesture-handler";
import { API_URL } from "../services/config";

type AccountDetailsRouteProp = RouteProp<RootStackParamList, "AccountDetails">;

export default function AccountDetailsScreen() {
  const route = useRoute<AccountDetailsRouteProp>();
  const { accountId, accountName, accountBalance } = route.params;
  const [currentName, setCurrentName] = useState(accountName);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState(accountName);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpSchema[]>(
    []
  );
  const navigation = useNavigation<RootStackParamList>();

  const fetchPlannedExpenses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/planned_expenses/account/${accountId}`
      );
      setPlannedExpenses(response.data);
    } catch (err) {
      console.log("Ошибка при получении плановых операций:", err);
    }
  };

  const deletePlannedExpense = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/planned_expenses/${id}`);
      setPlannedExpenses((prev) => prev.filter((expense) => expense.id !== id));
      Alert.alert("Успешно", "Плановая операция удалена.");
    } catch (err) {
      console.log("Ошибка при удалении плановой операции:", err);
      Alert.alert("Ошибка", "Не удалось удалить плановую операцию.");
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Удалить операцию",
      "Вы уверены, что хотите удалить эту плановую операцию?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => deletePlannedExpense(id),
        },
      ]
    );
  };

  useEffect(() => {
    fetchPlannedExpenses();
  }, [accountId]);

  const renameAccount = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/accounts/rename/${accountId}`,
        {
          account_name: newName,
        }
      );

      if (response.data?.name) {
        setCurrentName(response.data.name);
      } else {
        console.log("Сервер не вернул обновлённое название аккаунта");
      }

      setIsModalVisible(false);
      navigation.goBack();
    } catch (err) {
      console.log("Ошибка при обновлении аккаунта:", err);
      Alert.alert("Ошибка", "Не удалось обновить название аккаунта.");
    }
  };

  const renderPlannedExpense = ({ item }: { item: PlannedExpSchema }) => (
    <View style={styles.plannedExpenseItem}>
      <Text style={styles.plannedExpenseText}>
        День:{" "}
        <Text style={styles.dataPE}>
          {item.dur_date.toString().split("T")[0]}
        </Text>
      </Text>
      <Text style={styles.plannedExpenseText}>
        Сколько: <Text style={styles.dataPE}>{item.amount} ₽</Text>
      </Text>
      <Text style={styles.plannedExpenseText}>{item.description}</Text>
      <TouchableOpacity
        onPress={() => confirmDelete(item.id)}
        style={styles.deleteIconWrapper}
      >
        <Image
          style={styles.deleteButton}
          source={require("../../assets/delete.png")}
        />
      </TouchableOpacity>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchPlannedExpenses();
    }, [])
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Изменить название</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={(text) => setNewName(text)}
                placeholder="Введите новое название"
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Отмена"
                  onPress={() => setIsModalVisible(false)}
                  color="#888"
                />
                <Button
                  title="Сохранить"
                  onPress={renameAccount}
                  color="#FF6347"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Основной экран */}
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <View style={styles.header}>
            <Text style={styles.title}>{currentName}</Text>
            <Image
              source={require("../../assets/edit.png")}
              style={styles.editIcon}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.subtitle}>{accountBalance} ₽</Text>
        <View style={styles.operations}>
          {/* Пополнить */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddTransactions", {
                accountId,
                type: "доход",
              })
            }
          >
            <View style={styles.operation}>
              <Image
                source={require("../../assets/deposit.png")}
                style={styles.icon}
              />
              <Text style={styles.operationText}>Пополнить</Text>
            </View>
          </TouchableOpacity>
          {/* Списать */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddTransactions", {
                accountId,
                type: "расход",
              })
            }
          >
            <View style={styles.operation}>
              <Image
                source={require("../../assets/withdraw.png")}
                style={styles.icon}
              />
              <Text style={styles.operationText}>Списать</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.CTcontainer}>
          {/* Категории */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Categories")}
            style={styles.categories}
          >
            <Text style={styles.CTText}>Категории</Text>
          </TouchableOpacity>
          {/* Транзакции */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions", { accountId })}
            style={styles.transactions}
          >
            <Text style={styles.CTText}>Операции по счету</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.goalsContainer}
          onPress={() => navigation.navigate("Goals", { accountId })}
        >
          <Text style={styles.goalsText}>Цели</Text>
          <Image
            style={styles.arrowIcon}
            source={require("../../assets/arrow.png")}
          />
        </TouchableOpacity>
        <View>
          <View style={styles.PEheader}>
            <Text style={styles.plannedExp}>Плановые операции</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddPlannedExp", { accountId })
              }
            >
              <Text style={styles.addButton}>Добавить</Text>
            </TouchableOpacity>
          </View>

          {/* Выводим список плановых операций */}

          <FlatList
            data={plannedExpenses}
            renderItem={renderPlannedExpense}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.plannedExpensesList}
            scrollEnabled={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  editIcon: {
    width: 24,
    height: 24,
    marginLeft: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginLeft: 30,
    fontWeight: "bold",
  },
  operations: {
    backgroundColor: "#FF6347",
    width: "90%",
    alignSelf: "center",
    paddingVertical: 20,
    borderRadius: 10,
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  operation: {
    alignItems: "center",
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 8,
  },
  operationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  CTcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
    marginTop: 40,
  },
  categories: {
    flex: 1,
    backgroundColor: "#FF6347",
    height: 100,
    padding: 10,
    borderRadius: 15,
    marginRight: 15,
  },
  transactions: {
    flex: 1,
    backgroundColor: "#FF6347",
    height: 100,
    padding: 10,
    borderRadius: 15,
  },
  CTText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  PEheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
    marginTop: 30,
  },
  plannedExp: {
    fontSize: 20,
    fontWeight: "bold",
  },
  plannedExpensesList: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  plannedExpenseItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  plannedExpenseText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  addButton: {
    color: "#FF6347",
    fontSize: 18,
    fontWeight: "bold",
  },
  dataPE: {
    color: "#FF6347",
  },
  deleteButton: {
    width: 30,
    height: 30,
    tintColor: "red",
  },
  deleteIconWrapper: {
    position: "absolute",
    bottom: 65,
    right: 5,
    padding: 5,
  },
  goalsContainer: {
    width: "90%",
    backgroundColor: "#FF6347",
    flexDirection: "row",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
    alignSelf: "center",
    marginTop: 30,
  },
  goalsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  arrowIcon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
});
