import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = ({ title, onProfilePress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftIcon}>
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.profileCircle} onPress={onProfilePress}>
        <Text style={styles.profileText}>S</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#121212",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  leftIcon: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#005f99",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  profileText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
