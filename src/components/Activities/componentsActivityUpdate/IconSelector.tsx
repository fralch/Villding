// components/IconSelector.tsx
/* Este componente es responsable de mostrar los iconos disponibles para la actividad */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles/ActivityItemCreateStyles';
import { getActivity } from '../../../hooks/localStorageCurrentActvity';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  iconImports: Record<string, any>;
  iconsFiles: string[];
}

const IconSelector: React.FC<IconSelectorProps> = ({ 
  selectedIcon, 
  onIconSelect,
  iconImports,
  iconsFiles
}) => {
  const recentIcons = iconsFiles.slice(0, 5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [esEditable, setEsEditable] = useState(false);

  // Verificar la editabilidad al cargar el componente
  useEffect(() => {
    const obteniendoActividad = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };
    obteniendoActividad();
  }, []);

  // Refrescar periódicamente el estado de edición
  useEffect(() => {
    const refreshEditableStatus = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };

    // Crear un intervalo para verificar periódicamente
    const intervalId = setInterval(refreshEditableStatus, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  // Si no es editable, no mostrar nada
  if (!esEditable) {
    return null;
  }

  return (
    <View style={{ backgroundColor: "#0a3649", marginBottom: 20 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#05222f",
          padding: 15,
        }}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={{ fontSize: 17, color: "#dedede" }}>
          Seleccionar un ícono
        </Text>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#dedede"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View>
          <View style={[styles.section, { maxHeight: 120 }]}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconRow}>
                {recentIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    {iconImports[icon] ? (
                      <Image
                        source={iconImports[icon]}
                        style={styles.iconImage}
                      />
                    ) : (
                      <MaterialIcons name="error" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={[styles.section, { maxHeight: 600 }]}>
            <Text style={styles.sectionTitle}>Todos los íconos</Text>
            <ScrollView 
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.iconGrid}>
                {iconsFiles.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    {iconImports[icon] ? (
                      <Image
                        source={iconImports[icon]}
                        style={styles.iconImage}
                      />
                    ) : (
                      <MaterialIcons name="error" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default IconSelector;