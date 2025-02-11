import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountSchema } from "../types/AccountSchema";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import ColorPickerModal from "../components/ColorPickerModal";
import { API_URL } from "../services/config";
import { getToken } from "../services/GetToken";

const URL = `${API_URL}/accounts/user`;

const HomeScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountSchema[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [accountColors, setAccountColors] = useState<{
    [key: number]: string;
  }>({});
  const navigation = useNavigation<RootStackParamList>();

  const fetchAccounts = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await fetch(URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: AccountSchema[] = await response.json();
          setAccounts(data);
        } else {
          console.log("Failed to fetch accounts");
        }
      } catch (error) {
        console.log("Error fetching accounts:", error);
      }
    } else {
      console.log("No token found");
    }
  };

  const loadColors = async () => {
    try {
      const colors = await AsyncStorage.getItem("accountColors");
      if (colors) {
        setAccountColors(JSON.parse(colors));
      }
    } catch (error) {
      console.log("Error loading colors:", error);
    }
  };

  const saveColors = async (colors: { [key: number]: string }) => {
    try {
      await AsyncStorage.setItem("accountColors", JSON.stringify(colors));
    } catch (error) {
      console.log("Error saving colors:", error);
    }
  };

  const handleColorSelect = (color: string) => {
    if (selectedAccountId !== null) {
      const updatedColors = { ...accountColors, [selectedAccountId]: color };
      setAccountColors(updatedColors);
      saveColors(updatedColors);
      setModalVisible(false);
    }
  };

  const isDarkColor = (color: string): boolean => {
    // Переводим цвет из HEX в RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Рассчитываем яркость цвета
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Если яркость ниже 128, считаем цвет темным
    return brightness < 128;
  };

  const renderAccount = ({ item }: { item: AccountSchema }) => {
    const backgroundColor = accountColors[item.id] || "#fff";
    const textColor = isDarkColor(backgroundColor) ? "#fff" : "#000";

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        onPress={() =>
          navigation.navigate("AccountDetails", {
            accountId: item.id,
            accountName: item.account_name,
            accountBalance: item.balance,
          })
        }
        onLongPress={() => {
          setSelectedAccountId(item.id);
          setModalVisible(true);
        }}
      >
        <Text style={[styles.cardTitle, { color: textColor }]}>
          {item.account_name}
        </Text>
        <Text style={[styles.cardBalance, { color: textColor }]}>
          Баланс: {item.balance} ₽
        </Text>
        <View>
          <Text style={[styles.palette, { color: textColor }]}>
            Удерживайте, чтобы изменить цвет
          </Text>
        </View>
        {selectedAccountId !== null && (
          <ColorPickerModal
            selectedAccountId={selectedAccountId}
            accountColors={accountColors}
            setAccountColors={setAccountColors}
            saveColors={saveColors}
            setSelectedAccountId={setSelectedAccountId}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            onSelectColor={(color: string) => handleColorSelect(color)}
          />
        )}
      </TouchableOpacity>
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
      loadColors();
    }, [])
  );

  return (
    <View style={styles.container}>
      {accounts.length === 0 ? (
        <View style={styles.notAccount}>
          <View>
            <Text>У вас нет пока счетов</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountCreate")}
          >
            <Text style={styles.addaccount}>Добавить счет</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  notAccount: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addaccount: {
    fontSize: 18,
    backgroundColor: "#FF6347",
    padding: 8,
    borderRadius: 8,
    color: "#fff",
    alignItems: "center",
    fontWeight: "500",
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    marginHorizontal: 10,
    width: 330,
    height: 200,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBalance: {
    fontSize: 16,
    color: "#555",
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
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorOption: {
    width: 40,
    height: 40,
    margin: 8,
    borderRadius: 20,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#2196F3",
  },
  palette: {
    position: "absolute",
    top: 105,
    color: "#ccc",
    alignSelf: "center",
  },
});

export default HomeScreen;
