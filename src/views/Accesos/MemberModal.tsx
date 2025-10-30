import React, { useCallback, useEffect, useState } from "react";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getSesion, removeSesion, updateSesion } from '../../hooks/localStorageUser';
import axios from "axios";
import { API_BASE_URL } from '../../config/api';

type MemberModalProps = {
  visible: boolean;
  onClose: () => void;
  user: any;
  project: any;
};

const MemberModal: React.FC<MemberModalProps> = ({
  visible,
  onClose,
  user,
  project,
}) => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [member, setMember] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // console.log("useEffect for user:", user);
    // console.log(`admin-member-modal: ${admin}`);
    setMember(user);
  }, [user]);

  const getUserSession = useCallback(async () => {
    const userSession = await getSesion();
    // console.log("getUserSession:", userSession);
    if (userSession) {
      setUserSession(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    // console.log("useEffect for getUserSession");
    getUserSession();
  }, [getUserSession]);

  if (!member) {
    return null;
  }

    // console.log("userSession:", userSession.id);
    // console.log("member:", member.id);

  const handleRemoveMember = async () => {
    // console.log("handleRemoveMember:", member.id, project);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/project/detach`,
        {
          project_id: project,
          user_id: member.id,
        }
      );
      const rpt = response.data.message;
      console.log("handleRemoveMember response:", rpt);
      if (rpt === "Project successfully unlinked from user") {
        // quiero que se dirija a la pantalla del proyecto
        navigate("HomeProject" );
      } else {
        console.log("Error al retirar del proyecto");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  }
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity >
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Miembro</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={{
                marginLeft: "auto",
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={[styles.headerButton]}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Member Info */}
          <View style={styles.memberInfo}>
            {member.uri && !imageError ? (
              <Image
                source={{
                  uri: `${API_BASE_URL}/images/profile/${member.uri}`,
                }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <MaterialCommunityIcons name="account" size={28} color="#fff" />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.email}>{member.email}</Text>
              <Text style={styles.id}>{member.user_code}</Text>
            </View>
          </View>

          {/* Access Section */}
          <View style={styles.accessSection}>
            {userSession && userSession.id == member.id ? (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMember}>
                <Text style={styles.removeText}>Salir del proyecto</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMember}>
                <Text style={styles.removeText}>Retirar del proyecto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#05222F",
    width: "90%",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButton: {
    color: "#33baba",
    fontSize: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#0D465E",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    color: "#B0C4DE",
    fontSize: 14,
  },
  id: {
    color: "#B0C4DE",
    fontSize: 12,
  },
  accessSection: {
    borderTopWidth: 1,
    borderTopColor: "#004466",
    paddingTop: 12,
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
