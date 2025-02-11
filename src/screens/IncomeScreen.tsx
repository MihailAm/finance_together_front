import React from "react";
import TransactionsList from "../components/TransactionsList";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";

type TransactionsRouteProp = RouteProp<RootStackParamList, "Transactions">;

export default function IncomeScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const { accountId } = route.params;

  return <TransactionsList accountId={accountId} transactionType="доход" />;
}
