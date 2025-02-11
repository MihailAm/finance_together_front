import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        {isConnected ? (
          <AppNavigator />
        ) : (
          <View style={styles.noInternet}>
            <Text style={styles.text}>Нет соединения с интернетом</Text>
          </View>
        )}
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  noInternet: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8d7da",
  },
  text: {
    fontSize: 18,
    color: "#721c24",
  },
});

export default App;
