import React from 'react';
import { Modal, View, TextInput, Pressable, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/TrackingCurrentStyles';

type AddTrackingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeText: (text: string) => void;
};

const AddTrackingModal: React.FC<AddTrackingModalProps> = ({ visible, onClose, onSave, onChangeText }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.modalTitle}>Añadir seguimiento</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close-outline" size={30} color="white" />
          </Pressable>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="Nombre del seguimiento"
          placeholderTextColor="#777"
          onChangeText={onChangeText}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: "#004e66", borderColor: "white", borderWidth: 1 }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: "white", paddingHorizontal: 10 }]}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onSave}
          >
            <Text style={[styles.modalButtonText, { paddingHorizontal: 10 }]}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default AddTrackingModal;
