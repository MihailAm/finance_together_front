import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "../services/TokenService";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { TransactionSchema } from "../types/TransactionSchema";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type TransactionsRouteProp = RouteProp<RootStackParamList, "Transactions">;

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const [transactions, setTransactions] = useState<TransactionSchema[]>([]);
  const [categories, setCategories] = useState<{ [key: number]: string }>({});
  const { accountId } = route.params;
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const navigation = useNavigation<RootStackParamList>();
  const [users, setUsers] = useState<{ [key: number]: string }>({});

  const fetchTransactions = async (accountId: number) => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(
          `${API_URL}/transactions/account/${accountId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedTransactions = response.data;
        setTransactions(fetchedTransactions);

        const income = fetchedTransactions
          .filter((t: any) => t.type === "доход")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const expense = fetchedTransactions
          .filter((t: any) => t.type === "расход")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);

        // Запрос данных о пользователе для каждого user_id
        const userIds = [
          ...new Set(fetchedTransactions.map((t: any) => t.user_id)),
        ];
        userIds.forEach(async (userId) => {
          const userResponse = await axios.get(`${API_URL}/users/${userId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers((prevUsers) => ({
            ...prevUsers,
            [String(
              userId
            )]: `${userResponse.data.name} ${userResponse.data.surname}`, // Привели userId к строке
          }));
        });
      } catch (error) {
        console.log("Error fetching transactions:", error);
      }
    }
  };

  const fetchCategories = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const categoryMap = response.data.reduce(
          (acc: { [key: number]: string }, category: any) => {
            acc[category.id] = category.name;
            return acc;
          },
          {}
        );
        setCategories(categoryMap);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    }
  };

  const renderTransaction = ({ item }: { item: TransactionSchema }) => {
    return (
      <View style={styles.transactionCard}>
        {item.user_id && users[item.user_id] && (
          <View>
            <Text style={styles.transactionUser}>
              Выполнил: {users[item.user_id]}
            </Text>

            <Text style={styles.transactionCategory}>
              {categories[item.category_id] || "Неизвестная категория"}
            </Text>
          </View>
        )}
        <View>
          <Text style={styles.transactionTitle}>{item.description}</Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            item.type === "доход" ? styles.income : styles.expense,
          ]}
        >
          {item.type === "доход" ? "+" : "-"} {item.amount} ₽
        </Text>
      </View>
    );
  };

  const groupTransactionsByDate = (transactions: TransactionSchema[]) => {
    return transactions.reduce((groups: any, transaction: any) => {
      const date = new Date(transaction.transaction_date)
        .toISOString()
        .split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  useEffect(() => {
    if (accountId) {
      fetchTransactions(accountId);
      fetchCategories();
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions(accountId);
    }, [accountId])
  );

  const groupedTransactions = groupTransactionsByDate(transactions);
  const transactionDates = Object.keys(groupedTransactions);

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Income", { accountId })}
          style={styles.summaryBlock}
        >
          <Text style={styles.summaryTitle}>Доходы</Text>
          <Text style={styles.summaryValue}>+{totalIncome} ₽</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Expense", { accountId })}
          style={styles.summaryBlock}
        >
          <Text style={styles.summaryTitle}>Расходы</Text>
          <Text style={styles.summaryValue}>-{totalExpense} ₽</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>На этом счете пока нет операций</Text>
        </View>
      ) : (
        <FlatList
          data={transactionDates}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateText}>{item}</Text>
              <FlatList
                data={groupedTransactions[item]}
                renderItem={renderTransaction}
                keyExtractor={(t) => t.id.toString()}
              />
            </View>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6347",
  },
  listContainer: {
    paddingBottom: 16,
  },
  dateGroup: {
    marginBottom: 16,
    marginTop: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6347",
  },
  transactionTitle: {
    fontSize: 16,
    color: "#333",
  },
  transactionCategory: {
    fontSize: 16,
    color: "black",
    marginTop: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
  },
  income: {
    color: "#4CAF50",
  },
  expense: {
    color: "#F44336",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#333",
  },
  transactionUser: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
  },
});
