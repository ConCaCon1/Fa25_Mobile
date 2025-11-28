import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";
import GoongMapView from "../../components/GoongMapView";

const DetailItem = ({ iconName, label, value }) => (
  <View style={styles.detailItemContainer}>
    <View style={styles.detailItemIconBg}>
      <Feather name={iconName} size={20} color="#007BFF" />
    </View>
    <View style={styles.detailItemTextContainer}>
      <Text style={styles.detailItemLabel}>{label}</Text>
      <Text style={styles.detailItemValue}>{value || "Chưa cập nhật"}</Text>
    </View>
  </View>
);

const ServiceItem = ({ service }) => (
  <View style={styles.serviceCard}>
    <View style={styles.serviceIconContainer}>
      <MaterialIcons name="miscellaneous-services" size={24} color="#28A745" />
    </View>
    <View style={styles.serviceTextContent}>
      <Text style={styles.serviceName}>{service.typeService}</Text>
      <Text style={styles.servicePrice}>
        {service.price ? service.price.toLocaleString() : "Liên hệ"} VND
      </Text>
    </View>
  </View>
);

const BoatyardDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [boatyard, setBoatyard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
        fetchBoatyardDetail();
        fetchBoatyardServices();
    }
  }, [id]);

  const fetchBoatyardDetail = async () => {
    try {
      const json = await apiGet(`/boatyards/${id}`);
      if (json?.data) setBoatyard(json.data);
    } catch (error) {
      console.log("❌ Error fetching boatyard detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoatyardServices = async () => {
    try {
      const json = await apiGet(`/boatyards/${id}/boatyard-services?page=1&size=30`);
      if (json?.data?.items) setServices(json.data.items);
    } catch (error) {
      console.log("❌ Error fetching boatyard services:", error);
    }
  };

  const handlePressCall = () => {
    if (boatyard?.phoneNumber) Linking.openURL(`tel:${boatyard.phoneNumber}`);
  };

  const handlePressEmail = () => {
    if (boatyard?.email) Linking.openURL(`mailto:${boatyard.email}`);
  };

  const handleSelectService = (service) => {
    setModalVisible(false);
    navigation.navigate("SelectDockSlotScreen", {
      boatyardId: boatyard.id,
      boatyardName: boatyard.name,
      selectedService: service,
    });
  };

  if (!id) {
     return (
        <SafeAreaView style={styles.loader}>
            <Text>Lỗi: Không tìm thấy ID xưởng</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                <Text style={{color: '#007BFF'}}>Quay lại</Text>
            </TouchableOpacity>
        </SafeAreaView>
     )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!boatyard) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#5A6A7D" }}>Không tìm thấy thông tin xưởng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <Image
          source={{
            uri: boatyard.avatarUrl || "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
          }}
          style={styles.bannerImage}
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.boatyardName}>{boatyard.name}</Text>
            <View style={styles.ownerSection}>
              <Feather name="user" size={16} color="#607D8B" />
              <Text style={styles.boatyardOwner}>Chủ xưởng: {boatyard.fullName || "---"}</Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePressCall}>
              <Feather name="phone-call" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Gọi điện</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.emailButton]} onPress={handlePressEmail}>
              <Feather name="mail" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <DetailItem iconName="map-pin" label="Địa chỉ" value={boatyard.address} />
            <DetailItem
              iconName="clock"
              label="Ngày tham gia"
              value={boatyard.createdDate ? new Date(boatyard.createdDate).toLocaleDateString("vi-VN") : null}
            />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Dịch vụ của xưởng</Text>
            {services.length === 0 ? (
              <View style={styles.noServiceContainer}>
                <MaterialIcons name="info-outline" size={24} color="#607D8B" />
                <Text style={styles.noServiceText}>Chưa có dịch vụ nào.</Text>
              </View>
            ) : (
              <View style={styles.servicesGrid}>
                {services.map((service) => (
                  <ServiceItem key={service.id} service={service} />
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>🗺️ Vị trí</Text>
          {boatyard.latitude && boatyard.longitude ? (
            <View style={styles.mapWrapper}>
              <GoongMapView
                latitude={parseFloat(boatyard.latitude)}
                longitude={parseFloat(boatyard.longitude)}
                popupText={boatyard.name}
                icon="🏭"
                zoom={14}
              />
            </View>
          ) : (
            <Text style={{ color: "#607D8B", textAlign: "center", fontStyle: 'italic' }}>Chưa cập nhật tọa độ bản đồ</Text>
          )}
        </View>
      </ScrollView>

      {services.length > 0 && (
        <View style={styles.bookNowFixedContainer}>
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            <Text style={styles.bookNowButtonText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn dịch vụ</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.modalItem}
                      onPress={() => handleSelectService(service)}
                    >
                      <View style={styles.modalItemIcon}>
                        <MaterialIcons name="miscellaneous-services" size={20} color="#007BFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalServiceName}>{service.typeService}</Text>
                        <Text style={styles.modalServicePrice}>
                          {service.price ? service.price.toLocaleString() : "Liên hệ"} VND
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default BoatyardDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F4F7FC" },
  header: { position: "absolute", top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50, left: 16, zIndex: 10 },
  backBtn: { backgroundColor: "rgba(0, 0, 0, 0.4)", padding: 8, borderRadius: 50 },
  bannerImage: { width: "100%", height: 280 }, 
  contentContainer: { paddingHorizontal: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -30, backgroundColor: "#F4F7FC", paddingBottom: 20 },
  
  titleSection: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, shadowColor: "#9FB1C8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5, marginBottom: 20 },
  boatyardName: { fontSize: 24, fontWeight: "800", color: "#1A2533", marginBottom: 8 },
  ownerSection: { flexDirection: "row", alignItems: "center" },
  boatyardOwner: { fontSize: 14, color: "#607D8B", marginLeft: 8 },

  actionButtonsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#007BFF", paddingVertical: 12, borderRadius: 12, elevation: 3 },
  emailButton: { backgroundColor: "#17A2B8" },
  actionButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15, marginLeft: 8 },

  detailsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontWeight: "700", fontSize: 18, color: "#1A2533", marginBottom: 12 },
  
  detailItemContainer: { flexDirection: "row", marginBottom: 14 },
  detailItemIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center", marginRight: 14 },
  detailItemTextContainer: { flex: 1, justifyContent: "center" },
  detailItemLabel: { fontSize: 12, color: "#607D8B" },
  detailItemValue: { fontSize: 14, color: "#263238", fontWeight: "500" },

  noServiceContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#F7F9FC", borderRadius: 10 },
  noServiceText: { marginLeft: 10, color: "#607D8B" },
  
  servicesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  serviceCard: { width: "48%", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#EFEFEF", marginBottom: 8 },
  serviceIconContainer: { alignSelf: 'flex-start', backgroundColor: "#E6F7EB", padding: 6, borderRadius: 6, marginBottom: 8 },
  serviceName: { fontSize: 13, fontWeight: "600", color: "#263238", marginBottom: 2 },
  servicePrice: { fontSize: 12, color: "#007BFF", fontWeight: "700" },

  mapCard: { marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 120, elevation: 2 },
  mapWrapper: { height: 200, borderRadius: 12, overflow: "hidden", marginTop: 10 },

  bookNowFixedContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 30 : 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  bookNowButton: { backgroundColor: "#007BFF", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 12 },
  bookNowButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16, marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  modalItemIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center", marginRight: 15 },
  modalServiceName: { fontSize: 15, fontWeight: "600", color: "#333" },
  modalServicePrice: { fontSize: 13, color: "#007BFF", marginTop: 2 },
});