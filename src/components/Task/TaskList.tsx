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
  checked: boolean[];
}

interface Section {
  title: string;
  tasks: Task[];
}

const sections: Section[] = [
  {
    title: 'Primer piso - torre "A"',
    tasks: [
      { id: '1', title: 'Bloquetas SAC', checked: [true, true, false] },
      {
        id: '2',
        title: 'Piso laminado - dpt 101 Torre "B"',
        checked: [true, false, false],
      },
    ],
  },
  {
    title: 'Bloquetas SAC',
    tasks: [
      { id: '3', title: 'Bloquetas SAC', checked: [true, true, true] },
      { id: '4', title: 'Bloquetas SAC', checked: [true, true, false] },
    ],
  },
  // Añadir más secciones según sea necesario
];

const TaskList: React.FC = () => {
  return (
    <View style={styles.container}>
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
          <View
            key={index}
            style={styles.dayColumn}
          >
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.dateText}>{`0${index + 5}/05`}</Text>
          </View>
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
                <View style={styles.iconRow}>
                  {task.checked.map((isChecked, i) => (
                    <Ionicons
                      key={i}
                      name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isChecked ? 'green' : 'gray'}
                      style={styles.icon}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      />

      {/* Add new task button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons
          name='add-circle-outline'
          size={24}
          color='white'
        />
        <Text style={styles.addButtonText}>Añadir seguimiento</Text>
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
  dayColumn: {
    alignItems: 'center',
  },
  dayText: {
    color: 'white',
    fontSize: 14,
  },
  dateText: {
    color: '#7bc4c4',
    fontSize: 12,
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
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#006680',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default TaskList;
