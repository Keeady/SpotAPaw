import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  logo: {
    width: 100,
    marginLeft: 0,
    resizeMode: "contain",
    height: 50,
  },
  button: {
    marginRight: 12,
    alignSelf: "flex-end",
  },
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default styles;
