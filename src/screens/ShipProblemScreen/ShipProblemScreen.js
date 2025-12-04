import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl, 
  Image,
  u
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGet } from '../../ultis/api';
import { useFocusEffect } from "@react-navigation/native";
const COLORS = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  primary: '#0A2540',
  secondary: '#00A8E8',
  border: '#E2E8F0',
  warning: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
};

const ShipProblemScreen = ({ route, navigation }) => {
  const { shipId, shipName } = route.params; 
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  const fetchReports = async () => {
    try {
      const res = await apiGet(`/ships/${shipId}/report-problems?page=1&size=50&sort=createdDate,desc`);
      
      if (res?.data?.items) {
        setReports(res.data.items);
      }
    } catch (error) {
      console.log("Error fetching ship problems:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchReports();     
  }, [shipId])
);
  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return COLORS.warning;
      case 'Accepted': return COLORS.success;
      case 'Rejected': return COLORS.danger;
      default: return COLORS.textSub;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ReportProblemDetail", { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.bg }]}>
                <Feather name="alert-triangle" size={18} color={COLORS.danger} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.dateText}>
                    {item.createdDate ? new Date(item.createdDate).toLocaleDateString('vi-VN') : ''}
                </Text>
            </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
             <Ionicons name="location-outline" size={14} color={COLORS.textSub} />
             <Text style={styles.locationText}>{item.portName || "Không rõ vị trí"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSub} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.headerTitle}>Sự cố tàu {shipName}</Text>
            <Text style={styles.headerSub}>Danh sách báo cáo</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png" }} 
                    style={{ width: 80, height: 80, opacity: 0.5, marginBottom: 15, tintColor: COLORS.textSub }}
                />
                <Text style={styles.emptyText}>Tàu này chưa có báo cáo sự cố nào.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  backBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  headerSub: { fontSize: 13, color: COLORS.textSub },

  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  iconBox: {
      width: 40, height: 40, borderRadius: 10,
      justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  dateText: { fontSize: 12, color: COLORS.textSub },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },

  cardDesc: { fontSize: 14, color: COLORS.textSub, marginBottom: 12, lineHeight: 20 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: COLORS.textSub, marginLeft: 4, fontWeight: '500' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textSub, fontSize: 16, fontWeight: '500' }
});

export default ShipProblemScreen;