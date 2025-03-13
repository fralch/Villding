import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/TrackingCurrentStyles';

type DayColumnProps = {
  day: string;
  date: string;
  isToday: boolean;
};

const DayColumn: React.FC<DayColumnProps> = ({ day, date, isToday }) => (
  <View style={[styles.dayColumn, isToday && { backgroundColor: "#0A3649", borderRadius: 8 }]}>
    <Text style={[styles.dayText, isToday && { color: "#4ABA8D" }]}>{day}</Text>
    <Text style={[styles.dateText, isToday && { color: "#4ABA8D" }]}>{date}</Text>
  </View>
);

export default DayColumn;
