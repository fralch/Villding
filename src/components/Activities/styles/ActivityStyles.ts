import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    paddingTop:  20,
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
    backgroundColor: '#0D465E',
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
    backgroundColor: '#0D5A73',
  },
  dayContainer: {
    backgroundColor: '#053648',
    
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
    borderBottomWidth: 2,
    borderBottomColor: '#0D5A73',
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
    marginBottom: 10,
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
