import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet, Switch } from "react-native";
import axios from "axios";
import { RootStackParamList } from "../utils/navigation";
import { GoalContributionSchema } from "../types/GoalContributionSchema";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type HistoryExpenseRouteProp = RouteProp<RootStackParamList, "HistoryExpense">;

interface Contribution extends GoalContributionSchema {
  user_name?: string;
}

interface DecodedToken {
  user_id: number;
}

export default function HistoryExpenseScreen() {
  const route = useRoute<HistoryExpenseRouteProp>();
  const { goalId } = route.params;
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const decoded: DecodedToken = jwtDecode(token);
        setCurrentUserId(decoded.user_id);

        const response = await axios.get(
          `${API_URL}/goals/contributions/${goalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const contributionsData = response.data;

        const userPromises = contributionsData.map(
          async (contribution: GoalContributionSchema) => {
            const userResponse = await axios.get(
              `${API_URL}/users/${contribution.user_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              ...contribution,
              user_name: `${userResponse.data.name} ${userResponse.data.surname}`,
            };
          }
        );

        const contributionsWithUsers = await Promise.all(userPromises);
        setContributions(contributionsWithUsers);
      } catch (err) {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [goalId]);

  const toggleActivePay = async (contributionId: number) => {
    try {
      const token = await getToken();
      const contribution = contributions.find(
        (item) => item.id === contributionId
      );
      if (!contribution) return;

      const newActivePayStatus = !contribution.is_active_pay;

      await axios.patch(
        `${API_URL}/goals/contributions/${contributionId}/toggle-active-pay`,
        { is_active_pay: newActivePayStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setContributions((prev) =>
        prev.map((item) =>
          item.id === contributionId
            ? { ...item, is_active_pay: newActivePayStatus }
            : item
        )
      );
    } catch (error) {
      console.log("Ошибка смены статуса:", error);
    }
  };

  if (loading) return <Text style={styles.message}>Загрузка...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  const groupedData = contributions.reduce((acc, item) => {
    const date = new Date(item.contributed_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, Contribution[]>);

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.keys(groupedData)}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View>
            <Text style={styles.date}>{date}</Text>
            {groupedData[date].map((contribution) => (
              <View key={contribution.id} style={styles.card}>
                <Text style={styles.amount}>
                  Сумма: {contribution.amount} ₽
                </Text>
                <Text style={styles.user}>
                  Пополнил: {contribution.user_name}
                </Text>
                {currentUserId === contribution.user_id && (
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Автомесячное списывание:
                    </Text>
                    <Switch
                      value={contribution.is_active_pay}
                      onValueChange={() => toggleActivePay(contribution.id)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#FF6347",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  user: {
    fontSize: 14,
    color: "gray",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
});
