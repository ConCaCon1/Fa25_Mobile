import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { name: 'Home', icon: 'home-variant', target: 'Home' },
  { name: 'History', icon: 'history', target: 'History' },
  { name: 'Map', icon: 'map-marker-radius', target: 'MapScreen' },
  { name: 'Notifications', icon: 'bell-outline', target: 'Notification' },
  { name: 'Cart', icon: 'cart-outline', target: 'OrderScreen' },     
  { name: 'Account', icon: 'account-circle-outline', target: 'Account' },
];

const BottomNavBar = ({ activeScreen, navigation }) => {
  return (
    <View style={styles.bottomNavContainer}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.name;
        const iconColor = isActive ? '#FFFFFF' : '#A0AEC0';

        return (
          <Pressable
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.target)}
          >
            {isActive && <View style={styles.activePill} />}
            <MaterialCommunityIcons name={item.icon} size={28} color={iconColor} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    borderRadius: 50,
    height: 65,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activePill: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#003d66',
    position: 'absolute',
  },
});

export default BottomNavBar;
