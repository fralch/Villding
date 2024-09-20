import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

interface Task {
  id: string;
  title: string;
  checked: boolean[];
}

interface Section {
  id: string;
  tasks: Task[];
}

const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

const sections: Section[] = [
  {
    id: new Date().getTime().toString(),
    tasks: [
      { id: '3', title: 'Bloquetas SAC', checked: [true, true, true] },
      { id: '4', title: 'Bloquetas SAC', checked: [true, true, false] },
    ],
  },
  // Añadir más secciones según sea necesario
];

const TaskList: React.FC = () => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(2); // Empieza en la "Semana 3"

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={handlePreviousWeek}>
          <Ionicons
            name='chevron-back'
            size={30}
            color={currentWeekIndex === 0 ? '#07374a' : 'white'} // Desactivar si es la primera semana
          />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>{weeks[currentWeekIndex]}</Text>
        <TouchableOpacity onPress={handleNextWeek}>
          <Ionicons
            name='chevron-forward'
            size={30}
            color={currentWeekIndex === weeks.length - 1 ? '#07374a' : 'white'} // Desactivar si es la última semana
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
        style={styles.flatList}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScrollView style={styles.section}>
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
                      name={isChecked ? 'checkmark' : 'ellipse-sharp'}
                      size={isChecked ? 24 : 12}
                      color={isChecked ? '#4ABA8D' : '#D1A44C'}
                      style={styles.icon}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
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
    paddingHorizontal: 0, // Elimina el padding horizontal para permitir que los elementos internos ocupen todo el ancho
  },
  weekSelector: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between', // Cambié a space-between para distribuir los íconos de manera adecuada
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30, // Añadí algo de padding lateral para separar los íconos de los bordes
    alignSelf: 'stretch', // Esto asegura que ocupe todo el ancho disponible
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  weekTitle: {
    color: 'white',
    fontSize: 20,
    marginHorizontal: 10,
  },
  daysRow: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignSelf: 'stretch', // Opción alternativa para ocupar todo el ancho
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1, // Asegura que cada columna ocupe el mismo espacio
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
    marginVertical: 0,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  taskRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#004e66',
    borderRadius: 8,
    marginBottom: 5,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 0,
    marginTop: 5,
  },
  icon: {
    backgroundColor: '#0A3649',
    borderRadius: 5,
    padding: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '14%',
    height: 40,
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
  flatList: {
    flex: 1,
    backgroundColor: '#07374a',
  },
});

export default TaskList;
