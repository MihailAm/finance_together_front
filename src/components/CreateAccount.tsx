import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { AccountCreateSchemaUser } from "../types/AccountSchema";

interface CreateAccountProps {
  onAddAccount: (newAccount: AccountCreateSchemaUser) => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onAddAccount }) => {
  const [accountName, setAccountName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = () => {
    if (!accountName) {
      setError("Имя обязательно!");
      return;
    }

    const newAccount: AccountCreateSchemaUser = {
      account_name: accountName,
    };
    onAddAccount(newAccount);
    setError("");
    setAccountName("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Создание нового счета</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите имя*"
          value={accountName}
          onChangeText={setAccountName}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          color="#FF6347"
          title="Добавить аккаунт"
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 50,
    borderRadius: 10,
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

export default CreateAccount;
