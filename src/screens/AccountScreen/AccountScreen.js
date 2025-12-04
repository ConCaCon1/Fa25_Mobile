import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { SwipeListView } from "react-native-swipe-list-view";
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from "expo-image-picker";

import BottomNavBar from "../../components/BottomNavBar";
import { apiGet, apiPatch } from "../../ultis/api";
import { useIsFocused } from "@react-navigation/native";
import { clearAllData, getToken } from "../../auth/authStorage";
import { API_BASE_URL } from "@env";

const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  accent: "#FF6B6B", 
  bg: "#F8F9FA",
  white: "#FFFFFF",
  textMain: "#1A202C",
  textSub: "#718096",
  cardBg: "#FFFFFF",
  success: "#48BB78",
};

const AccountScreen = ({ navigation }) => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [profile, setProfile] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [stats, setStats] = useState({ orders: 0, bookings: 0 });
  
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadAllData = async () => {
      if (!profile) setIsDataLoading(true);
      try {
        const [profileRes, ordersRes, bookingsRes] = await Promise.all([
            apiGet("/auth/profile"),
            apiGet("/orders?page=1&size=1"),
            apiGet("/bookings?page=1&size=1")
        ]);

        if (profileRes.status === 200 && profileRes.data) {
          setProfile(profileRes.data);
        }

        setStats({
            orders: ordersRes?.data?.total || 0,
            bookings: bookingsRes?.data?.total || 0
        });

      } catch (error) {
        console.log("Error loading account data:", error);
      } finally {
        setIsDataLoading(false);
      }

      setShips([]);
      setPage(1);
      setHasMore(true);
      fetchShips(1, true);
    };

    if (isFocused) {
        loadAllData();
    }
  }, [isFocused]);

  const handleUpdateAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh để thay đổi avatar.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatarToServer(result.assets[0]);
    }
  };

  const uploadAvatarToServer = async (asset) => {
    setUploadingAvatar(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      
      const fileName = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("AvatarUrl", {
        uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
        name: fileName,
        type: type,
      });

      if (profile) {
          formData.append("FullName", profile.fullName || "");
          formData.append("PhoneNumber", profile.phoneNumber || "");
          formData.append("Address", profile.address || "");
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
         method: "PATCH",
         headers: {
           Authorization: `Bearer ${token}`,
         },
         body: formData
      });

      if (response.ok) {
         Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
         const res = await apiGet("/auth/profile");
         if (res.data) setProfile(res.data);
      } else {
         Alert.alert("Lỗi", "Không thể cập nhật ảnh.");
      }

    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi upload.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fetchShips = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const json = await apiGet(`/ships?page=${pageNum}&size=5&deleted=false`);
      const newShips = Array.isArray(json?.data?.items)
        ? json.data.items.filter((s) => !s.deleted)
        : [];

      setShips((prev) => {
        const merged = reset ? newShips : [...prev, ...newShips];
        const uniqueShips = merged.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
        if (newShips.length < 5) setHasMore(false);
        return uniqueShips;
      });
    } catch (err) {
      setShips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShips = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShips(nextPage);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn muốn đăng xuất ngay?", [
      { text: "Không", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          await clearAllData();
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        },
      },
    ]);
  };

  const handleDeleteShip = (shipId) => {
    Alert.alert("Xóa tàu", "Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa ngay",
        style: "destructive",
        onPress: async () => {
          try {
            await apiPatch(`/ships/${shipId}`, { deleted: true });
            setShips((prev) => prev.filter((s) => s.id !== shipId));
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa tàu.");
          }
        },
      },
    ]);
  };

  const renderHiddenItem = (data) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteShip(data.item.id)}
      >
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const ShipCard = ({ ship }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("ShipDetailScreen", { shipId: ship.id })}
        style={styles.cardContent}
      >
        <View style={styles.shipImageContainer}>
            <Image
                source={{ uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp" }}
                style={styles.shipImage}
            />
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
            </View>
        </View>

        <View style={styles.shipInfo}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.shipName} numberOfLines={1}>{ship.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("ShipMapScreen", { name: ship.name, latitude: parseFloat(ship.latitude), longitude: parseFloat(ship.longitude) })}>
                    <Ionicons name="location-sharp" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>
            <Text style={styles.shipSubText}>IMO: {ship.imoNumber || "N/A"}</Text>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                    <MaterialIcons name="app-registration" size={14} color={COLORS.textSub} />
                    <Text style={styles.detailText}>{ship.registerNo}</Text>
                </View>
            
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textSub} />
                    <Text style={styles.detailText}>{ship.buildYear}</Text>
                </View>
            </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const ProfileHeader = () => (
    <LinearGradient
        colors={[COLORS.primary, '#1a3b5c']}
        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        style={styles.headerGradient}
    >
        <View style={styles.headerContent}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{ uri: profile?.avatarUrl || "https://i.pravatar.cc/300" }}
                    style={styles.avatarImage}
                />
                <TouchableOpacity style={styles.editAvatarBtn} onPress={handleUpdateAvatar} disabled={uploadingAvatar}>
                    {uploadingAvatar ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons name="camera" size={14} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
            
            <View style={styles.headerTextContainer}>
                <View style={styles.nameAndEditRow}>
                    <Text style={styles.profileName}>{profile?.fullName || "Thuyền Viên"}</Text>
                    <TouchableOpacity 
                        style={styles.editProfileBtn} 
                        onPress={() => navigation.navigate("EditProfileScreen")}
                    >
                        <MaterialIcons name="edit" size={18} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.profileRole}> Ship Owner</Text>
                <View style={styles.contactRow}>
                    <Ionicons name="call" size={12} color="#A0AEC0" />
                    <Text style={styles.contactText}>{profile?.phoneNumber || "No phone number"}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{ships.length}</Text>
                <Text style={styles.statLabel}>Tàu</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("OrderScreen")}>
                <Text style={styles.statNumber}>{stats.orders}</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
            </TouchableOpacity>
            
            <View style={styles.statDivider} />
            
            <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("History")}>
                <Text style={styles.statNumber}>{stats.bookings}</Text>
                <Text style={styles.statLabel}>Lịch hẹn</Text>
            </TouchableOpacity>
        </View>
    </LinearGradient>
  );

  if (isDataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ProfileHeader />

      <View style={styles.bodyContainer}>
        <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Đội tàu của tôi</Text>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("AddCaptainScreen")}>
                    <Ionicons name="person-add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, {marginLeft: 10}]} onPress={() => navigation.navigate("AddShipScreen")}>
                    <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>

        <SwipeListView
            data={ships}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ShipCard ship={item} />}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75}
            disableRightSwipe
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreShips}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                !loading && (
                    <View style={styles.emptyState}>
                        <Image 
                            source={{ uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png" }} 
                            style={{ width: 100, height: 100, opacity: 0.5, marginBottom: 10 }}
                        />
                        <Text style={{ color: COLORS.textSub }}>Bạn chưa có tàu nào.</Text>
                    </View>
                )
            }
            ListFooterComponent={loading && <ActivityIndicator style={{ margin: 20 }} color={COLORS.primary} />}
        />
      </View>

      <BottomNavBar activeScreen="Account" navigation={navigation} />
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: { position: 'relative' },
  avatarImage: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.secondary, padding: 4, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary,
  },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  
  nameAndEditRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  editProfileBtn: {
    marginLeft: 10,
    padding: 4,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },

  profileName: { fontSize: 20, fontWeight: "bold", color: COLORS.white },
  profileRole: { fontSize: 13, color: "#A0AEC0", marginTop: 2 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  contactText: { color: "#A0AEC0", fontSize: 12, marginLeft: 4 },
  logoutBtn: { padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },

  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 20,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: "bold", color: COLORS.white },
  statLabel: { fontSize: 11, color: "#CBD5E0", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", height: "80%", alignSelf: 'center' },

  bodyContainer: { flex: 1, marginTop: 10 },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  iconBtn: {
    backgroundColor: COLORS.white, padding: 8, borderRadius: 10,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3,
  },

  cardContainer: {
    marginBottom: 16, borderRadius: 16, backgroundColor: COLORS.cardBg,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    marginHorizontal: 2,
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  shipImageContainer: { position: 'relative' },
  shipImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#EDF2F7' },
  statusBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(72, 187, 120, 0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  statusText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  shipInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  shipName: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, flex: 1, marginRight: 8 },
  shipSubText: { fontSize: 12, color: COLORS.textSub, marginBottom: 8 },
  divider: { height: 1, backgroundColor: "#EDF2F7", marginVertical: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 11, color: COLORS.textSub, marginLeft: 4, fontWeight: '500' },

  rowBack: {
    alignItems: "center", backgroundColor: "transparent", flex: 1,
    flexDirection: "row", justifyContent: "flex-end", paddingLeft: 15, marginBottom: 16, borderRadius: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.accent, justifyContent: "center", alignItems: "center",
    width: 75, height: "100%", borderRadius: 16, marginRight: 2,
  },
  emptyState: { alignItems: 'center', marginTop: 50 }
});