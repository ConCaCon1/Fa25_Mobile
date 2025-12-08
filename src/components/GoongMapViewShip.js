import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { VITE_GOONG_MAP_KEY, VITE_GOONG_API_KEY } from "@env";

const GoongMapViewShip = ({
  latitude = 10.762622,
  longitude = 106.660172,
  zoom = 14,
  popupText = "Tàu đang di chuyển",
  markerSize = 52,
  borderRadius = 16,
}) => {
  const webViewRef = useRef(null);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>

  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; border-radius: ${borderRadius}px; }

    .ship-marker {
      font-size: ${markerSize}px;
      filter: drop-shadow(3px 6px 10px rgba(0,0,0,0.6));
      transition: transform 0.1s linear;
    }

    .maplibregl-popup-content {
      background: rgba(0, 30, 80, 0.95) !important;
      color: white;
      padding: 10px 16px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 15px;
      text-align: center;
    }
  </style>
</head>

<body>
<div id="map"></div>

<script>
  const MAP_KEY = "${VITE_GOONG_MAP_KEY}";
  const API_KEY = "${VITE_GOONG_API_KEY}";

  const startLng = ${longitude};
  const startLat = ${latitude};

  // Toạ độ xưởng ông Hà
  const workshopLng = 106.66636897544674;
  const workshopLat = 10.771726410965698;

  let map, shipMarker, timer, routeCoordinates = [];

  // Tạo icon tàu
  const shipEl = document.createElement('div');
  shipEl.className = 'ship-marker';

// Thay vì setText
const popup = new maplibregl.Popup({
  offset: 40,
  closeButton: false,
})
.setHTML(\`<div style="font-size:28px;">🚤 </div>\`);


  // Init Map
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=' + MAP_KEY,
    center: [startLng, startLat],
    zoom: ${zoom}
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  async function getDirectionRoute() {
    const url =
      "https://rsapi.goong.io/Direction?origin=" +
      startLat + "," + startLng +
      "&destination=" + workshopLat + "," + workshopLng +
      "&vehicle=car&api_key=" + API_KEY;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.routes || json.routes.length === 0) return [];

    const points = json.routes[0].overview_polyline.points;
    return decodePolyline(points);
  }

  // Polyline decoder
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lng / 1e5, lat / 1e5]);
    }
    return points;
  }

  map.on("load", async () => {

    // Marker xưởng
    const workshopEl = document.createElement("div");
    workshopEl.style.fontSize = "40px";
    workshopEl.innerHTML = "🏭";

    new maplibregl.Marker({ element: workshopEl, anchor: "bottom" })
      .setLngLat([workshopLng, workshopLat])
      .setPopup(new maplibregl.Popup({ offset: 40 }).setText("Xưởng ông Hà"))
      .addTo(map);

    // Lấy route
    routeCoordinates = await getDirectionRoute();

    if (routeCoordinates.length > 0) {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-width": 6,
          "line-color": "#00A8FF",
        },
      });
    }

    // Marker tàu
    shipMarker = new maplibregl.Marker({ element: shipEl, anchor: "bottom" })
      .setLngLat([startLng, startLat])
      .setPopup(popup)
      .addTo(map);

    shipMarker.togglePopup();

    // Tàu chạy theo route
    let i = 0;

    timer = setInterval(() => {
      if (!routeCoordinates || i >= routeCoordinates.length) {
        clearInterval(timer);
        return;
      }

      const [lng, lat] = routeCoordinates[i];
      shipMarker.setLngLat([lng, lat]);

      // Xoay tàu
      if (i + 1 < routeCoordinates.length) {
        const [nextLng, nextLat] = routeCoordinates[i + 1];
        const angle = Math.atan2(nextLat - lat, nextLng - lng);
        const deg = angle * (180 / Math.PI);
        shipEl.style.transform = "rotate(" + deg + "deg)";
      }

      i++;
    }, 120);

  });

  // cleanup
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
      webViewRef.current?.injectJavaScript(
        `window.cleanup && window.cleanup(); true;`
      );
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
