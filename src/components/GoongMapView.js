import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { VITE_GOONG_MAP_KEY } from "@env";
import { apiGet } from "../ultis/api";

const GoongMapView = ({
  latitude = 10.762622,
  longitude = 106.660172,
  zoom = 13,
  icon = "ship",
  popupText = "Vị trí Tàu/Phương tiện",
  markerSize = 42,
  borderRadius = 16,
}) => {
  const [portsData, setPortsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        setLoading(true);
        const res = await apiGet("/ports");
        if (res.status === 200 && res.data?.items) {
          setPortsData(res.data.items);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPorts();
  }, []);

  const safePorts = portsData
    ? JSON.stringify(portsData).replace(/'/g, "\\'")
    : "[]";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet">
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <style>
    body,html,#map{margin:0;padding:0;height:100%;overflow:hidden;border-radius:${borderRadius}px}
    .ship{font-size:${markerSize}px;transform:translate(-50%,-100%);filter:drop-shadow(0 5px 10px rgba(0,0,0,0.6))}
    .port{font-size:34px;transform:translate(-50%,-100%)}
    .maplibregl-popup-content{font-family:system-ui;padding:10px 15px;border-radius:12px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,0.25);text-align:center}
    .maplibregl-popup-close-button{display:none}
  </style>
</head>
<body>
<div id="map"></div>

<script>
  // Biến toàn cục
  let map, shipMarker;
  let angle = 0; // để tàu xoay theo hướng di chuyển (đẹp hơn)

  const ports = ${safePorts};

  // Tạo tàu ngay từ đầu
  const shipEl = document.createElement('div');
  shipEl.className = 'ship';
  shipEl.innerText = '${icon}';

  const shipPopup = new maplibregl.Popup({offset:40, closeOnClick:false, closeButton:false})
    .setText('${popupText.replace(/'/g, "\\'")}');

  // Khởi tạo map
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
    center: [${longitude}, ${latitude}],
    zoom: ${zoom}
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // TẠO TÀU NGAY KHI MAP SẴN SÀNG (không đợi 'load')
  map.on('styledata', () => {
    if (shipMarker) return;

    shipMarker = new maplibregl.Marker({element: shipEl})
      .setLngLat([${longitude}, ${latitude}])
      .setPopup(shipPopup)
      .addTo(map);
    shipMarker.togglePopup();

    // Thêm các cảng
    ports.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const el = document.createElement('div');
      el.className = 'port';
      el.innerText = '⚓';
      new maplibregl.Marker({element: el})
        .setLngLat([parseFloat(p.longitude), parseFloat(p.latitude)])
        .setPopup(new maplibregl.Popup({offset:30,closeButton:false})
          .setHTML('<strong>'+(p.name||'Cảng')+'</strong><br><small>'+(p.city||'')+', '+(p.country||'')+'</small>'))
        .addTo(map);
    });
  });

  // DI CHUYỂN LIÊN TỤC – KHÔNG DÙNG 'load', 'render' gì cả
  // Dùng setInterval + tính toán vị trí theo thời gian thực
  let startTime = Date.now();

  function moveShip() {
    const elapsed = (Date.now() - startTime) / 1000; // giây
    const speed = 0.02; // độ/giây (tùy chỉnh tốc độ)
    
    // Di chuyển theo hình sin + cos → đường tròn đẹp
    const centerLng = ${longitude};
    const centerLat = ${latitude};
    const radius = 0.05; // bán kính vòng tròn

    const lng = centerLng + radius * Math.cos(elapsed * speed);
    const lat = centerLat + radius * Math.sin(elapsed * speed * 0.7); // hơi elip cho đẹp

    shipMarker.setLngLat([lng, lat]);

    // Xoay tàu theo hướng di chuyển (tùy chọn, rất đẹp)
    angle = (angle + 2) % 360;
    shipEl.style.transform = 'translate(-50%, -100%) rotate(' + angle + 'deg)';

    requestAnimationFrame(moveShip);
  }

  // Bắt đầu di chuyển ngay khi có thể
  setTimeout(moveShip, 1000);

  // Fallback cực mạnh: nếu 8s vẫn chưa có marker → ép tạo
  setTimeout(() => {
    if (!shipMarker && map) {
      shipMarker = new maplibregl.Marker({element: shipEl})
        .setLngLat([${longitude}, ${latitude}])
        .setPopup(shipPopup)
        .addTo(map);
      shipMarker.togglePopup();
      moveShip();
    }
  }, 8000);
</script>
</body>
</html>
`;

  return (
    <View style={[styles.card, { borderRadius }]}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <WebView
          source={{ html }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          style={{ flex: 1 }}
          scrollEnabled={false}
          bounces={false}
          scalesPageToFit={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});

export default GoongMapView;