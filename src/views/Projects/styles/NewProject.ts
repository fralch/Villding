import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05222F", // Background color of the app
  },
  header: {
    backgroundColor: "#05222F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 80,
    marginTop: 30,
  },
  label: {
    color: "#aaa",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#05222F",
    color: "#fff",
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  endDate: {
    color: "#fff",
    fontSize: 21,
    marginBottom: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: "#0A3649",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#777",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imageText: {
    color: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#0A3649",
    padding: 16,
    margin: 0,
  },
});
