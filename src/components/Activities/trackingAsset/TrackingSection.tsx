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
  weekDates: string[]; // Formato ["17/3", "18/3", etc.]
};

const TrackingSection: React.FC<TrackingSectionProps> = ({ section, onPress, onLongPress, weekDates }) => {
  
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  // Función para obtener la fecha actual en formato "DD/M"
  const getCurrentDateShort = () => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth() + 1}`;
  };
  
  const getStatusForDay = (tracking: any, dateIndex: number) => {
    // Obtener la fecha del weekDates en el formato "DD/M"
    const weekDateStr = weekDates[dateIndex]; // "17/3"
    if (!weekDateStr) return null; // Si no hay fecha, retornar null
    
    // Convertir el formato "DD/M" a "YYYY-MM-DD" para comparar con days_summary
    const [day, month] = weekDateStr.split('/');
    // Asumimos que estamos en 2025 basado en los logs
    const fullDateStr = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Buscar esta fecha en days_summary
    const dayInfo = tracking.days_summary?.find((d: any) => d.date === fullDateStr);
    
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
    const currentDateShort = getCurrentDateShort();
    return dateStr === currentDateShort;
  };
  
  // Función para verificar si una fecha es pasada (menor a la fecha actual)
  const isPast = (dateStr: string) => {
    if (!dateStr) return false;
    
    const [day, month] = dateStr.split('/');
    // Crear fecha en formato YYYY-MM-DD para comparación
    const fullDate = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const currentDate = getCurrentDate();
    
    return fullDate < currentDate;
  };
  
  // Función para obtener el color de fondo según la fecha
  const getBackgroundColor = (dateStr: string) => {
    if (isToday(dateStr)) {
      return "#002a36"; // Color más oscuro para hoy
    } else if (isPast(dateStr)) {
      return "#003b4d"; // Color oscuro para días pasados
    } else {
      return "#004e66"; // Color original para días futuros
    }
  };
  
  return (
    <ScrollView style={styles.trackingSection}>
      {section.trackings.map((tracking) => (
        <TouchableOpacity
          key={tracking.id}
          style={styles.taskRow}
          onLongPress={() => onLongPress(tracking)} // CAMBIO: Pasar el tracking específico
          onPress={() => onPress(tracking)}
        >
          <Text style={styles.taskTitle}>{tracking.title}</Text>
          <View style={styles.iconRow}>
            {weekDates.map((dateStr, i) => {
              const status = getStatusForDay(tracking, i);
              const backgroundColor = getBackgroundColor(dateStr);
              
              return (
                <View
                  key={i}
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: backgroundColor,
                    }
                  ]}
                >
                  {status && (
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
                  )}
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