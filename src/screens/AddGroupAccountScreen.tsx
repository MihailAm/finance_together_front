import React from "react";
import { View, StyleSheet } from "react-native";
import CreateAccount from "../components/CreateAccount";
import { AccountCreateSchemaUser } from "../types/AccountSchema";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../utils/navigation";
import { getToken } from "../services/GetToken";
import { API_URL } from "../services/config";

type AddGroupAccountRouteProp = RouteProp<
  RootStackParamList,
  "AddGroupAccount"
>;

const AddGroupAccountScreen: React.FC = () => {
  const route = useRoute<AddGroupAccountRouteProp>();
  const { groupId } = route.params;
  const navigation = useNavigation<RootStackParamList>();

  const URL = `${API_URL}/accounts/group`;

  const handleAddAccount = async (newAccount: AccountCreateSchemaUser) => {
    const token = await getToken();
    if (token) {
      try {
        const response = await fetch(URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newAccount,
            group_id: groupId,
          }),
        });

        if (response.ok) {
          navigation.goBack();
        } else {
          console.log("Failed to create account");
        }
      } catch (error) {
        console.log("Error creating account:", error);
      }
    } else {
      console.log("No token found");
    }
  };

  return (
    <View style={styles.container}>
      <CreateAccount onAddAccount={handleAddAccount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddGroupAccountScreen;
