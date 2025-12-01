import React, { useEffect, useState, useRef } from "react";
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
  const webViewRef = useRef(null);
  const animationId = useRef(null); // để hủy animation khi unmount

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        setLoading(true);
        const res = await apiGet("/ports?page=1&size=200");
        if (res.status === 200 && res.data?.items) {
          setPortsData(res.data.items);
        }
      } catch (err) {
        console.warn("Lỗi tải cảng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPorts();
  }, []);

  // Tạo HTML với animation CHỈ dành riêng cho tàu
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
    .ship-marker {
      font-size: ${markerSize}px;
      cursor: pointer;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
    }
    .port-marker {
      font-size: 34px;
      transform: translate(-50%, -100%);
    }
    .maplibregl-popup-content {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 10px 15px;
      border-radius: 12px;
      background: rgba(0,0,0,0.85);
      color: white;
      font-weight: 600;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .maplibregl-popup-close-button { display: none; }
    .maplibregl-popup-tip { border-top-color: rgba(0,0,0,0.85) !important; }
  </style>
</head>
<body>
<div id="map"></div>

<script>
  let map, shipMarker, animationFrame;
  const ports = ${portsData ? JSON.stringify(portsData) : "[]"};

  // Tạo phần tử tàu
  const shipEl = document.createElement('div');
  shipEl.className = 'ship-marker';
  shipEl.innerText = '${icon}';

  const shipPopup = new maplibregl.Popup({
    offset: 40,
    closeOnClick: false,
    closeButton: false
  }).setText('${popupText.replace(/'/g, "\\'")}');

  // Khởi tạo map
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
    center: [${longitude}, ${latitude}],
    zoom: ${zoom},
    interactive: true
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Tạo tàu ngay khi map sẵn sàng
  map.on('load', () => {
    // Tạo marker tàu
    shipMarker = new maplibregl.Marker({
      element: shipEl,
      anchor: 'bottom'
    })
      .setLngLat([${longitude}, ${latitude}])
      .setPopup(shipPopup)
      .addTo(map);

    shipMarker.togglePopup(); // luôn hiển thị popup

    // Tạo các cảng (ĐỨNG YÊN)
    ports.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const el = document.createElement('div');
      el.className = 'port-marker';
      el.innerText = '⚓';
      new maplibregl.Marker({ element: el })
        .setLngLat([parseFloat(p.longitude), parseFloat(p.latitude)])
        .setPopup(new maplibregl.Popup({ offset: 30, closeButton: false })
          .setHTML('<strong>' + (p.name || 'Cảng') + '</strong><br><small>' + 
                   (p.city ? p.city + ', ' : '') + (p.country || '') + '</small>'))
        .addTo(map);
    });

    // BẮT ĐẦU DI CHUYỂN TÀU (chỉ tàu thôi!)
    startShipAnimation();
  });

  // Hàm animation MƯỢT MÀ, CHỈ CHO TÀU
  function startShipAnimation() {
    const centerLng = ${longitude};
    const centerLat = ${latitude};
    const radius = 0.04; // bán kính vòng tròn
    const speed = 0.015; // tốc độ quay
    let startTime = Date.now();

    function animate() {
      const elapsed = (Date.now() - startTime) / 1000;
      const angle = elapsed * speed;

      const lng = centerLng + radius * Math.cos(angle);
      const lat = centerLat + radius * Math.sin(angle * 0.8); // hơi elip cho tự nhiên

      // Di chuyển tàu
      if (shipMarker) {
        shipMarker.setLngLat([lng, lat]);
      }

      // Xoay tàu theo hướng di chuyển (rất đẹp!)
      const rotateAngle = (angle * 180 / Math.PI) + 90; // +90 để mũi tàu hướng đúng
      shipEl.style.transform = 'translate(-50%, -100%) rotate(' + rotateAngle + 'deg)';

      animationFrame = requestAnimationFrame(animate);
    }

    animate();
  }

  // Dọn dẹp khi component unmount (rất quan trọng!)
  window.cleanupShipAnimation = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (shipMarker) shipMarker.remove();
  };
</script>
</body>
</html>
`;

  // Dọn dẹp animation khi component unmount
  useEffect(() => {
    return () => {
      // Gọi hàm dọn dẹp trong WebView
      webViewRef.current?.injectJavaScript(`
        if (window.cleanupShipAnimation) window.cleanupShipAnimation();
      `);
    };
  }, []);

  return (
    <View style={[styles.card, { borderRadius }]}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          style={{ flex: 1, backgroundColor: '#f0f0f0' }}
          scrollEnabled={false}
          bounces={false}
          scalesPageToFit={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
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