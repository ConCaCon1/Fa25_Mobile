import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { getRole, getUserData } from '../../auth/authStorage';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileOption = ({ iconName, title, onPress }) => (
  <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
    <View style={styles.optionLeft}>
      <Feather name={iconName} size={20} color="#333" /> 
      <Text style={styles.optionText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
  </TouchableOpacity>
);

const CaptainAccount = ({ navigation }) => {
  const [captainData, setCaptainData] = useState(null);

  useEffect(() => {
    const loadDataAndCheckRole = async () => {
      const data = await getUserData(); 
      
      if (data.role !== "Captain") {
        navigation.replace("Home");
        return;
      }
      
      if (data.username && data.email) {
        setCaptainData({
            name: data.username.charAt(0).toUpperCase() + data.username.slice(1), 
            email: data.email,
            avatarUrl: "https://i.imgur.com/G55vN.png", 
            appVersion: "App version 003",
        });
      } else {
         setCaptainData({
            name: "Captain User", 
            email: "default@example.com",
            avatarUrl: "https://i.imgur.com/G55vN.png", 
            appVersion: "App version 003",
        });
      }
    };
    loadDataAndCheckRole();
  }, [navigation]);

  if (!captainData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E9D47" />
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  const handleEditProfile = () => {
    console.log("Go to Edit Profile");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: captainData.avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.editAvatarIcon}>
                <Feather name="camera" size={14} color="#fff" />
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{captainData.name}</Text>
            <Text style={styles.userEmail}>{captainData.email}</Text>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionsGroup}>
          <ProfileOption iconName="heart" title="Favourites" onPress={() => console.log('Favourites')} />
          <ProfileOption iconName="download" title="Downloads" onPress={() => console.log('Downloads')} />
        </View>

        <View style={styles.optionsGroup}>
          <ProfileOption iconName="globe" title="Language" onPress={() => console.log('Language')} />
          <ProfileOption iconName="map-pin" title="Location" onPress={() => console.log('Location')} />
          <ProfileOption iconName="monitor" title="Display" onPress={() => console.log('Display')} />
          <ProfileOption iconName="list" title="Feed preference" onPress={() => console.log('Feed preference')} />
          <ProfileOption iconName="credit-card" title="Subscription" onPress={() => console.log('Subscription')} />
        </View>

        <View style={styles.optionsGroup}>
          <ProfileOption iconName="trash-2" title="Clear Cache" onPress={() => console.log('Clear Cache')} />
          <ProfileOption iconName="clock" title="Clear history" onPress={() => console.log('Clear history')} />
          <ProfileOption iconName="log-out" title="Log Out" onPress={() => navigation.replace("LoginScreen")} />
        </View>

        <Text style={styles.appVersion}>{captainData.appVersion}</Text>

      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerIcon: {
    position: 'absolute',
    right: 16,
    top: 15,
    padding: 5,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40, 
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#E6F3EA', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#1E9D47', 
    fontWeight: '600',
    fontSize: 14,
  },

  optionsGroup: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  appVersion: {
    textAlign: 'center',
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default CaptainAccount;