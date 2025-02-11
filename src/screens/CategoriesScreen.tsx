import React, { useState, useCallback } from "react";
import axios from "../services/TokenService";
import {
  Button,
  Text,
  View,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import { CategoriesSchema } from "../types/CategoriesSchema";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<CategoriesSchema | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategories = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Ошибка", "Название категории не может быть пустым.");
      return;
    }

    const token = await getToken();
    if (token) {
      try {
        const response = await fetch(`${API_URL}/categories/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCategoryName }),
        });

        if (response.ok) {
          Alert.alert("Успех", "Категория добавлена!");
          setNewCategoryName("");
          setModalVisible(false);
          fetchCategories();
        } else {
          const errorData = await response.json();
          console.log("Error adding category:", errorData);
          Alert.alert(
            "Ошибка",
            errorData.detail || "Не удалось добавить категорию."
          );
        }
      } catch (error) {
        console.log("Error adding category:", error);
      }
    } else {
      console.log("No token found");
    }
  };

  const handleEditCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Ошибка", "Название категории не может быть пустым.");
      return;
    }

    const token = await getToken();
    if (token && currentCategory) {
      try {
        const response = await fetch(
          `${API_URL}/categories/${currentCategory.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newCategoryName }),
          }
        );

        if (response.ok) {
          Alert.alert("Успех", "Категория обновлена!");
          setNewCategoryName("");
          setModalVisible(false);
          fetchCategories();
        } else {
          const errorData = await response.json();
          console.log("Error editing category:", errorData);
          Alert.alert(
            "Ошибка",
            errorData.detail || "Не удалось обновить категорию."
          );
        }
      } catch (error) {
        console.log("Error editing category:", error);
      }
    } else {
      console.log("No token found or no category selected");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    Alert.alert("Подтверждение", "Вы уверены, что хотите удалить категорию?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          const token = await getToken();
          if (token) {
            try {
              const response = await fetch(
                `${API_URL}/categories/${categoryId}/`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert("Успех", "Категория удалена!");
                fetchCategories();
              } else {
                console.log("Error deleting category:", response.status);
              }
            } catch (error) {
              console.log("Error deleting category:", error);
            }
          }
        },
      },
    ]);
  };

  const openEditModal = (category: any) => {
    setCurrentCategory(category);
    setNewCategoryName(category.name);
    setEditMode(true);
    setModalVisible(true);
  };

  const renderCategory = ({ item }: { item: CategoriesSchema }) => (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryText}>{item.name}</Text>
      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Image
            style={styles.editIcon}
            source={require("../../assets/edit.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
          <Image
            style={styles.deleteIcon}
            source={require("../../assets/delete.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <View style={styles.buttonAdd}>
        <Button
          color="#FF6347"
          title="Добавить категорию"
          onPress={() => {
            setEditMode(false);
            setNewCategoryName("");
            setModalVisible(true);
          }}
        />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Редактировать категорию" : "Добавить категорию"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Введите название категории*"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor="#ccc"
            />
            <View style={styles.buttonContainer}>
              <Button
                color="#ccc"
                title="Отмена"
                onPress={() => setModalVisible(false)}
              />
              <Button
                color="#FF6347"
                title="Сохранить"
                onPress={isEditMode ? handleEditCategory : handleAddCategory}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FF6347",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editIcon: {
    tintColor: "#3338EB",
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  deleteIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
    tintColor: "red",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
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
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonAdd: {
    marginTop: 10,
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
});
