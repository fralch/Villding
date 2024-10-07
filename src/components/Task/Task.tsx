import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
   PanResponder,
   SwitchComponent
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import TaskItemCreate from './TaskItemCreate';


interface Task {
  title: string;
  time: string;
  status: 'Pendiente' | 'Completado' | 'Programado';
}

interface TaskCardProps extends Task {
  setTaskItemCreateType: (type: string) => void; // Agrega setTaskItemCreateType como prop
  showModal: () => void; // Agrega showModal como prop
}

interface DayTasksProps {
  day: string;
  tasks: Task[];
  showModal: () => void;
  setTaskItemCreateType: (type: string) => void; // Agrega setTaskItemCreateType como prop
}


const { height } = Dimensions.get('window');

export default function TaskScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  const screenWidth = Dimensions.get('window').width;
  const headerWidth = React.useRef(new Animated.Value(screenWidth)).current;
  const [currentWeekIndex, setCurrentWeekIndex] = useState(2);
  const [modalOptionsVisible, setModalOptionsVisible] = useState(false);
  const [TaskItemCreateType , setTaskItemCreateType] = useState('Programado');


  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
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
  const goBack = () => {
    navigation.goBack();
  };

  // MODAL 
  const showModal = () => {
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Aparece desde el fondo
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Ocultar el modal con animación hacia abajo
  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: height, // Deslizar hacia abajo para salir
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  // PanResponder para detectar el gesto de deslizamiento hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0; // Solo responde a movimientos hacia abajo
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy); // Mueve el modal con el gesto
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          hideModal(); // Cierra el modal si se desliza lo suficiente hacia abajo
        } else {
          Animated.spring(slideAnim, {
            toValue: 0, // Regresa el modal a su posición original si el deslizamiento no fue suficiente
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  return (
    <View style={styles.container}>

      <ExpoStatusBar style='light' />
      {/* Header */}
      <View style={[styles.header, { width: headerWidth }]}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons
            name='arrow-back'
            size={24}
            color='white'
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Primer piso - torre "A"</Text>
        <TouchableOpacity onPress={() => setModalOptionsVisible(true)}>
          <MaterialIcons
            name='more-vert'
            size={24}
            color='white'
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {/* Semana selector */}
        <View style={{ backgroundColor: '#034757' }}>
          <View style={styles.weekContainer}>
            <Text
              style={{
                fontSize: 40,
                color: 'white',
                width: '80%',
                fontWeight: 'bold',
                alignSelf: 'flex-start',
              }}
            >
              Primer piso - torre "A"
            </Text>
            <Text style={styles.weekText}>Semana 03</Text>
            <Text style={styles.pendingText}>3 pendientes</Text>
          </View>

          {/* Selector de semana con flechas */}
          <View style={styles.weekSelector}>
            <TouchableOpacity
              onPress={handlePreviousWeek}
              disabled={currentWeekIndex === 0}
            >
              <Ionicons
                name='chevron-back'
                size={30}
                color={currentWeekIndex === 0 ? '#07374a' : 'white'} // Desactivar si es la primera semana
              />
            </TouchableOpacity>
            <Text style={styles.weekTitle}>{weeks[currentWeekIndex]}</Text>
            <TouchableOpacity
              onPress={handleNextWeek}
              disabled={currentWeekIndex === weeks.length - 1}
            >
              <Ionicons
                name='chevron-forward'
                size={30}
                color={
                  currentWeekIndex === weeks.length - 1 ? '#07374a' : 'white'
                } // Desactivar si es la última semana
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Lista de tareas */}

        <DayTasks
          day='Miércoles 14, Junio'
          tasks={[
            {
              title: 'Descarga de afirmado',
              time: '11:00 - 12:00',
              status: 'Pendiente',
            },
            {
              title: 'Inter',
              time: '11:00 - 12:00',
              status: 'Pendiente',
            },
          ]}
          showModal={showModal}  // Aquí pasamos showModal como prop
          setTaskItemCreateType={setTaskItemCreateType} // Pasa setTaskItemCreateType aquí
        />
        <DayTasks
          day='Jueves 15, Junio'
          tasks={[
            {
              title: 'Descarga de afirmado',
              time: '11:00 - 12:00',
              status: 'Completado',
            },
            {
              title: 'Compactación sector 05',
              time: '11:00 - 12:00',
              status: 'Programado',
            },
          ]}
          showModal={showModal}  // Aquí pasamos showModal como prop
          setTaskItemCreateType={setTaskItemCreateType} // Pasa setTaskItemCreateType aquí
        />
        <DayTasks
          day='Jueves 16, Junio'
          tasks={[]}
          showModal={showModal}  // Aquí pasamos showModal como prop
          setTaskItemCreateType={setTaskItemCreateType} // Pasa setTaskItemCreateType aquí
        />
        <DayTasks
          day='Jueves 17, Junio'
          tasks={[]}
          showModal={showModal}  // Aquí pasamos showModal como prop
          setTaskItemCreateType={setTaskItemCreateType} // Pasa setTaskItemCreateType aquí
        />
      </ScrollView>
      <Modal
        visible={modalOptionsVisible}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setModalOptionsVisible(false)}
      >
        <View style={styles.modalContainer}>
        <Pressable
          style={styles.modalContainerOptions}
          onPressOut={() => setModalOptionsVisible(false)}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              color: 'white',
            }}
          >
            Seguimiento
          </Text>
          <View style={{ marginLeft: 0 }}>
            <TouchableOpacity style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
              <Ionicons name="share-social-sharp" size={18} color="white" />
              <Text style={{ marginLeft: 10, color: 'white' }}>Compartir enlace</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{  flexDirection: 'row', height: 40, alignItems: 'center' }}>
              <MaterialCommunityIcons name="pencil" size={18} color="white" />
              <Text style={{ marginLeft: 10, color: 'white'}}>Renombrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{  flexDirection: 'row', height: 40, alignItems: 'center' }}>
            <Ionicons name="settings" size={18} color="white" />
              <Text style={{ marginLeft: 10, color: 'white'}}>Configurar seguimiento</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
        </View>
      </Modal>
      {/*  MODAL INFERIOR */}
     

      <Modal transparent visible={isVisible} animationType="none">
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainerInferior,
              { transform: [{ translateY: slideAnim }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={{ backgroundColor: '#05222f', flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={hideModal}  style={{  width: '50%', paddingVertical: 10 , paddingLeft: 10}}>
              <Text style={{ color: 'white' }} >Cancelar</Text>
            </TouchableOpacity>
              <TouchableOpacity  style={{ width: '50%', paddingVertical: 10 , paddingRight: 10, alignItems: 'flex-end'}}>
                <Text  style={{ color: 'white' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
            <TaskItemCreate tipo={TaskItemCreateType} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Componente que agrupa las tareas por día
const DayTasks: React.FC<DayTasksProps> = ({ day, tasks, showModal, setTaskItemCreateType }) => (
  <View style={styles.dayContainer}>
    <Text style={[styles.dayTitle, { width: '100%', textAlign: 'right' }]}>
      {day}
    </Text>

    {tasks.map((task, index) => (
      <TaskCard
        key={index}
        {...task}
        setTaskItemCreateType={setTaskItemCreateType} // Pasa setTaskItemCreateType a TaskCard
        showModal={showModal}
      />
    ))}
    <TouchableOpacity style={styles.addNewTaskButton} onPress={showModal}> 
      <Text style={styles.addNewTaskText}>+ Nuevo</Text>
    </TouchableOpacity>
  </View>
);

// Componente para cada tarjeta de tarea
interface TaskCardProps extends Task {
  setTaskItemCreateType: (type: string) => void; // Agrega setTaskItemCreateType como prop
}

const TaskCard: React.FC<TaskCardProps> = ({ title, time, status, setTaskItemCreateType, showModal }) => (
  <TouchableOpacity
    style={styles.taskCard}
    onPress={() => {
      console.log("Presionada la tarea: ", title);  // Verifica si el evento onPress se está llamando
      setTaskItemCreateType(status === 'Completado' ? 'Completado' : status === 'Pendiente' ? 'Pendiente' : 'Programado');
      showModal();  // Verifica si esta función se llama correctamente
    }}
  >
    <View style={styles.taskHeader}>
      <Text
        style={[
          styles.taskStatus,
          {
            backgroundColor: status === 'Pendiente' ? '#F4C724' : status === 'Completado' ? '#4ec291' : '#056375',
            color: status === 'Programado' ? '#F4C724' : '#0D465E',
            borderColor: status === 'Programado' ? '#F4C724' : 'white',
            borderWidth: status === 'Programado' ? 1 : 0,
          },
        ]}
      >
        {status}
      </Text>
      <Feather name="truck" size={24} color="white" />
    </View>
    <Text style={styles.taskTitle}>{title}</Text>
    <Text style={styles.taskTime}>{time}</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05222F', // Color de fondo principal
  },
  header: {
    backgroundColor: '#05222F',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 20,
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#0D465E',
    marginTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    marginLeft: 10,
  },
  weekContainer: {
    padding: 16,
    backgroundColor: '#034757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#F4C724',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  weekSelector: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between', // Cambié a space-between para distribuir los íconos de manera adecuada
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30, // Añadí algo de padding lateral para separar los íconos de los bordes
    alignSelf: 'stretch', // Esto asegura que ocupe todo el ancho disponible
    borderRadius: 10,
    marginHorizontal: 10,
  },
  weekTitle: {
    color: 'white',
    fontSize: 20,
    marginHorizontal: 10,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#034757',
  },
  dayContainer: {
    paddingVertical: 16,
    backgroundColor: '#034757',
    borderBottomColor: '#056375',
    borderBottomWidth: 1,
  },
  dayTitle: {
    backgroundColor: '#05222F',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  taskCard: {
    backgroundColor: '#056375',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatus: {
    color: 'white',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  taskTime: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  addNewTaskButton: {
    padding: 16,
    alignItems: 'center',
  },
  addNewTaskText: {
    color: '#F4C724',
    fontSize: 16,
  },
  modalContainerOptions: {
    backgroundColor: '#0A3649',
    padding: 16,
    marginTop: 63,
    marginRight: 8,
    borderRadius: 8,
    width: '60%',
    alignSelf: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Estilos para el modal inferior 
  button: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContainerInferior: {
    backgroundColor: '#05222f',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '100%',
    height: '95%',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  
});
