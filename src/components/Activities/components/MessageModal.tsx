// components/MessageModal.tsx
/* Este componente es responsable de mostrar un modal de confirmación  */
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface MessageModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ visible, message, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      {/* Your modal content */}
    </Modal>
  );
};

export default MessageModal;