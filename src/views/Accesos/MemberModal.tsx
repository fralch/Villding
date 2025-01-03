import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { getSesion, removeSesion, updateSesion } from '../../hooks/localStorageUser';
import axios from "axios";

type MemberModalProps = {
  visible: boolean;
  onClose: () => void;
  admin: boolean;
  user: any;
  project: any;
};

const MemberModal: React.FC<MemberModalProps> = ({
  visible,
  onClose,
  admin,
  user,
  project,
}) => {
  const [member, setMember] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    console.log("useEffect for user:", user);
    console.log(`admin-member-modal: ${admin}`);
    setMember(user);
  }, [user]);

  const getUserSession = useCallback(async () => {
    const userSession = await getSesion();
    console.log("getUserSession:", userSession);
    if (userSession) {
      setUserSession(JSON.parse(userSession));
    }
  }, []);

  useEffect(() => {
    console.log("useEffect for getUserSession");
    getUserSession();
  }, [getUserSession]);

  if (!member) {
    return null;
  }

  console.log("userSession:", userSession.id);
  console.log("member:", member.id);

  const handleMakeAdmin = async () => {
    console.log("handleMakeAdmin:", member.id, project);
    try {
      const response = await axios.post(
        "https://centroesteticoedith.com/endpoint/user/makeadmin",
        {
          user_id: member.id,
          project_id: project,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_TOKEN`,
            "Content-Type": "application/json",
          },
        }
      );
      const rpt = response.data.message;
      console.log("handleMakeAdmin response:", rpt);
      if (rpt === "User is now an admin of the project") {
        onClose();
      } else {
        console.log("Error al agregar al proyecto");
      }
    } catch (error) {
      console.error("Error making admin:", error);
    }
  };

  const handleRemoveAdmin = async () => {
    console.log("handleRemoveAdmin:", member.id, project);
    try {
      const response = await axios.post(
        "https://centroesteticoedith.com/endpoint/user/removeadmin",
        {
          user_id: member.id,
          project_id: project,
        }
      );
      const rpt = response.data.message;
      console.log("handleRemoveAdmin response:", rpt);
      if (rpt === "User is no longer an admin of the project") {
        onClose();
      } else {
        console.log("Error al retirar del proyecto");
      }
    } catch (error) {
      console.error("Error removing admin:", error);
    }
  };

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
            {member.uri ? (
              <Image
                source={{
                  uri:
                    "https://centroesteticoedith.com/endpoint/images/profile/" +
                    member.uri,
                }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/9385/9385289.png",
                }}
                style={styles.avatar}
              />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.email}>{member.email}</Text>
              <Text style={styles.id}>{member.user_code}</Text>
              <Text
                style={[
                  styles.name,
                  {
                    color: member.is_admin == 1 ? "#e74c3c" : "#2ecc71",
                    fontSize: 14,
                    fontWeight: "normal",
                  },
                ]}
              >
                {member.is_admin == 1 ? "Admin" : "User"}
              </Text>
            </View>
          </View>

          {/* Access Section */}
          <View style={styles.accessSection}>
            {admin ? (
              member.is_admin == 0 ? (
                <TouchableOpacity style={styles.adminButton} onPress={handleMakeAdmin}>
                  <Text style={styles.adminText}>Volver administrador</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAdmin}>
                  <Text style={styles.removeText}>Quitar permiso de administrador</Text>
                </TouchableOpacity>
              )
            ) : null}

            {admin ? (
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeText}>Retirar del proyecto</Text>
              </TouchableOpacity>
            ) : userSession.id == member.id ? (
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeText}>Salir del proyecto</Text>
              </TouchableOpacity>
            ) : null}
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
  sectionTitle: {
    color: "white",
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
