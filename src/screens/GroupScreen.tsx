import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import axios from "../services/TokenService";
import { GroupSchema } from "../types/GroupSchema";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { API_URL } from "../services/config";

const GroupScreen: React.FC = () => {
  const [groups, setGroups] = useState<GroupSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<RootStackParamList>();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/group_members/`);
      setGroups(response.data);
    } catch (error) {
      console.log("Ошибка при загрузке групп:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const handleDeleteGroup = (groupId: number) => {
    Alert.alert(
      "Удаление группы",
      "Вы уверены, что хотите удалить эту группу?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/groups/${groupId}/`);
              setGroups((prevGroups) =>
                prevGroups.filter((group) => group.group_id !== groupId)
              );
            } catch (error) {
              console.log("Ошибка при удалении группы:", error);
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: GroupSchema }) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{item.group_name}</Text>
      <Text style={styles.groupRole}>Ты: {item.role}</Text>
      <TouchableOpacity
        style={styles.members}
        onPress={() =>
          navigation.navigate("GroupMembers", {
            groupId: item.group_id,
            role: item.role,
          })
        }
      >
        <Text style={styles.membersText}>
          {item.role === "Администратор"
            ? "Управление участниками"
            : "Участники"}
        </Text>
      </TouchableOpacity>
      <View style={styles.viewDetailsButton}>
        <View style={styles.viewAccount}>
          <Button
            title="Посмотреть счет"
            onPress={() =>
              navigation.navigate("GroupAccountsScreen", {
                groupId: item.group_id,
              })
            }
            color="#FF6347"
          />
        </View>
        {item.role === "Администратор" ? (
          <TouchableOpacity onPress={() => handleDeleteGroup(item.group_id)}>
            <Image
              style={styles.delete}
              source={require("../../assets/delete.png")}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Загрузка...</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroupItem}
          ListEmptyComponent={
            <View>
              <Text style={styles.emptyText}>Групп пока нет</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("GroupCreate")}
              >
                <Text style={styles.addGroup}>Добавить счет</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  groupCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  groupRole: {
    fontSize: 16,
    color: "#666",
    marginVertical: 5,
  },
  members: {
    paddingTop: 10,
    width: "60%",
  },
  membersText: {
    color: "#FF6347",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  viewDetailsButton: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  delete: {
    width: 40,
    height: 40,
    tintColor: "red",
    bottom: 2,
  },
  viewAccount: {
    width: "80%",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  addGroup: {
    fontSize: 18,
    backgroundColor: "#FF6347",
    padding: 8,
    borderRadius: 8,
    color: "#fff",
    alignItems: "center",
    alignSelf: "center",
    fontWeight: "500",
  },
});

export default GroupScreen;
