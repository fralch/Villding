import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/TrackingCurrentStyles';

type DayColumnProps = {
  day: string;
  date: string;
  isToday: boolean;
  onDownloadReport?: () => void;
};

const DayColumn: React.FC<DayColumnProps> = ({ day, date, isToday, onDownloadReport }) => (
  <View style={[styles.dayColumn, isToday && { backgroundColor: "#0A3649", borderRadius: 8 }]}>
    <Text style={[styles.dayText, isToday && { color: "#4ABA8D" }]}>{day}</Text>
    <Text style={[styles.dateText, isToday && { color: "#4ABA8D" }]}>{date}</Text>
    {onDownloadReport && (
      <TouchableOpacity
        onPress={onDownloadReport}
        style={{ marginTop: 4 }}
      >
        <Ionicons
          name="download-outline"
          size={16}
          color={isToday ? "#4ABA8D" : "#7bc4c4"}
        />
      </TouchableOpacity>
    )}
  </View>
);

export default DayColumn;
