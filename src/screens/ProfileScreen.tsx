import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import axios from "../services/TokenService";
import { jwtDecode } from "jwt-decode";
import { UserInfoSchema } from "../types/UserInfoSchema";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { DebtsSchema } from "../types/DebtsSchema";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

const ProfileScreen: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfoSchema | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [debts, setDebts] = useState<DebtsSchema[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [newAmount, setNewAmount] = useState("");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [highlightedStatus, setHighlightedStatus] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigation = useNavigation<RootStackParamList>();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const decodedToken: any = jwtDecode(token);
        setUserId(decodedToken.user_id);
        fetchUserInfo(decodedToken.user_id);
        fetchUserDebts();
      }
    })();
  }, []);

  const fetchUserInfo = async (id: number) => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.log("Error fetching user info:", error);
      }
    }
  };

  const fetchUserDebts = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/debts/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const debtsWithStatus = await Promise.all(
          response.data.map(async (debt: DebtsSchema) => {
            const status = await AsyncStorage.getItem(`debt_status_${debt.id}`);
            return { ...debt, status: status || debt.status };
          })
        );
        setDebts(debtsWithStatus);
      } catch (error) {
        console.log("Error fetching debts:", error);
      }
    }
  };

  const updateDebtStatus = async () => {
    if (!selectedDebt || !newStatus) {
      setErrorMessage("Выберите новый статус");
      return;
    }

    try {
      await AsyncStorage.setItem(`debt_status_${selectedDebt.id}`, newStatus);

      setDebts((prevDebts) =>
        prevDebts.map((debt) =>
          debt.id === selectedDebt.id ? { ...debt, status: newStatus } : debt
        )
      );

      setStatusModalVisible(false);
      setErrorMessage(null);
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  const updateDebt = async () => {
    if (!selectedDebt || !newAmount) {
      setErrorMessage("Введите сумму");
      return;
    }

    const token = await getToken();
    if (token) {
      try {
        await axios.patch(
          `${API_URL}/debts/update/amount`,
          {
            id: selectedDebt.id,
            amount: parseFloat(newAmount),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchUserDebts();
        setModalVisible(false);
        setNewAmount("");
        setErrorMessage(null);
      } catch (error) {
        console.log("Error updating debt:", error);
      }
    }
  };

  const deleteDebt = async (id: number) => {
    Alert.alert("Удаление", "Вы уверены, что хотите удалить этот долг?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        onPress: async () => {
          const token = await getToken();
          if (token) {
            try {
              await axios.delete(`${API_URL}/debts/${id}`);
              fetchUserDebts();
              setDebts((prevDebts) =>
                prevDebts.filter((debt) => debt.id !== id)
              );
            } catch (error) {
              console.log("Ошибка при удалении долга:", error);
            }
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserDebts();
    }, [])
  );

  // Функция для изменения цвета текста в зависимости от статуса
  const getDebtTextColor = (status: string) => {
    switch (status) {
      case "Выплачено":
        return "green";
      case "Отменено":
        return "gray";
      default:
        return "#FF6347";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {userInfo ? (
          <View style={styles.contentContainer}>
            <View style={styles.blokUserInfo}>
              <View style={styles.circle}>
                <Text style={styles.initials}>
                  {userInfo.name?.[0] || ""}
                  {userInfo.surname?.[0] || ""}
                </Text>
              </View>
              <Text style={styles.fi}>
                {userInfo.name} {userInfo.surname}
              </Text>
            </View>
            <View style={styles.debtsContainer}>
              <Text style={styles.debtsText}>Долги</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AddDebts")}>
                <Text style={styles.addDebtsButton}>Добавить</Text>
              </TouchableOpacity>
            </View>

            {debts.length > 0 ? (
              <FlatList
                data={debts}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.debtItem}>
                    <Text
                      style={[
                        styles.debtName,
                        { color: getDebtTextColor(item.status) },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.debtText}>
                      Дата возврата:{" "}
                      <Text style={styles.debtValues}>
                        {item.due_date.split("T")[0]}
                      </Text>
                    </Text>
                    <Text style={styles.debtText}>
                      Сумма:{" "}
                      <Text style={styles.debtValues}>{item.amount} ₽</Text>
                    </Text>
                    {item.description && <Text>{item.description}</Text>}
                    <Text
                      style={styles.debtText}
                      onPress={() => {
                        setSelectedDebt(item);
                        setNewStatus(item.status);
                        setStatusModalVisible(true);
                      }}
                    >
                      Статус:{" "}
                      <Text style={styles.debtStatus}>{item.status}</Text>
                    </Text>
                    <View style={styles.EDicon}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDebt(item);
                          setNewAmount(item.amount.toString());
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          style={styles.edit}
                          source={require("../../assets/edit.png")}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteDebt(item.id)}>
                        <Image
                          style={styles.delete}
                          source={require("../../assets/delete.png")}
                        />
                      </TouchableOpacity>
                    </View>
                    <Modal
                      visible={modalVisible}
                      transparent
                      animationType="fade"
                    >
                      <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                          <Text>Введите сумму, которую уже погасили</Text>
                          <TextInput
                            style={styles.input}
                            value={newAmount}
                            onChangeText={setNewAmount}
                            keyboardType="numeric"
                          />
                          {errorMessage && (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                          )}
                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={updateDebt}
                          >
                            <Text style={styles.buttonText}>Сохранить</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setModalVisible(false);
                              setErrorMessage(null);
                            }}
                          >
                            <Text style={styles.cancelText}>Отмена</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noDebtsText}>Долгов нет</Text>
            )}
          </View>
        ) : (
          <Text style={styles.loadingText}>Загрузка...</Text>
        )}
      </View>

      {/* Модальное окно для изменения статуса долга */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Выберите новый статус:</Text>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("Ожидает возврата");
                setHighlightedStatus("Ожидает возврата");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "Ожидает возврата" &&
                    styles.highlightedOption,
                ]}
              >
                Ожидает возврата
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("Выплачено");
                setHighlightedStatus("Выплачено");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "Выплачено" && styles.highlightedOption,
                ]}
              >
                Выплачено
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewStatus("Отменено");
                setHighlightedStatus("Отменено");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  highlightedStatus === "Отменено" && styles.highlightedOption,
                ]}
              >
                Отменено
              </Text>
            </TouchableOpacity>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={updateDebtStatus}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    width: "90%",
    marginTop: 25,
  },
  blokUserInfo: {
    padding: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF6347",
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: "#FF6347",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  fi: {
    fontSize: 23,
    color: "#333",
    marginLeft: 30,
    fontWeight: "500",
  },
  debtsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginHorizontal: 30,
  },
  debtsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addDebtsButton: {
    color: "#FF6347",
    fontSize: 18,
    fontWeight: "bold",
  },
  debtItem: {
    marginTop: 20,
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
  debtName: {
    fontSize: 21,
    color: "#FF6347",
    fontWeight: "bold",
  },
  debtValues: {
    fontSize: 18,
    color: "#FF6347",
  },
  debtStatus: {
    fontSize: 18,
    color: "#FF6347",
    textDecorationLine: "underline",
  },
  noDebtsText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 10,
    color: "gray",
  },
  debtText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  EDicon: {
    flexDirection: "row",
    marginTop: 10,
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
  edit: {
    width: 35,
    height: 35,
    tintColor: "#3338EB",
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
    backgroundColor: "rgba(151, 151, 151, 0.5)",
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
});

export default ProfileScreen;
