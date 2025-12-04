import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { VITE_GOONG_MAP_KEY } from "@env";

const GoongMapViewShip = ({
  latitude = 10.762622,
  longitude = 106.660172,
  zoom = 14,
  icon = "ship",             
  popupText = "Tàu đang di chuyển",
  markerSize = 52,            
  borderRadius = 16,
}) => {
  const webViewRef = useRef(null);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <style>
    body, html, #map { margin:0; padding:0; height:100%; width:100%; overflow:hidden; border-radius:${borderRadius}px; }
    
    /* Marker tàu to, đẹp, có bóng và hiệu ứng sóng */
    .ship-marker {
      font-size: ${markerSize}px;
      filter: drop-shadow(3px 6px 10px rgba(0,0,0,0.6));
      animation: wave 6s infinite ease-in-out;
      transform-origin: center bottom;
    }
    
    @keyframes wave {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50%      { transform: translateY(-8px) rotate(1deg); }
    }
    
    .maplibregl-popup-content {
      background: rgba(0, 30, 80, 0.95) !important;
      color: white;
      padding: 10px 16px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 15px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    }
    .maplibregl-popup-tip {
      border-top-color: rgba(0, 30, 80, 0.95) !important;
    }
    .maplibregl-popup-close-button { display: none; }
  </style>
</head>
<body>
<div id="map"></div>

<script>
  const centerLng = ${longitude};
  const centerLat = ${latitude};

  let map, shipMarker, timer;
  const shipEl = document.createElement('div');
  shipEl.className = 'ship-marker';
  shipEl.innerHTML = '${icon}';

  const popup = new maplibregl.Popup({
    offset: 50,
    closeButton: false,
    closeOnClick: false
  }).setText('${popupText}');

  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
    center: [centerLng, centerLat],
    zoom: ${zoom},
    interactive: true
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  map.on('load', () => {
    shipMarker = new maplibregl.Marker({
      element: shipEl,
      anchor: 'bottom'
    })
    .setLngLat([centerLng, centerLat])
    .setPopup(popup)
    .addTo(map);

    shipMarker.togglePopup(); // luôn hiện popup

    // TÀU CHẠY VÒNG RẤT CHẬM, MƯỢT, ĐẸP NHƯ THẬT
    let angle = 0;
    const radius = 0.018;        // ~1.8km vòng quanh
    const speed = 0.003;         // SIÊU CHẬM – bạn sẽ thấy từng chút một

    timer = setInterval(() => {
      angle += speed;

      const offsetX = radius * Math.cos(angle);
      const offsetY = radius * Math.sin(angle * 0.7); // hình elip cho tự nhiên

      const newLng = centerLng + offsetX;
      const newLat = centerLat + offsetY;

      shipMarker.setLngLat([newLng, newLat]);

      // Xoay mũi tàu theo hướng chạy
      const rotateDeg = (angle * 180 / Math.PI) + 90;
      shipEl.style.transform = 'translate(-50%, -100%) rotate(' + rotateDeg + 'deg)';
    }, 80); // ~12-13 FPS → cực mượt và chậm đẹp
  });

  // Dọn dẹp khi rời khỏi màn hình
  window.cleanup = () => {
    if (timer) clearInterval(timer);
    if (shipMarker) shipMarker.remove();
    if (map) map.remove();
  };
</script>
</body>
</html>
`;

  useEffect(() => {
    return () => {
      webViewRef.current?.injectJavaScript(`window.cleanup && window.cleanup(); true;`);
    };
  }, []);

  return (
    <View style={[styles.container, { borderRadius }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        scrollEnabled={false}
        bounces={false}
        scalesPageToFit={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
    margin: 10,
    borderRadius: 16,
    elevation: 8,
  },
});

export default GoongMapViewShip;