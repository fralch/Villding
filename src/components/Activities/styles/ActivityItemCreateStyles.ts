import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "#05222f",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    color: "#dedede",
    borderTopWidth: 1, // Línea de borde arriba
    borderBottomWidth: 1, // Línea de borde abajo
    borderTopColor: "#0a3649", // Color del borde superior
    borderBottomColor: "#0a3649", // Color del borde inferior
    borderLeftWidth: 0, // Sin borde en los costados
    borderRightWidth: 0, // Sin borde en los costados
    fontSize: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadBox: {
    backgroundColor: "#0a455e",
    height: 200,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statusProgramado: {
    alignItems: "center",
    borderTopWidth: 1, // Línea de borde arriba
    borderBottomWidth: 1, // Línea de borde abajo
    borderTopColor: "#d1a44c", // Color del borde superior
    borderBottomColor: "#d1a44c", // Color del borde inferior
    borderLeftWidth: 0, // Sin borde en los costados
    borderRightWidth: 0, // Sin borde en los costados
    padding: 5,
  },
  iconStatus: {
    backgroundColor: "#0a3649",
    color: "#d1a44c",
    position: "absolute",
    zIndex: 1,
    bottom: 10,
    left: 0,
    padding: 10,
    borderRadius: 5,
  },
  hr: {
    borderBottomColor: "#ccc", // Color de la línea
    borderBottomWidth: 1, // Grosor de la línea
    marginVertical: 10, // Espaciado arriba y abajo de la línea
  },
  input: {
    flex: 1,
    color: "#fff", // Color del texto
    fontSize: 16,
    marginLeft: 10,
  },

  // -----
  section: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#dedede",
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#0a455e",
    padding: 5,
  },
  selectedIconContainer: {
    backgroundColor: "#33baba",
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  iconText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  footerText: {
    color: "#ccc",
    fontSize: 12,
    textAlign: "center",
  },
});
