// components/StatusIndicator.tsx
/* Este componente es responsable de mostrar el indicador de estado de la actividad */
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { styles } from '../styles/ActivityItemCreateStyles';

interface StatusIndicatorProps {
  tipoTask: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ tipoTask }) => {
  const getStatusColor = () => {
    switch (tipoTask.toLowerCase()) {
      case "programado": return "#0a3649";
      case "pendiente": return "#d1a44c";
      case "completado": return "#4ec291";
      default: return "#0a3649";
    }
  };

  const renderStatusIcon = () => {
    switch (tipoTask.toLowerCase()) {
      case "programado":
        return <MaterialCommunityIcons name="progress-clock" size={20} color="#d1a44c" />;
      case "pendiente":
        return (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <AntDesign name="clockcircle" size={24} color="#d1a44c" />
          </View>
        );
      case "completado":
        return (
          <View style={{ flexDirection: "row", }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <MaterialCommunityIcons name="clock-check" size={24} color="#4ec291" />
          </View>
        );
    }
  };

  return (
    <>     
      <View
        style={[
          styles.statusProgramado,
          {
            backgroundColor: getStatusColor(),
            borderTopColor: tipoTask.toLowerCase() === "completado" ? "#0a3649" : "#d1a44c",
            borderBottomColor: tipoTask.toLowerCase() === "completado" ? "#0a3649" : "#d1a44c",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 14,
            color: tipoTask.toLowerCase() === "programado" ? "#d1a44c" : "#0a3649",
          }}
        >
          {tipoTask.charAt(0).toUpperCase() + tipoTask.slice(1).toLowerCase()}
        </Text>
      </View>
    </>
  );
};

export default StatusIndicator;