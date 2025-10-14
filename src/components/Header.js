import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Header = ({ title, user, navigation }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>{user}</Text>
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <TouchableOpacity 
        style={styles.notificationIcon} 
        onPress={() => navigation.navigate("Notification")}
      >
        <MaterialCommunityIcons name="bell-outline" size={24} color="#334155" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F4F8', 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#003d66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2A3A',
  },
  notificationIcon: {
    padding: 5,
  },
});

export default Header;