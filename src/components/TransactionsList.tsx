import React, { useState, useEffect, useCallback } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../services/TokenService";
import { useFocusEffect } from "@react-navigation/native";
import { TransactionSchema } from "../types/TransactionSchema";
import { PieChart } from "react-native-chart-kit";
import { API_URL } from "../services/config";

interface TransactionsListProps {
  accountId: number;
  transactionType: "доход" | "расход";
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  accountId,
  transactionType,
}) => {
  const [transactions, setTransactions] = useState<TransactionSchema[]>([]);
  const [categories, setCategories] = useState<{ [key: number]: string }>({});
  const [users, setUsers] = useState<{ [key: number]: string }>({});

  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      try {
        const response = await axios.get(
          `${API_URL}/transactions/account/${accountId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const filteredTransactions = response.data.filter(
          (t: TransactionSchema) => t.type === transactionType
        );

        setTransactions(filteredTransactions);
        fetchUsers(filteredTransactions);
      } catch (error) {
        console.log("Error fetching transactions:", error);
      }
    }
  };

  const fetchUsers = async (transactions: TransactionSchema[]) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      const uniqueUserIds = [...new Set(transactions.map((t) => t.user_id))];

      const userRequests = uniqueUserIds.map(async (userId) => {
        try {
          const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return { [userId]: `${response.data.name} ${response.data.surname}` };
        } catch (error) {
          console.log(`Error fetching user ${userId}:`, error);
          return { [userId]: "Неизвестный пользователь" };
        }
      });

      const usersData = await Promise.all(userRequests);
      setUsers(Object.assign({}, ...usersData));
    }
  };

  const fetchCategories = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [accountId, transactionType]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [accountId, transactionType])
  );

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: TransactionSchema[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date)
        .toISOString()
        .split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      dateB.localeCompare(dateA)
    );
  };

  const renderTransaction = ({ item }: { item: TransactionSchema }) => (
    <View style={styles.transactionCard}>
      <View>
        <Text style={styles.transactionUser}>
          Выполнил: {users[item.user_id] || "Загрузка..."}
        </Text>
        <Text style={styles.transactionCategory}>
          {categories[item.category_id] || "Неизвестная"}
        </Text>
        <Text style={styles.transactionTitle}>{item.description}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          transactionType === "доход" ? styles.income : styles.expense,
        ]}
      >
        {transactionType === "доход" ? "+" : "-"} {item.amount} ₽
      </Text>
    </View>
  );

  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const getCategoryData = () => {
    const categoryTotals = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        const categoryName =
          categories[transaction.category_id] || "Неизвестная";
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
        return acc;
      },
      {}
    );

    return Object.keys(categoryTotals).map((key, index) => ({
      name: key,
      amount: categoryTotals[key],
      color: `hsl(${index * 40}, 70%, 60%)`,
      legendFontColor: "#333",
      legendFontSize: 14,
    }));
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <View style={styles.container}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Общая сумма:</Text>
        <Text
          style={[
            styles.totalAmount,
            transactionType === "доход" ? styles.income : styles.expense,
          ]}
        >
          {transactionType === "доход" ? "+" : "-"} {totalAmount} ₽
        </Text>
      </View>
      <PieChart
        data={getCategoryData()}
        width={320}
        height={210}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <FlatList
        data={groupedTransactions}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, transactions] }) => (
          <View>
            <Text style={styles.dateHeader}>{date}</Text>
            {transactions.map((transaction) => (
              <View key={transaction.id}>
                {renderTransaction({ item: transaction })}
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
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
  },
  transactionCategory: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
  transactionUser: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
  },
  totalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    color: "#777",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  income: { color: "#4CAF50" },
  expense: { color: "#F44336" },
});

export default TransactionsList;
