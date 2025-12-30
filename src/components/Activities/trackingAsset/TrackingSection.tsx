import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/TrackingCurrentStyles';
import { Tracking } from '../../../types/interfaces';

type TrackingSectionProps = {
  section: {
    id: string;
    trackings: Tracking[];
  };
  onPress: (tracking: Tracking) => void;
  onLongPress: (tracking: Tracking) => void;
  weekDates: string[]; // Formato ["YYYY-MM-DD", etc.]
  isSelectionMode?: boolean;
  selectedItems?: Set<string>; // keys: "trackingId|YYYY-MM-DD"
  onToggleItem?: (trackingId: string, date: string) => void;
};

const TrackingSection: React.FC<TrackingSectionProps> = ({ 
  section, 
  onPress, 
  onLongPress, 
  weekDates,
  isSelectionMode = false,
  selectedItems = new Set(),
  onToggleItem
}) => {
  
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  const getStatusForDay = (tracking: any, dateIndex: number) => {
    // Obtener la fecha del weekDates en el formato "YYYY-MM-DD"
    const dateStr = weekDates[dateIndex];
    if (!dateStr) return null; // Si no hay fecha, retornar null
    
    // Buscar esta fecha en days_summary
    const dayInfo = tracking.days_summary?.find((d: any) => d.date === dateStr);
    
    if (!dayInfo) return null; // Si no se encuentra información para este día
    
    // Determinar el estado según las reglas
    if (dayInfo.has_completed && dayInfo.completed_count > 0 && 
        !dayInfo.has_pending && !dayInfo.has_scheduled) {
      return 'completed'; // Solo mostrar checkmark si todo está completado y no hay nada más
    } else if (dayInfo.has_pending) {
      return 'pending'; // Mostrar círculo amarillo si hay pendientes
    } else if (dayInfo.has_scheduled) {
      return 'scheduled'; // Mostrar círculo blanco si hay programados
    }
    
    return null; // No mostrar nada si no hay actividad
  };
  
  // Función para verificar si una fecha es el día actual
  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    return dateStr === getCurrentDate();
  };
  
  // Función para verificar si una fecha es pasada (menor a la fecha actual)
  const isPast = (dateStr: string) => {
    if (!dateStr) return false;
    const currentDate = getCurrentDate();
    return dateStr < currentDate;
  };
  
  // Función para obtener el color de fondo según la fecha
  const getBackgroundColor = (dateStr: string, isSelected: boolean = false) => {
    if (isSelected) {
      return "#4ABA8D"; // Color seleccionado (verde)
    }
    if (isToday(dateStr)) {
      return "#002a36"; // Color más oscuro para hoy
    } 
    return "#003b4d"; // Color unificado para el resto de días
  };
  
  return (
    <ScrollView style={styles.trackingSection}>
      {section.trackings.map((tracking) => (
        <TouchableOpacity
          key={tracking.id}
          style={styles.taskRow}
          onLongPress={() => !isSelectionMode && onLongPress(tracking)} 
          onPress={() => !isSelectionMode && onPress(tracking)}
          activeOpacity={isSelectionMode ? 1 : 0.7}
        >
          <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">{tracking.title}</Text>
          <View style={styles.iconRow}>
            {weekDates.map((dateStr, i) => {
              const status = getStatusForDay(tracking, i);
              const isSelected = isSelectionMode ? selectedItems.has(`${tracking.id}|${dateStr}`) : false;
              const backgroundColor = getBackgroundColor(dateStr, isSelected);
              
              return (
                <TouchableOpacity
                  key={i}
                  disabled={!isSelectionMode}
                  onPress={() => {
                    if (isSelectionMode && onToggleItem) {
                      onToggleItem(String(tracking.id), dateStr);
                    }
                  }}
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: backgroundColor,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#fff',
                    }
                  ]}
                >
                  {isSelectionMode && isSelected ? (
                     <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    status && (
                      <Ionicons
                        name={
                          status === 'completed' 
                            ? "checkmark" 
                            : status === 'scheduled' 
                              ? "ellipse-outline" 
                              : "ellipse-sharp"
                        }
                        size={status === 'completed' ? 24 : 12}
                        color={
                          status === 'completed' 
                            ? "#4ABA8D"  // Verde para completados
                            : status === 'scheduled' 
                              ? "#D1A44C" // Blanco para programados
                              : "#D1A44C"  // Amarillo para pendientes
                        }
                        style={styles.icon}
                      />
                    )
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default TrackingSection;