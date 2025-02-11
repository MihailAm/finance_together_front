import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const COLOR_OPTIONS = [
  "#FF6347",
  "#4CAF50",
  "#2196F3",
  "#FFC107",
  "#D3D3D3",
  "#FF69B4",
  "#90EE90",
  "#FFD700",
  "#8B4513",
  "#E6E6FA",
  "#40E0D0",
];

interface ColorPickerModalProps {
  selectedAccountId: number;
  accountColors: { [key: number]: string };
  setAccountColors: React.Dispatch<
    React.SetStateAction<{ [key: number]: string }>
  >;
  saveColors: (colors: { [key: number]: string }) => Promise<void>;
  setSelectedAccountId: React.Dispatch<React.SetStateAction<number | null>>;
  visible: boolean;
  onRequestClose: () => void;
  onSelectColor: (color: string) => void;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  onRequestClose,
  onSelectColor,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Выберите цвет</Text>
          <View style={styles.colorPalette}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => onSelectColor(color)}
              />
            ))}
          </View>
          <TouchableOpacity onPress={onRequestClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorOption: {
    width: 40,
    height: 40,
    margin: 8,
    borderRadius: 20,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#2196F3",
  },
});

export default ColorPickerModal;
