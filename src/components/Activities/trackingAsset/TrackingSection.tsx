import React from 'react';
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
};

const TrackingSection: React.FC<TrackingSectionProps> = ({ section, onPress, onLongPress }) => (
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
          {tracking.checked &&
            tracking.checked.map((isChecked, i) => (
              <View
                key={i}
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isChecked === -1 ? "#004e66" : "#0A3649",
                  },
                ]}
              >
                <Ionicons
                  name={isChecked == 1 ? "checkmark" : isChecked == -1 ? "ellipse-outline" : "ellipse-sharp"}
                  size={isChecked === 1 ? 24 : 12}
                  color={isChecked === 1 ? "#4ABA8D" : "#D1A44C"}
                  style={styles.icon}
                />
              </View>
            ))}
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default TrackingSection;
