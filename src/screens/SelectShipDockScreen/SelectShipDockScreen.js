import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiGet } from "../../ultis/api"; // Giữ nguyên đường dẫn import của bạn

// Màu sắc chủ đạo (có thể tách ra file constants)
const COLORS = {
  primary: "#003d66",
  primaryLight: "#e6f2ff",
  secondary: "#64748B",
  background: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
  textMain: "#1E293B",
  textSub: "#64748B",
  accent: "#0EA5E9",
};

const SelectShipDockScreen = ({ route, navigation }) => {
  const { boatyardId, boatyardName, selectedService, selectedSlot } = route.params;

  const [shipList, setShipList] = useState([]);
  const [filteredShipList, setFilteredShipList] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [isLoadingShips, setIsLoadingShips] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const res = await apiGet("/ships?deleted=false");
        const ships = res.data?.items || [];
        setShipList(ships);
        setFilteredShipList(ships);
      } catch (error) {
        setShipList([]);
        setFilteredShipList([]);
        Alert.alert("Lỗi", "Không thể tải danh sách tàu.");
      } finally {
        setIsLoadingShips(false);
      }
    };

    fetchShips();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredShipList(shipList);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = shipList.filter((ship) => {
      const name = ship.name?.toLowerCase() || "";
      const code = ship.code?.toLowerCase() || "";
      return name.includes(lower) || code.includes(lower);
    });
    setFilteredShipList(filtered);
  };

  const handleContinue = () => {
    if (!selectedShip) return;

    navigation.navigate("ConfirmBookingScreen", {
      boatyardId,
      boatyardName,
      selectedService,
      selectedSlot,
      selectedShip,
    });
  };

  const renderShipItem = ({ item }) => {
    const isSelected = selectedShip?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedShip(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            <Ionicons 
              name="boat" 
              size={24} 
              color={isSelected ? COLORS.primary : COLORS.secondary} 
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.shipName, isSelected && styles.textSelected]}>
              {item.name}
            </Text>
          
          </View>

          <View style={styles.radioContainer}>
            {isSelected ? (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color={COLORS.border} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn Thuyền</Text>
            <View style={{ width: 40 }} /> 
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSub} style={styles.searchIcon} />
            <TextInput
              placeholder="Tìm kiếm theo tên hoặc mã..."
              placeholderTextColor={COLORS.textSub}
              value={search}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={18} color={COLORS.textSub} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.listContainer}>
            {isLoadingShips ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách tàu...</Text>
              </View>
            ) : filteredShipList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="boat-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyText}>Không tìm thấy thuyền nào</Text>
              </View>
            ) : (
              <FlatList
                data={filteredShipList}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={renderShipItem}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueBtn, !selectedShip && styles.continueBtnDisabled]} 
          onPress={handleContinue}
          disabled={!selectedShip}
        >
          <Text style={styles.continueText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{marginLeft: 8}}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectShipDockScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 12, // Tăng chiều cao để dễ bấm
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
  },

  // List Styles
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  
  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent", // Để giữ layout không nhảy khi thêm border active
    // Shadow
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    flex: 1,
  },
  shipName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  textSelected: {
    color: COLORS.primary,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shipCode: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "500",
  },
  radioContainer: {
    paddingLeft: 10,
  },

  // Empty & Loading
  loadingContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSub,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSub,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnDisabled: {
    backgroundColor: "#94A3B8", // Màu xám khi disabled
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});