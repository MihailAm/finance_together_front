import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { AccountCreateSchemaUser } from '../types/AccountSchema'; // Ваш интерфейс

interface CreateAccountProps {
    onAddAccount: (newAccount: AccountCreateSchemaUser) => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onAddAccount }) => {
    const [accountName, setAccountName] = useState<string>(''); // Состояние для хранения имени аккаунта
    const [error, setError] = useState<string>(''); // Состояние для хранения ошибок

    // Обработчик отправки формы
    const handleSubmit = () => {
        if (!accountName) {
            setError('Account name is required.');
            return;
        }

        const newAccount: AccountCreateSchemaUser = { account_name: accountName };
        onAddAccount(newAccount); // Вызываем функцию, переданную через пропсы, чтобы создать аккаунт
        setError(''); // Очистка ошибки после успешной отправки
        setAccountName(''); // Очистка поля ввода
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Account</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter account name"
                value={accountName}
                onChangeText={setAccountName}
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button title="Add Account" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});

export default CreateAccount;