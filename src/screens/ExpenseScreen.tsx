import React from "react";
import TransactionsList from "../components/TransactionsList";

const ExpenseScreen: React.FC<{ route: any }> = ({ route }) => {
  const { accountId } = route.params;
  return <TransactionsList accountId={accountId} transactionType="расход" />;
};

export default ExpenseScreen;
