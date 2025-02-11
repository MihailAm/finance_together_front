import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import GroupScreen from "../screens/GroupScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export const HomeTabs = () => {
  const navigation = useNavigation<RootStackParamList>();
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      "Подтверждение выхода",
      "Вы уверены, что хотите выйти из аккаунта?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          onPress: async () => {
            try {
              await logout();
              console.log("Выход выполнен");
            } catch (error) {
              console.error("Ошибка при выходе:", error);
              Alert.alert(
                "Ошибка",
                "Не удалось выполнить выход. Попробуйте снова."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#f4511e",
        tabBarInactiveTintColor: "black",

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeScreen") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "GroupAccounts") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "alert-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: "Личные счета",
          tabBarLabel: "Личные",
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => (
            <View style={{ marginRight: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("AccountCreate")}
              >
                <Image
                  source={require("../../assets/add.png")}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="GroupAccounts"
        component={GroupScreen}
        options={{
          title: "Группы",
          tabBarLabel: "Групповые",
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => (
            <View style={{ marginRight: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("GroupCreate")}
              >
                <Image
                  source={require("../../assets/add.png")}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Профиль",
          headerStyle: { backgroundColor: "#f4511e" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => (
            <View style={{ marginRight: 10, marginTop: 5 }}>
              <TouchableOpacity onPress={confirmLogout}>
                <Image
                  source={require("../../assets/logout.png")}
                  style={{ width: 30, height: 30, tintColor: "white" }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
