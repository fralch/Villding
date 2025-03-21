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
  onLongPress: () => void;
  weekDates: string[]; // Formato ["17/3", "18/3", etc.]
};

const TrackingSection: React.FC<TrackingSectionProps> = ({ section, onPress, onLongPress, weekDates }) => {
  
  const getStatusForDay = (tracking: any, dateIndex: number) => {
    // Obtener la fecha del weekDates en el formato "DD/M"
    const weekDateStr = weekDates[dateIndex]; // "17/3"
    if (!weekDateStr) return 0; // Si no hay fecha, retornar estado por defecto
    
    // Convertir el formato "DD/M" a "YYYY-MM-DD" para comparar con days_summary
    const [day, month] = weekDateStr.split('/');
    // Asumimos que estamos en 2025 basado en los logs
    const fullDateStr = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Buscar esta fecha en days_summary
    const dayInfo = tracking.days_summary?.find((d: any) => d.date === fullDateStr);
    
    if (!dayInfo) return 0; // Si no se encuentra información para este día
    
    // Determinar el estado según las prioridades
    if (dayInfo.has_completed) {
      return 1; // Completado (verde)
    } else if (dayInfo.has_scheduled) {
      return -1; // En progreso (blanco)
    } else if (dayInfo.has_pending) {
      return 0; // Pendiente (amarillo)
    }
    
    return 0; // Estado por defecto
  };
  
  return (
    <ScrollView style={styles.trackingSection}>
      {section.trackings.map((tracking) => (
        <TouchableOpacity
          key={tracking.id}
          style={styles.taskRow}
          onLongPress={onLongPress}
          onPress={() => onPress(tracking)}
        >
          <Text style={styles.taskTitle}>{tracking.title}</Text>
          <View style={styles.iconRow}>
            {weekDates.map((_, i) => {
              const status = getStatusForDay(tracking, i);
              
              return (
                <View
                  key={i}
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: "#004e66", // Fondo azul oscuro para todos
                    }
                  ]}
                >
                  <Ionicons
                    name={
                      status === 1 
                        ? "checkmark" 
                        : status === -1 
                          ? "ellipse-outline" 
                          : "ellipse-sharp"
                    }
                    size={status === 1 ? 24 : 12}
                    color={
                      status === 1 
                        ? "#4ABA8D"  // Verde para completados
                        : status === -1 
                          ? "#FFFFFF" // Blanco para en progreso (scheduled)
                          : "#D1A44C"  // Amarillo para pendientes
                    }
                    style={styles.icon}
                  />
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default TrackingSection;