// AddAccount.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddAccount = () => {
  return (
    <View style={styles.container}>
      <Text>Добавить новый аккаунт</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddAccount;
