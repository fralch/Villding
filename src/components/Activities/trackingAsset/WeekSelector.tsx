import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/TrackingCurrentStyles';

type WeekSelectorProps = {
  currentWeekIndex: number;
  onWeekChange: (direction: string) => void;
};

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeekIndex, onWeekChange }) => (
  <View style={styles.weekSelector}>
    <TouchableOpacity onPress={() => onWeekChange('left')} disabled={currentWeekIndex === 0}>
      <Ionicons name="chevron-back" size={30} color={currentWeekIndex === 0 ? "#07374a" : "white"} />
    </TouchableOpacity>
    <Text style={styles.weekTitle}>Semana {currentWeekIndex + 1}</Text>
    <TouchableOpacity
      onPress={() => onWeekChange('right')}
    >
      <Ionicons
        name="chevron-forward"
        size={30}
        color="white"
      />
    </TouchableOpacity>
  </View>
);

export default WeekSelector;
