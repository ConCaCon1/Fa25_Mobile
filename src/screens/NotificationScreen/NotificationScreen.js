import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavBar from  '../../components/BottomNavBar';

const mockNotifications = [
  {
    id: '1',
    type: 'reminder',
    title: 'Booking at Nam Hai Shipyard is about to start in 30 minutes.',
    time: '5 minutes ago',
    isRead: false,
    icon: 'bell-ring',
  },
  {
    id: '2',
    type: 'request',
    title: 'Booking at Bien Dong Mechanics is requested to be cancelled.',
    time: '41 minutes ago',
    isRead: false,
    icon: 'file-cancel',
  },
  {
    id: '3',
    type: 'offer',
    title: 'Nam Hai Shipyard has offered you a discount code "MH2025".',
    time: '41 minutes ago',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '4',
    type: 'accepted',
    title: 'Your service request to Samantha has been accepted.',
    time: '41 minutes ago',
    isRead: false,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '5',
    type: 'request',
    title: 'Samantha has sent you a connection request.',
    time: '18/11/2025 at 15:00',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '6',
    type: 'request',
    title: 'John Doe has requested to participate in your upcoming maintenance schedule.',
    time: '18/11/2025 at 15:00',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

const NotificationScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Notification</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="cog-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {mockNotifications.map(item => (
          <TouchableOpacity key={item.id} style={styles.card}>
            {!item.isRead && <View style={styles.unreadDot} />}
            
            <View style={styles.iconContainer}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <MaterialCommunityIcons name={item.icon} size={24} color="#003d66" />
              )}
            </View>

            <View style={styles.textContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavBar activeScreen="Notifications" navigation={navigation} /> 
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C2A3A',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80, // Khoảng trống cho bottom nav
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545', // Màu đỏ cho "chưa đọc"
    position: 'absolute',
    top: 16,
    left: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9EFF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginLeft: 12, // Khoảng trống cho unread dot
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: 12,
    color: '#5A6A7D',
    marginTop: 4,
  },
});