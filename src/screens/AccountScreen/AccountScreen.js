import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendsTab from "../../components/FriendsTab";
import BottomNavBar from "../../components/BottomNavBar";

const AccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("POST");

  const renderTabContent = () => {
    switch (activeTab) {
      case 'POST':
        return <PostCard />;
      case 'FRIENDS':
        return <FriendsTab />;
      case 'DISCOUNT':
        return (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>No discounts available yet.</Text>
          </View>
        );
      default:
        return <PostCard />;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: styles.container.backgroundColor}}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60" }}
            style={styles.bannerImage}
          />
          <TouchableOpacity style={styles.settingButton} onPress={() => {}}>
            <Ionicons name="settings-outline" size={22} color="#1C2A3A" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://i.pravatar.cc/300" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfoContainer}>
            <Text style={styles.name}>Samantha</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={16} color="#003d66" />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.interests}>Vessel Management · Logistics · Cargo</Text>
            <Text style={styles.bio}>
              Experienced professional in maritime logistics...
              <Text style={{ color: "#003d66" }}> Detail</Text>
            </Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {["POST", "FRIENDS", "DISCOUNT"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[ styles.tabButton, activeTab === tab && styles.activeTabButton ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[ styles.tabText, activeTab === tab && styles.activeTabText ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

      </ScrollView>
      <BottomNavBar activeScreen="Account" navigation={navigation} />
    </SafeAreaView>
  );
};

const PostCard = () => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <Image
        source={{ uri: "https://i.pravatar.cc/100" }}
        style={styles.postAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.postName}>Samantha</Text>
        <Text style={styles.postTime}>10/14/2025</Text>
      </View>
    </View>
    <Text style={styles.postTitle}>New Cargo Route Established</Text>
    <Image
      source={{ uri: "https://images.unsplash.com/photo-1600185365483-26d7a4d6e75b?auto=format&fit=crop&w=800&q=60" }}
      style={styles.postImage}
    />
    <Text style={styles.postContent}>
      Excited to announce a new efficient cargo route from Singapore to Rotterdam.
    </Text>
    <View style={styles.postFooter}>
      <View style={styles.footerItem}>
        <Feather name="heart" size={18} color="#5A6A7D" />
        <Text style={styles.footerText}>107</Text>
      </View>
      <View style={styles.footerItem}>
        <Feather name="message-circle" size={18} color="#5A6A7D" />
        <Text style={styles.footerText}>15 comments</Text>
      </View>
      <TouchableOpacity style={styles.addPostBtn}>
        <Feather name="plus" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </View>
);

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  bannerContainer: {
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: 150,
  },
  settingButton: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 6,
    borderRadius: 20,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#003d66'
  },
  profileInfoContainer: {
    flex: 1,
  },
  name: {
    color: "#1C2A3A",
    fontWeight: "700",
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: "#E9EFF5", 
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editText: {
    color: "#003d66", 
    marginLeft: 4,
    fontWeight: "600",
  },
  interests: {
    color: "#5A6A7D",
    fontSize: 13,
    marginTop: 8, // Thêm margin
  },
  bio: {
    color: "#5A6A7D",
    fontSize: 13,
    marginTop: 6,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  activeTabButton: {
    backgroundColor: "#003d66",
    borderRadius: 20,
  },
  tabText: {
    color: "#5A6A7D",
    fontSize: 13,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postName: {
    color: "#1C2A3A",
    fontWeight: "600",
  },
  postTime: {
    color: "#5A6A7D",
    fontSize: 12,
  },
  postTitle: {
    color: "#1C2A3A",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
  },
  postImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginTop: 8,
  },
  postContent: {
    color: "#5A6A7D",
    fontSize: 13,
    marginTop: 10,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#5A6A7D",
    marginLeft: 4,
    fontSize: 12,
  },
  addPostBtn: {
    backgroundColor: "#003d66",
    borderRadius: 20,
    padding: 8,
  },
  emptyTab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTabText: {
    fontSize: 16,
    color: '#5A6A7D',
  }
});