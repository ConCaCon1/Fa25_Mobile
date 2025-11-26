import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const SupplierListScreen = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const json = await apiGet("/suppliers?page=1&size=30");
        if (json?.data?.items) {
          setSuppliers(json.data.items);
          setFiltered(json.data.items);
        }
      } catch (error) {
        console.log("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = suppliers.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.fullName.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("SupplierDetail", { id: item.id })}
    >
      <Image
        source={{
          uri:
            item.avatarUrl ||
            "https://cdn-icons-png.flaticon.com/512/147/147144.png",
        }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.contact}>{item.fullName}</Text>
        <Text style={styles.address} numberOfLines={2}>
          {item.address || "Chưa có địa chỉ"}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#A0AEC0" />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {search
          ? "Không tìm thấy nhà cung cấp nào 😢"
          : "Chưa có dữ liệu nhà cung cấp ⚓"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả nhà cung cấp</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#5A6A7D"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm nhà cung cấp theo tên..."
          placeholderTextColor="#8A9AAD"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003d66" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

export default SupplierListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FC",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C2A3A",
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1C2A3A",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontWeight: "700",
    fontSize: 17,
    color: "#1C2A3A",
    marginBottom: 2,
  },
  contact: {
    fontSize: 14,
    color: "#5A6A7D",
    marginBottom: 3,
  },
  address: {
    color: "#5A6A7D",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#5A6A7D",
    textAlign: "center",
  },
});
