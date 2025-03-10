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
        paddingTop: 25,
        height: 100,
        borderBottomWidth: 1,
        borderBottomColor: "#0D465E",
        marginTop: 20,
      },
      title: {
        width: 120,
        height: 40,
        resizeMode: "contain",
      },
      headerIcons: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      },
      icon: {
        width: 24,
        height: 24,
        marginRight: 24,
      },
      avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
      },
      input: {
        flex: 1,
        height: 40,
        backgroundColor: "#05222F",
        borderRadius: 10,
        paddingHorizontal: 10,
        color: "white",
        fontSize: 16,
      },
      headerSearch: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#05222F",
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#0D465E",
        marginHorizontal: 0,
        marginBottom: 20,
      },
      debug: {
        borderColor: "red",
        borderWidth: 1,
      },
});
