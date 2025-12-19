import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Bảng màu
const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  textDark: "#1D3557",
  textMedium: "#64748B",
  aiBubble: "#E1F5FE",
  userBubble: "#00A8E8",
  productBg: "#F1F5F9",
};

const ChatAIScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      text: "Xin chào! Tôi là trợ lý ảo hàng hải. Bạn cần tìm kiếm chân vịt hay phụ tùng gì hôm nay?",
      products: [],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // 1. Hiển thị tin nhắn của User ngay lập tức
    const currentQuery = inputText;
    const userMsg = { 
        id: Date.now().toString(), 
        type: "user", 
        text: currentQuery 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // 2. Gọi API trực tiếp (Fetch)
      const response = await fetch("https://marine-bridge.harmon.love:18443/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          prompt: currentQuery // Truyền key "prompt" theo yêu cầu
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response Data:", data);

      // 3. Tạo tin nhắn AI từ response trả về
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        // Lấy text từ "promptResponse"
        text: data.promptResponse || "Xin lỗi, tôi không tìm thấy thông tin.",
        // Lấy mảng sản phẩm từ "products"
        products: data.products || [], 
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = {
        id: Date.now().toString(),
        type: "ai",
        text: "Hệ thống đang bận hoặc gặp lỗi kết nối. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Cuộn xuống dưới cùng sau khi render xong
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // --- Render từng thẻ sản phẩm nhỏ ---
  const renderProductItem = (product) => (
    <TouchableOpacity 
      key={product.Id} // Lưu ý: API trả về Id viết hoa
      style={styles.productSuggestion}
      onPress={() => {
        // Điều hướng sang chi tiết sản phẩm nếu có màn hình đó
        // navigation.navigate("ProductDetailScreen", { id: product.Id });
        console.log("Xem chi tiết:", product.Name);
      }}
    >
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="screw-machine-flat-top" size={24} color={COLORS.secondary} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.productSuggestName} numberOfLines={1}>
            {product.Name} 
        </Text>
        <Text style={styles.productSuggestDesc} numberOfLines={2}>
            {product.Description}
        </Text>
        {product.IsHasVariant && (
            <Text style={styles.variantTag}>Có nhiều tùy chọn</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMedium} />
    </TouchableOpacity>
  );

  // --- Render từng dòng tin nhắn (User hoặc AI) ---
  const renderMessage = ({ item }) => {
    const isUser = item.type === "user";
    
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot-happy" size={20} color="#fff" />
          </View>
        )}
        
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>

          {/* Nếu tin nhắn AI có kèm danh sách products thì hiển thị bên dưới */}
          {!isUser && item.products && item.products.length > 0 && (
            <View style={styles.productContainer}>
              <View style={styles.divider} />
              <Text style={styles.productHeader}>Sản phẩm tham khảo:</Text>
              {item.products.map((prod) => renderProductItem(prod))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 5}}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tư vấn khách hàng</Text>
        <View style={{ width: 34 }} /> 
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator khi đang chờ AI */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Đang tìm kiếm sản phẩm phù hợp...</Text>
        </View>
      )}

      {/* Input Chat */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Có chân vịt đồng 4 cánh không?"
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && { backgroundColor: "#CBD5E1" }]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatAIScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.primary },

  messageRow: { flexDirection: "row", marginBottom: 20, maxWidth: "100%" },
  userRow: { alignSelf: "flex-end", justifyContent: "flex-end", maxWidth: "80%" },
  aiRow: { alignSelf: "flex-start", maxWidth: "90%" },

  aiAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    marginRight: 10, marginTop: 0,
  },

  bubble: { padding: 14, borderRadius: 18 },
  userBubble: { 
    backgroundColor: COLORS.userBubble, 
    borderBottomRightRadius: 4 
  },
  aiBubble: { 
    backgroundColor: COLORS.white, 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, borderColor: "#E2E8F0",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width:0, height:1},
    elevation: 1
  },

  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "#fff" },
  aiText: { color: COLORS.textDark },

  // Styles cho phần Sản phẩm gợi ý
  productContainer: { marginTop: 10 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 10 },
  productHeader: { fontSize: 13, fontWeight: "700", color: COLORS.secondary, marginBottom: 8, textTransform: "uppercase" },
  
  productSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center"
  },
  productSuggestName: { fontSize: 14, fontWeight: "700", color: COLORS.textDark, marginBottom: 2 },
  productSuggestDesc: { fontSize: 12, color: COLORS.textMedium },
  variantTag: { fontSize: 10, color: COLORS.secondary, marginTop: 4, fontWeight: "600" },

  // Input area
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10, paddingBottom: 10, // cho multiline đẹp hơn
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
    color: COLORS.textDark,
  },
  sendBtn: {
    backgroundColor: COLORS.secondary,
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },

  // Loading
  loadingContainer: { flexDirection: "row", padding: 10, alignItems: "center", marginLeft: 50 },
  loadingText: { marginLeft: 10, fontSize: 13, color: COLORS.textMedium, fontStyle: "italic" },
});