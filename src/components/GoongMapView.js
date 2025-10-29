import React, { useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { VITE_GOONG_MAP_KEY } from "@env";

const GoongMapView = ({
  latitude = 10.762622,
  longitude = 106.660172,
  zoom = 13,
  icon = "🚢", 
  popupText = "Vị trí Tàu/Phương tiện",
  markerSize = 36, 
  borderRadius = 16,
}) => {
  const webviewRef = useRef(null);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet"/>
        <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
        <style>
          html, body, #map { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            border-radius: ${borderRadius}px; 
            overflow: hidden; 
          }
          
          /* Cải thiện Marker */
          .custom-marker {
            font-size: ${markerSize}px;
            cursor: pointer;
            /* Đặt vị trí chính xác */
            transform: translate(-50%, -100%); 
            /* Transition mượt mà hơn */
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease; 
            /* Thêm bóng đổ cho marker để trông nổi 3D */
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.35)); 
          }
          .custom-marker:hover {
            /* Hiệu ứng nhấc lên rõ ràng và sống động */
            transform: translate(-50%, -130%) scale(1.15);
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
          }
          
          /* Cải thiện Popup */
          .maplibregl-popup-content {
            /* Sử dụng font hệ thống hoặc font phổ biến, font-weight 500 */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            font-weight: 500;
            font-size: 15px;
            color: #1a1a1a;
            padding: 10px 15px; /* Tăng padding */
            border-radius: 12px; /* Góc bo tròn hơn */
            background: #ffffff; /* Nền trắng tinh khiết */
            /* Bóng nhẹ nhàng và hiện đại */
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          .maplibregl-popup-tip {
            /* Đảm bảo mũi tên khớp với màu nền popup */
            border-top-color: #ffffff;
          }
          .maplibregl-popup-close-button {
              /* Ẩn nút đóng mặc định nếu bạn muốn popup chỉ là thông tin tĩnh */
              display: none; 
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
            center: [${longitude}, ${latitude}],
            zoom: ${zoom}
          });

          // Thêm điều khiển điều hướng bản đồ
          map.addControl(new maplibregl.NavigationControl());

          // Tạo element cho marker
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerText = '${icon}';

          // Tạo Popup
          const popup = new maplibregl.Popup({ 
            offset: 35, // Tăng offset để popup không chạm vào marker
            closeOnClick: false // Giữ popup mở khi click ra ngoài
          })
            .setText('${popupText.replace(/'/g, "\\'")}'); // Xử lý ký tự ' trong chuỗi

          // Thêm Marker vào bản đồ
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([${longitude}, ${latitude}])
            .setPopup(popup)
            .addTo(map);

          // Tự động mở popup khi bản đồ tải xong (Tùy chọn)
          map.on('load', () => {
              marker.togglePopup();
          });

        </script>
      </body>
    </html>
  `;

  return (
      <View style={[styles.card, { borderRadius }]}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1, borderRadius }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          )}
        />
      </View>
  );
};

export default GoongMapView;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 12,
    backgroundColor: "#ffffff", 
    borderRadius: 16,
    overflow: "hidden",
    
    elevation: 8, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7", 
  },
});