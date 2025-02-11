import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { AccountSchema } from "../types/AccountSchema";
import ColorPickerModal from "../components/ColorPickerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type GroupAccountsRouteProp = RouteProp<RootStackParamList, "GroupAccounts">;

const GroupAccountsScreen: React.FC = () => {
  const route = useRoute<GroupAccountsRouteProp>();
  const [accounts, setAccounts] = useState<AccountSchema[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [accountColors, setAccountColors] = useState<{ [key: number]: string }>(
    {}
  );
  const { groupId } = route.params;
  const navigation = useNavigation<RootStackParamList>();
  const [modalVisible, setModalVisible] = useState(false);

  const fetchGroupAccounts = async () => {
    const token = await getToken();
    try {
      const response = await fetch(`${API_URL}/accounts/group/${groupId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: AccountSchema[] = await response.json();
        setAccounts(Array.isArray(data) ? data : [data]);
      } else {
        console.log("Failed to fetch group accounts");
      }
    } catch (error) {
      console.log("Error fetching group accounts:", error);
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

  const handleColorSelect = (color: string) => {
    if (selectedAccountId !== null) {
      const updatedColors = { ...accountColors, [selectedAccountId]: color };
      setAccountColors(updatedColors);
      saveColors(updatedColors);
      setModalVisible(false);
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

  useEffect(() => {
    fetchGroupAccounts();
    loadColors();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGroupAccounts();
      loadColors();
    }, [])
  );

  const renderAccount = ({ item }: { item: AccountSchema }) => {
    const backgroundColor = accountColors[item.id] || "#fff";
    const textColor = isDarkColor(backgroundColor) ? "#fff" : "#000";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AccountDetails", {
            accountId: item.id,
            accountName: item.account_name,
            accountBalance: item.balance,
          })
        }
        style={[styles.card, { backgroundColor }]}
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
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {accounts.length === 1 ? (
        <></>
      ) : (
        <Button
          title="Добавить счет"
          onPress={() => navigation.navigate("AddGroupAccount", { groupId })}
          color="#f4511e"
        />
      )}
      {accounts.length === 0 ? (
        <View style={styles.notAccount}>
          <Text>У группы нет счета</Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginTop: 20,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
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
  notAccount: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  palette: {
    position: "absolute",
    top: 105,
    color: "#ccc",
    alignSelf: "center",
  },
});

export default GroupAccountsScreen;
