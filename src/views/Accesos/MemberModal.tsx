import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';

type MemberModalProps = {
  visible: boolean;
  onClose: () => void;
  admin: boolean;
};

const MemberModal: React.FC<MemberModalProps> = ({ visible, onClose, admin}) => {
  const member = {
    name: 'Jaime Contreras',
    email: 'jaimeec@gmail.com',
    id: 'K8567L2',
    avatar: 'https://www.startplatz.de/wp-content/uploads/2014/02/sebastian-b%C3%BCttner1-e1415696229562-300x300.jpg', // Reemplaza con la URL real o un avatar predeterminado.
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Miembro</Text>
            <TouchableOpacity>
              <Text style={styles.headerButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Member Info */}
          <View style={styles.memberInfo}>
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.email}>{member.email}</Text>
              <Text style={styles.id}>{member.id}</Text>
            </View>
          </View>

          {/* Access Section */}
          <View style={styles.accessSection}>
          {
            !admin ? (<TouchableOpacity style={styles.adminButton}>
              <Text style={styles.adminText}>Volver administrador</Text>
            </TouchableOpacity>) :   <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeText}>Quitar permiso de administrador</Text>
          </TouchableOpacity>
          }
        
          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeText}>Retirar del proyecto</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#05222F',
    width: '90%',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    color: '#33baba',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    color: '#B0C4DE',
    fontSize: 14,
  },
  id: {
    color: '#B0C4DE',
    fontSize: 12,
  },
  accessSection: {
    borderTopWidth: 1,
    borderTopColor: '#004466',
    paddingTop: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 14,
  },
  adminButton: {
    borderWidth: 1,
    borderColor: "#00FFFF", // Color de borde cian
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  adminText: {
    color: "#00FFFF",
    fontSize: 16,
    textAlign: "center",
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#FF0000", // Color de borde rojo
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  removeText: {
    color: "#FF0000",
    fontSize: 16,
    textAlign: "center",
  },
});

export default MemberModal;
