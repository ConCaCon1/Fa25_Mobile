import React, { useRef, useState } from 'react';
import { View, Alert, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { VITE_GOONG_MAP_KEY, VITE_GOONG_API_KEY } from '@env';
import BottomNavBar from '../../components/BottomNavBar';

const MapScreen = ({ navigation }) => {
  const webviewRef = useRef(null);
  const [query, setQuery] = useState('');

  // Khi bản đồ load xong => lấy vị trí hiện tại và hiển thị marker đỏ
  const handleMapLoaded = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Không thể truy cập vị trí của bạn.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    const js = `
      if (typeof map !== 'undefined') {
        const userLoc = { lat: ${latitude}, lng: ${longitude} };
        window.userMarker = new maplibregl.Marker({ color: 'red' })
          .setLngLat([userLoc.lng, userLoc.lat])
          .addTo(map);
        map.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 14 });
        window.userLocation = userLoc;
      }
    `;
    webviewRef.current.injectJavaScript(js);
  };

  // Khi người dùng bấm tìm kiếm vị trí mới (hiển thị route)
  const handleSearch = () => {
    if (!query) return;
    const js = `
      (async function() {
        try {
          const autoRes = await fetch("https://rsapi.goong.io/place/autocomplete?api_key=${VITE_GOONG_API_KEY}&input=" + encodeURIComponent("${query}"));
          const autoData = await autoRes.json();
          if(autoData.predictions && autoData.predictions.length > 0){
            const place = autoData.predictions[0];
            const detailRes = await fetch("https://rsapi.goong.io/place/detail?api_key=${VITE_GOONG_API_KEY}&place_id=" + place.place_id);
            const detailData = await detailRes.json();
            if(detailData.result){
              const loc = detailData.result.geometry.location;

              if(window.searchMarker) window.searchMarker.remove();
              window.searchMarker = new maplibregl.Marker({ color: 'blue' })
                .setLngLat([loc.lng, loc.lat])
                .addTo(map);

              map.flyTo({ center: [loc.lng, loc.lat], zoom: 14 });

              if(window.userLocation){
                const routeRes = await fetch(
                  "https://rsapi.goong.io/Direction?origin=" +
                  window.userLocation.lat + "," + window.userLocation.lng +
                  "&destination=" + loc.lat + "," + loc.lng +
                  "&vehicle=car&api_key=${VITE_GOONG_API_KEY}"
                );
                const routeData = await routeRes.json();

                if(routeData && routeData.routes && routeData.routes.length > 0){
                  const points = routeData.routes[0].overview_polyline.points;

                  function decodePolyline(str) {
                    let index = 0, lat = 0, lng = 0, coordinates = [];
                    while (index < str.length) {
                      let b, shift = 0, result = 0;
                      do {
                        b = str.charCodeAt(index++) - 63;
                        result |= (b & 0x1f) << shift;
                        shift += 5;
                      } while (b >= 0x20);
                      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                      lat += dlat;
                      shift = 0;
                      result = 0;
                      do {
                        b = str.charCodeAt(index++) - 63;
                        result |= (b & 0x1f) << shift;
                        shift += 5;
                      } while (b >= 0x20);
                      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                      lng += dlng;
                      coordinates.push([lng * 1e-5, lat * 1e-5]);
                    }
                    return coordinates;
                  }

                  const coords = decodePolyline(points);

                  if(map.getSource('routeLine')){
                    map.getSource('routeLine').setData({
                      type: 'FeatureCollection',
                      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }]
                    });
                  } else {
                    map.addSource('routeLine', {
                      type: 'geojson',
                      data: {
                        type: 'FeatureCollection',
                        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }]
                      }
                    });
                    map.addLayer({
                      id: 'routeLine',
                      type: 'line',
                      source: 'routeLine',
                      paint: { 'line-color': '#007AFF', 'line-width': 5 }
                    });
                  }

                  const distanceKm = routeData.routes[0].legs[0].distance.text;
                  const duration = routeData.routes[0].legs[0].duration.text;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    address: place.description,
                    distance: distanceKm,
                    duration: duration
                  }));
                }
              }
            }
          }
        } catch(e){ console.error(e); }
      })();
    `;
    webviewRef.current.injectJavaScript(js);
  };

  // Nhận dữ liệu từ WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.distance) {
        Alert.alert('Thông tin vị trí', `📍 ${data.address}\n\nKhoảng cách: ${data.distance}\nThời gian: ${data.duration}`);
      } else if (data.lat && data.lng) {
        Alert.alert('Vị trí', `Kinh độ: ${data.lng}\nVĩ độ: ${data.lat}\n${data.address || ''}`);
      }
    } catch {}
  };

  // Nội dung HTML của bản đồ
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { position: absolute; top:0; bottom:0; width:100%; }
        </style>
        <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet"/>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=${VITE_GOONG_MAP_KEY}',
            center: [106.660172, 10.762622],
            zoom: 12
          });
          map.addControl(new maplibregl.NavigationControl());

          // Khi người dùng click vào bản đồ => hiển thị marker xanh + thông tin
          map.on('click', async (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;

            if(window.searchMarker) window.searchMarker.remove();
            window.searchMarker = new maplibregl.Marker({ color: 'blue' })
              .setLngLat([lng, lat])
              .addTo(map);

            // Gọi API reverse geocoding để lấy địa chỉ
            try {
              const res = await fetch("https://rsapi.goong.io/Geocode?latlng=" + lat + "," + lng + "&api_key=${VITE_GOONG_API_KEY}");
              const data = await res.json();
              const address = data.results && data.results.length > 0 ? data.results[0].formatted_address : '';
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng, address }));
            } catch {
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#fff', zIndex: 10 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            paddingHorizontal: 8,
            height: 40,
            borderRadius: 4,
          }}
          placeholder="Nhập địa chỉ hoặc địa điểm"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Tìm" onPress={handleSearch} />
      </View>

      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        mixedContentMode="always"
        onLoadEnd={handleMapLoaded}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />

      <BottomNavBar activeScreen="Map" navigation={navigation} />
    </SafeAreaView>
  );
};

export default MapScreen;
