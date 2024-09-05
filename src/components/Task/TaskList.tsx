import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  id: string;
  title: string;
  checked: boolean;
}

interface Section {
  title: string;
  tasks: Task[];
}

const sections: Section[] = [
  {
    title: 'Primer piso - torre "A"',
    tasks: [
      { id: '1', title: 'Bloquetas SAC', checked: true },
      { id: '2', title: 'Piso laminado - dpt 101 Torre "B"', checked: false },
    ],
  },
  // Añadir más secciones según sea necesario
];

const TaskList: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Multifamiliar Barranco</Text>
        <Ionicons
          name='person-circle-outline'
          size={30}
          color='white'
        />
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity>
          <Ionicons
            name='chevron-back'
            size={24}
            color='white'
          />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>Semana 3</Text>
        <TouchableOpacity>
          <Ionicons
            name='chevron-forward'
            size={24}
            color='white'
          />
        </TouchableOpacity>
      </View>

      {/* Days of the week */}
      <View style={styles.daysRow}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => (
          <Text
            key={index}
            style={styles.dayText}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Task sections */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.tasks.map((task) => (
              <View
                key={task.id}
                style={styles.taskRow}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Ionicons
                  name={task.checked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={task.checked ? 'green' : 'gray'}
                />
              </View>
            ))}
          </View>
        )}
      />

      {/* Add new task button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons
          name='add-circle'
          size={60}
          color='green'
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07374a',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekTitle: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  dayText: {
    color: 'white',
    fontSize: 14,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#004e66',
    borderRadius: 8,
    marginBottom: 5,
  },
  taskTitle: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default TaskList;
