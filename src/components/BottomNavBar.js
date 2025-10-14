import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { name: 'Home', icon: 'home-variant', target: 'Home' },
  { name: 'History', icon: 'history', target: 'History' },
  { name: 'Map', icon: 'map', target: 'MapScreen' },
  { name: 'Notifications', icon: 'bell-outline', target: 'Notification' },
  { name: 'Account', icon: 'account-circle-outline', target: 'Account' },
];

const BottomNavBar = ({ activeScreen, navigation }) => {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item, index) => {
        const isActive = activeScreen === item.name;
        const color = isActive ? '#003d66' : '#A0AEC0';

        return (
          <TouchableOpacity 
            key={index} 
            style={styles.navItem}
            onPress={() => navigation.navigate(item.target)}
          >
            <MaterialCommunityIcons name={item.icon} size={26} color={color} />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1, 
  },
  navText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  navTextActive: {
    fontWeight: 'bold',
    color: '#003d66',
  },
});

export default BottomNavBar;