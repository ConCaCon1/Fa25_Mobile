import React, { useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { VITE_GOONG_MAP_KEY } from "@env";

const GoongMapViewClickable = ({
  latitude = 10.762622,
  longitude = 106.660172,
  zoom = 13,
  icon = "🚢",
  popupText = "Vị trí Tàu/Phương tiện",
  markerSize = 36,
  borderRadius = 16,
  onMessage, 
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

          .custom-marker {
            font-size: ${markerSize}px;
            cursor: pointer;
            transform: translate(-50%, -100%); 
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease; 
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.35)); 
          }
          .custom-marker:hover {
            transform: translate(-50%, -130%) scale(1.15);
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
          }

          .maplibregl-popup-content {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            font-weight: 500;
            font-size: 15px;
            color: #1a1a1a;
            padding: 10px 15px;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          .maplibregl-popup-tip {
            border-top-color: #ffffff;
          }
          .maplibregl-popup-close-button {
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

          map.addControl(new maplibregl.NavigationControl());

          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerText = '${icon}';

          const popup = new maplibregl.Popup({ offset: 35, closeOnClick: false })
            .setText('${popupText.replace(/'/g, "\\'")}');

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([${longitude}, ${latitude}])
            .setPopup(popup)
            .addTo(map);

          map.on('load', () => {
              marker.togglePopup();
          });

          // ✅ Khi click vào bản đồ, cập nhật marker và gửi dữ liệu về React Native
          map.on('click', function(e) {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;

            marker.setLngLat([lng, lat]);

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "MAP_CLICK",
              latitude: lat,
              longitude: lng
            }));
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
        onMessage={onMessage}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        )}
      />
    </View>
  );
};

export default GoongMapViewClickable;

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
