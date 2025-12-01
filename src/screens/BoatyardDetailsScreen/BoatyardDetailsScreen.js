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
  Dimensions,
} from "react-native";
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";
import GoongMapView from "../../components/GoongMapView";

const { width } = Dimensions.get("window");

// --- BẢNG MÀU HIỆN ĐẠI ---
const COLORS = {
  primary: "#0A2540", // Xanh Navy đậm (Sang trọng)
  secondary: "#00A8E8", // Xanh biển tươi (Nổi bật)
  bg: "#F8FAFC", // Xám rất nhạt (Sạch sẽ)
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  overlay: "rgba(0,0,0,0.4)",
};

const DetailItem = ({ iconName, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconBox}>
      <Feather name={iconName} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Đang cập nhật"}</Text>
    </View>
  </View>
);

const ServiceItem = ({ service, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.serviceHeader}>
      <View style={styles.serviceIconBadge}>
        <MaterialIcons name="design-services" size={20} color={COLORS.secondary} />
      </View>
      {/* Nút giả để gợi ý bấm vào */}
      <Ionicons name="add-circle-outline" size={20} color={COLORS.textSub} />
    </View>
    
    <Text style={styles.serviceName} numberOfLines={2}>{service.typeService}</Text>
    <Text style={styles.servicePrice}>
      {service.price ? service.price.toLocaleString('vi-VN') : "Liên hệ"} <Text style={{fontSize: 10, color: COLORS.textSub}}>VND</Text>
    </Text>
  </TouchableOpacity>
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
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoatyardServices = async () => {
    try {
      const json = await apiGet(`/boatyards/${id}/boatyard-services?page=1&size=30`);
      if (json?.data?.items) setServices(json.data.items);
    } catch (error) {
      console.log("Error services:", error);
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

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!boatyard) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ color: COLORS.textSub }}>Không tìm thấy thông tin</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 10}}>
            <Text style={{color: COLORS.secondary, fontWeight: 'bold'}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* --- HEADER --- */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="heart-outline" size={24} color={COLORS.white} />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* --- BANNER IMAGE --- */}
        <View style={styles.imageContainer}>
            <Image
            source={{
                uri: boatyard.avatarUrl || "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
            }}
            style={styles.bannerImage}
            />
            <View style={styles.imageOverlay} />
        </View>

        {/* --- MAIN CONTENT (Overlapping) --- */}
        <View style={styles.mainContent}>
            
            {/* 1. Header Info */}
            <View style={styles.titleCard}>
                <Text style={styles.titleText}>{boatyard.name}</Text>
                <View style={styles.ratingRow}>
                    <View style={styles.tag}>
                        <FontAwesome5 name="anchor" size={12} color={COLORS.secondary} />
                        <Text style={styles.tagText}>Xưởng tàu</Text>
                    </View>
                    <View style={styles.ownerRow}>
                        <Text style={styles.ownerLabel}>Chủ xưởng:</Text>
                        <Text style={styles.ownerName}>{boatyard.fullName || "---"}</Text>
                    </View>
                </View>

                <View style={styles.contactRow}>
                    <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handlePressCall}>
                        <Feather name="phone" size={18} color="#FFF" />
                        <Text style={styles.contactBtnText}>Gọi điện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.contactBtn, styles.msgBtn]} onPress={handlePressEmail}>
                        <Feather name="mail" size={18} color={COLORS.primary} />
                        <Text style={[styles.contactBtnText, {color: COLORS.primary}]}>Email</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Details */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Thông tin chung</Text>
                <View style={styles.infoBox}>
                    <DetailItem iconName="map-pin" label="Địa chỉ" value={boatyard.address} />
                    <View style={styles.divider} />
                    <DetailItem
                        iconName="calendar"
                        label="Ngày tham gia"
                        value={boatyard.createdDate ? new Date(boatyard.createdDate).toLocaleDateString("vi-VN") : null}
                    />
                </View>
            </View>

            {/* 3. Services */}
            <View style={styles.sectionContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                    <Text style={styles.sectionHeader}>Dịch vụ ({services.length})</Text>
                    {/* <TouchableOpacity><Text style={{color: COLORS.secondary, fontSize: 13}}>Xem tất cả</Text></TouchableOpacity> */}
                </View>
                
                {services.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Chưa có dịch vụ nào.</Text>
                    </View>
                ) : (
                    <View style={styles.serviceGrid}>
                        {services.map((service) => (
                            <ServiceItem 
                                key={service.id} 
                                service={service} 
                                onPress={() => handleSelectService(service)}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* 4. Map */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Vị trí trên bản đồ</Text>
                <View style={styles.mapContainer}>
                    {boatyard.latitude && boatyard.longitude ? (
                        <GoongMapView
                            latitude={parseFloat(boatyard.latitude)}
                            longitude={parseFloat(boatyard.longitude)}
                            popupText={boatyard.name}
                            icon="🏭"
                            zoom={14}
                        />
                    ) : (
                        <View style={styles.noMap}>
                            <Ionicons name="map-outline" size={40} color={COLORS.textSub} />
                            <Text style={styles.emptyText}>Chưa cập nhật tọa độ</Text>
                        </View>
                    )}
                </View>
            </View>

        </View>
      </ScrollView>

      {/* --- FLOATING BOTTOM BAR --- */}
      {services.length > 0 && (
        <View style={styles.bottomBar}>
            <View style={styles.bottomBarContent}>
                <View>
                    <Text style={styles.priceLabel}>Đặt lịch sửa chữa</Text>
                    <Text style={styles.priceValue}>Chọn dịch vụ</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.bookBtnText}>Đặt ngay</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
      )}

      {/* --- MODAL SELECT SERVICE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBody}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn dịch vụ bạn cần</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.modalServiceItem}
                      onPress={() => handleSelectService(service)}
                    >
                      <View style={styles.modalIconBox}>
                        <MaterialIcons name="miscellaneous-services" size={24} color={COLORS.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalServiceName}>{service.typeService}</Text>
                        <Text style={styles.modalServiceDesc} numberOfLines={1}>Nhấn để chọn lịch</Text>
                      </View>
                      <Text style={styles.modalPrice}>
                        {service.price ? service.price.toLocaleString() : "---"} ₫
                      </Text>
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  
  /* HEADER */
  headerBar: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    left: 20, right: 20,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)' // Note: only works on some versions, mainly visual
  },

  /* IMAGE BANNER */
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative'
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)', // Simulated gradient with plain color for compatibility
    backgroundColor: 'rgba(0,0,0,0.2)'
  },

  /* MAIN CONTENT */
  mainContent: {
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  /* TITLE CARD */
  titleCard: {
    marginBottom: 25,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 8,
    lineHeight: 32
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12
  },
  tagText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: 4
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ownerLabel: { fontSize: 13, color: COLORS.textSub, marginRight: 4 },
  ownerName: { fontSize: 13, color: COLORS.textMain, fontWeight: '600' },

  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  callBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  msgBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8
  },

  /* SECTION STYLES */
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  
  /* INFO BOX */
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailIconBox: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, color: COLORS.textSub, marginBottom: 2 },
  detailValue: { fontSize: 14, color: COLORS.textMain, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12, marginLeft: 48 },

  /* SERVICES GRID */
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  serviceCard: {
    width: (width - 40 - 12) / 2, // 2 columns
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 0, // Handled by gap
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  serviceIconBadge: {
    width: 32, height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center', justifyContent: 'center'
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 4,
    height: 40 // Fixed height for 2 lines
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary
  },

  /* MAP */
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  noMap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* BOTTOM BAR */
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priceLabel: { fontSize: 12, color: COLORS.textSub },
  priceValue: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  bookBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 4
  },
  bookBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8
  },

  /* MODAL */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalBody: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  modalServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  modalServiceName: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  modalServiceDesc: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
  modalPrice: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: COLORS.textSub, fontStyle: 'italic' }
});