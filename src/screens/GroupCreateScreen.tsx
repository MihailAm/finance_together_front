import { useNavigation } from "@react-navigation/native";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

export default function GroupCreateScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Имя группы обязательно!");
      return;
    }

    setError("");

    const token = await getToken();
    if (!token) {
      console.log("Токен не найден");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/groups/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName.trim() }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        console.log("Ошибка при создании группы");
      }
    } catch (error) {
      console.log("Ошибка запроса:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Создать группу</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите имя группы*"
          value={groupName}
          onChangeText={setGroupName}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          title="Создать группу"
          onPress={handleCreateGroup}
          color="#FF6347"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
