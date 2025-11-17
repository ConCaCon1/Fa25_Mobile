import React, { useRef, useEffect, useState } from "react";
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
  markerSize = 36,
  borderRadius = 16,
}) => {
  const webviewRef = useRef(null);
  const [portsData, setPortsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/ports"); 
        if (response.status === 200 && response.data?.items) {
          setPortsData(response.data.items);
        } else {
          console.warn("No ports data:", response);
        }
      } catch (error) {
        console.error("Failed to fetch ports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, []);

  const safePortsData = portsData
    ? JSON.stringify(portsData).replace(/'/g, "\\'")
    : "[]";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet"/>
        <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; border-radius: ${borderRadius}px; overflow: hidden; }
          
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

          .port-marker {
            font-size: 32px;
            cursor: pointer;
            transform: translate(-50%, -100%);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
            transition: transform 0.2s ease;
          }
          .port-marker:hover {
            transform: translate(-50%, -120%) scale(1.1);
          }
          
          .maplibregl-popup-content {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 500;
            font-size: 15px;
            color: #1a1a1a;
            padding: 10px 15px;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
          }
          .maplibregl-popup-tip { border-top-color: #ffffff; }
          .maplibregl-popup-close-button { display: none; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const startLat = ${latitude};
          const startLng = ${longitude};
          const endLat = ${latitude + 0.02};
          const endLng = ${longitude + 0.00};
          const duration = 5000;
          const steps = 100;
          let currentStep = 0;

          const ports = ${safePortsData};

          const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
            center: [startLng, startLat],
            zoom: ${zoom}
          });

          map.addControl(new maplibregl.NavigationControl());

          // Marker tàu di chuyển
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerText = '${icon}';

          const popup = new maplibregl.Popup({ offset: 35, closeOnClick: false })
            .setText('${popupText.replace(/'/g, "\\'")}');

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([startLng, startLat])
            .setPopup(popup)
            .addTo(map);

          ports.forEach(port => {
            const portEl = document.createElement('div');
            portEl.className = 'port-marker';
            portEl.innerText = '⚓';

            const portPopup = new maplibregl.Popup({ offset: 30, closeOnClick: false })
              .setHTML(\`
                <div style="text-align:center;">
                  <strong style="font-size:16px;">\${port.name}</strong><br/>
                  <small>\${port.city}, \${port.country}</small>
                </div>
              \`);

            new maplibregl.Marker({ element: portEl })
              .setLngLat([parseFloat(port.longitude), parseFloat(port.latitude)])
              .setPopup(portPopup)
              .addTo(map);
          });

          // Di chuyển marker
          map.on('load', () => {
            marker.togglePopup();

            const moveMarker = () => {
              if (currentStep > steps) return;
              const lat = startLat + ((endLat - startLat) * currentStep / steps);
              const lng = startLng + ((endLng - startLng) * currentStep / steps);
              marker.setLngLat([lng, lat]);
              map.setCenter([lng, lat]);
              currentStep++;
              setTimeout(moveMarker, duration / steps);
            };
            moveMarker();
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.card, { borderRadius }]}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1, borderRadius }}
          startInLoadingState={false}
        />
      )}
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