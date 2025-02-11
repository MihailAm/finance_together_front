import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import AuthScreen from "../screens/AuthScreen";
import { HomeTabs } from "./tabsNavigation";
import { useAuth } from "../context/AuthContext";
import CreateAccount from "../screens/AccountCreateScreen";
import AccountDetailsScreen from "../screens/AccountDetailsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AddTransactionsScreen from "../screens/AddTransactionsScreen";
import IncomeScreen from "../screens/IncomeScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import AddPlannedExpScreen from "../screens/AddPlannedExpScreen";
import GoalsScreen from "../screens/GoalsScreen";
import AddDebtsScreen from "../screens/AddDebtsScreen";
import AddGoalScreen from "../screens/AddGoalScreen";
import GroupCreateScreen from "../screens/GroupCreateScreen";
import GroupAccountsScreen from "../screens/GroupAccountsScreen";
import AddGroupAccountScreen from "../screens/AddGroupAccountScreen";
import GroupMembersScreen from "../screens/GroupMembersScreen";
import HistoryExpenseScreen from "../screens/HistoryExpenseScreen";

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return (
      <View style={styles.loaderContainer}>
        <Text>
          <ActivityIndicator size="large" />
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="HomeScreen"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AccountCreate"
            component={CreateAccount}
            options={{
              title: "Добавление счета",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AccountDetails"
            component={AccountDetailsScreen}
            options={{
              title: "Детали счета",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Categories"
            component={CategoriesScreen}
            options={{
              title: "Категории",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Transactions"
            component={TransactionsScreen}
            options={{
              title: "Операции по счету",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AddTransactions"
            component={AddTransactionsScreen}
            options={{
              title: "Добавление транзакции",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Income"
            component={IncomeScreen}
            options={{
              title: "Доходы",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Expense"
            component={ExpenseScreen}
            options={{
              title: "Расходы",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AddPlannedExp"
            component={AddPlannedExpScreen}
            options={{
              title: "Добавление плановых операций",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Goals"
            component={GoalsScreen}
            options={{
              title: "Цели",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AddDebts"
            component={AddDebtsScreen}
            options={{
              title: "Добавление долга",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AddGoal"
            component={AddGoalScreen}
            options={{
              title: "Добавление цели",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="GroupCreate"
            component={GroupCreateScreen}
            options={{
              title: "Создание группы",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="GroupAccountsScreen"
            component={GroupAccountsScreen}
            options={{
              title: "Групповой счет",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="AddGroupAccount"
            component={AddGroupAccountScreen}
            options={{
              title: "Добавление счета группы",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="GroupMembers"
            component={GroupMembersScreen}
            options={{
              title: "Участники",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="HistoryExpense"
            component={HistoryExpenseScreen}
            options={{
              title: "История пополнения",
              headerStyle: {
                backgroundColor: "#f4511e",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="AuthScreen"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
