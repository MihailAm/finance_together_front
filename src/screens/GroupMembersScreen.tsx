import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import {
  Button,
  Text,
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RootStackParamList } from "../utils/navigation";
import { useState, useEffect, useCallback } from "react";
import { MembersSchema } from "../types/MembersSchema";
import axios from "../services/TokenService";
import { FlatList } from "react-native-gesture-handler";
import { API_URL } from "../services/config";

type GroupMembersRouteProp = RouteProp<RootStackParamList, "GroupMembers">;

export default function GroupMembersScreen() {
  const route = useRoute<GroupMembersRouteProp>();
  const { groupId, role } = route.params;
  const [groupMembers, setGroupMembers] = useState<MembersSchema[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MembersSchema | null>(null);
  const [userNames, setUserNames] = useState<{ [key: number]: string }>({});
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Некорректный email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const fetchGroupMembers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/group_members/${groupId}/members`
      );
      setGroupMembers(response.data);
      const names: { [key: number]: string } = {};
      for (const member of response.data) {
        const userResponse = await axios.get(
          `${API_URL}/users/${member.user_id}`
        );
        names[
          member.user_id
        ] = `${userResponse.data.name} ${userResponse.data.surname}`;
      }
      setUserNames(names);
    } catch (error) {
      console.log("Ошибка получения участников", error);
    }
  };

  useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  const changeUserRole = async (newRole: string) => {
    if (!selectedUser) return;
    try {
      await axios.patch(`${API_URL}/group_members/change/role`, {
        user_id: selectedUser.user_id,
        group_id: groupId,
        role: newRole,
      });
      setRoleModalVisible(false);
      fetchGroupMembers();
    } catch (error) {
      console.log("Ошибка изменения роли", error);
    }
  };

  const addNewMember = async () => {
    if (!validateEmail(email)) return;
    try {
      const response = await axios.post(
        `${API_URL}/group_members/members/add`,
        {
          group_id: groupId,
          email,
          role: "Участник",
        }
      );
      if (response.status === 200) {
        setModalVisible(false);
        fetchGroupMembers();
      }
    } catch (error) {
      console.log("Ошибка добавления участника", error);
    }
  };

  const removeMember = async (userId: number) => {
    Alert.alert("Подтверждение", "Вы уверены, что хотите удалить участника?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/group_members/members/delete`, {
              data: { member_id: userId, group_id: groupId },
            });
            fetchGroupMembers();
          } catch (error) {
            console.log("Ошибка удаления участника", error);
          }
        },
      },
    ]);
  };

  const renderGroupMembers = ({ item }: { item: MembersSchema }) => (
    <View style={styles.card}>
      <Text style={styles.memberName}>
        {userNames[item.user_id]}{" "}
        {item.role === "Администратор" ? "- Администратор" : ""}
      </Text>
      {role === "Администратор" && item.role !== "Администратор" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => {
              setSelectedUser(item);
              setRoleModalVisible(true);
            }}
          >
            <Text style={styles.roleButtonText}>Изменить роль</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeMember(item.user_id)}
          >
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchGroupMembers();
    }, [])
  );

  return (
    <View style={styles.container}>
      {role === "Администратор" ? (
        <Button
          title="Добавить участника"
          onPress={() => setModalVisible(true)}
          color="#FF6347"
        />
      ) : (
        <Text></Text>
      )}

      <FlatList
        data={groupMembers}
        renderItem={renderGroupMembers}
        keyExtractor={(item) => item.id.toString()}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Добавить участника</Text>

            <TextInput
              style={styles.input}
              placeholder="Введите email"
              value={email}
              onChangeText={setEmail}
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addNewMember}
              >
                <Text style={styles.buttonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Изменить роль</Text>

            <View>
              {selectedUser?.role === "Участник" && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => changeUserRole("Администратор")}
                >
                  <Text style={styles.buttonText}>Сделать администратором</Text>
                </TouchableOpacity>
              )}
              {selectedUser?.role === "Администратор" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => changeUserRole("Участник")}
                >
                  <Text style={styles.buttonText}>Сделать участником</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,

    borderColor: "#FF6347",
    borderWidth: 1,
    marginTop: 20,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roleButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  roleButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
