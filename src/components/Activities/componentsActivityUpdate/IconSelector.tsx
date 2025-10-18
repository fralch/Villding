// components/IconSelector.tsx
/* Este componente es responsable de mostrar los iconos disponibles para la actividad */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [esEditable, setEsEditable] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [failedIcons, setFailedIcons] = useState<{ [key: string]: boolean }>({});

  // Pre-cargar los recursos de imagen para evitar espacios vacíos
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const modules = Object.values(iconImports).filter(Boolean);
        if (modules.length > 0) {
          await Asset.loadAsync(modules as any);
        }
      } catch (e) {
        // En caso de fallo, seguimos y mostramos el fallback por ícono
        console.warn('No se pudieron precargar los íconos:', e);
      } finally {
        setAssetsLoaded(true);
      }
    };
    loadAssets();
  }, [iconImports]);

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

  // Filtrar íconos que tengan import resolvible
  const availableIcons = iconsFiles.filter((name) => !!iconImports[name]);

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
          <View style={[styles.section, { maxHeight: 600 }]}>
            <Text style={styles.sectionTitle}>Todos los íconos</Text>
            <ScrollView 
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.iconGrid}>
                {availableIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={`icon-${index}-${icon}`}
                    onPress={() => {
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    {!assetsLoaded || failedIcons[icon] ? (
                      <MaterialIcons name="error" size={24} color="white" />
                    ) : (
                      <View style={styles.iconImageWrapper}>
                        {(() => {
                          const src = iconImports[icon];
                          const resolved = typeof src === 'string' ? { uri: src } : src;
                          return (
                            <Image
                              source={resolved}
                              style={styles.iconImage}
                              resizeMode="contain"
                              onError={() => setFailedIcons((prev) => ({ ...prev, [icon]: true }))}
                            />
                          );
                        })()}
                      </View>
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