import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AddAccountButtonProps {
  onPress: () => void;
}

const AddAccountButton: React.FC<AddAccountButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  },
});

export default AddAccountButton;
