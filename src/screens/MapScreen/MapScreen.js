import React, { useRef, useState } from 'react';
import {
  View,
  Alert,
  TextInput,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VITE_GOONG_MAP_KEY,
  VITE_GOONG_API_KEY,
  WEATHER_API_KEY,
} from '@env';

import BottomNavBar from '../../components/BottomNavBar';

const MapScreen = ({ navigation }) => {
  const webviewRef = useRef(null);
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);


  const showLocations = (locations) => {
    const js = `
      (function(){
        if (window.multiMarkers) {
          window.multiMarkers.forEach(m => m.remove());
        }
        window.multiMarkers = [];

        const data = ${JSON.stringify(locations)};

        data.forEach(item => {
          const marker = new maplibregl.Marker({ color: 'green' })
            .setLngLat([item.lng, item.lat])
            .setPopup(new maplibregl.Popup().setText(item.name))
            .addTo(map);
          window.multiMarkers.push(marker);
        });
      })();
    `;
    webviewRef.current?.injectJavaScript(js);
  };

  const testLocations = [
    { id: 1, name: "Bến Nhà Rồng", lat: 10.7680, lng: 106.7050 },
    { id: 2, name: "Landmark 81", lat: 10.7946, lng: 106.7223 },
    { id: 3, name: "Chợ Bến Thành", lat: 10.7723, lng: 106.6983 },
  ];

  const fetchWeather = async (lat, lng) => {
    try {
      setWeatherLoading(true);

      const simpleUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=vi&appid=${WEATHER_API_KEY}`;
      const res = await fetch(simpleUrl);

      if (!res.ok) {
        const err = await res.text();
        console.warn('API lỗi:', res.status, err);
        throw new Error('HTTP ' + res.status);
      }

      const data = await res.json();

      setWeatherData({
        current: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          weather: [{
            description: data.weather[0].description,
            icon: data.weather[0].icon,
          }],
        },
        alerts: [],
      });

    } catch (err) {
      console.warn('Hoàn toàn không lấy được thời tiết:', err);
      Alert.alert('Thông báo', 'Không thể tải thời tiết. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setWeatherLoading(false);
    }
  };


  const handleMapLoaded = async () => {
    showLocations(testLocations);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Không thể truy cập vị trí của bạn.');
      setWeatherLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    fetchWeather(latitude, longitude);

    const js = `
      if (typeof map !== 'undefined') {
        const userLoc = { lat: ${latitude}, lng: ${longitude} };
        if (window.userMarker) window.userMarker.remove();
        window.userMarker = new maplibregl.Marker({ color: 'red' })
          .setLngLat([userLoc.lng, userLoc.lat])
          .addTo(map);
        map.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 15 });
        window.userLocation = userLoc;
      }
    `;
    webviewRef.current?.injectJavaScript(js);
  };

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
                      paint: { 'line-color': '#4CAF50', 'line-width': 5, 'line-dasharray': [2, 1] } 
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
    webviewRef.current?.injectJavaScript(js);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.distance) {
        Alert.alert(
          'Thông tin Tuyến đường',
          `📍 ${data.address}\n\nKhoảng cách: ${data.distance}\nThời gian: ${data.duration}`,
          [{ text: 'Đóng' }]
        );
      } else if (data.lat && data.lng) {
        Alert.alert(
          'Thông tin Vị trí Đã Nhấn',
          `Vị trí: ${data.lat}, ${data.lng}\nĐịa chỉ: ${data.address || 'Không tìm thấy địa chỉ'}`,
          [{ text: 'Đóng' }]
        );
      }
    } catch (e) {
      console.warn('Message parse error:', e);
    }
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { position: absolute; top:0; bottom:10px; width:100%; }
          .maplibregl-ctrl-bottom-right {
            bottom: 100px; 
            right: 16px; 
          }
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
          
          map.addControl(new maplibregl.NavigationControl(), 'bottom-right'); 

          map.on('click', async (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            
            if(map.getLayer('routeLine')) map.removeLayer('routeLine');
            if(map.getSource('routeLine')) map.removeSource('routeLine');

            if(window.searchMarker) window.searchMarker.remove();
            window.searchMarker = new maplibregl.Marker({ color: '#FF3B30' }) 
              .setLngLat([lng, lat])
              .addTo(map);

            try {
              const res = await fetch("https://rsapi.goong.io/Geocode?latlng=" + lat + "," + lng + "&api_key=${VITE_GOONG_API_KEY}");
              const data = await res.json();
              const address = data.results?.[0]?.formatted_address || '';
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng, address }));
            } catch {
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
            }
          });
        </script>
      </body>
    </html>
  `;

  const iconCode = weatherData?.current?.weather?.[0]?.icon;
  const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        mixedContentMode="always"
        onLoadEnd={handleMapLoaded}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlayContainer} pointerEvents="box-none">
        
        <View style={styles.searchBarPlacement}>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={{ marginLeft: 16 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm địa chỉ, địa điểm..."
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity 
                    style={styles.searchButton} 
                    onPress={handleSearch}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-forward-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>


        <View style={styles.weatherPlacement} pointerEvents="box-none">
          {weatherLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#1F2937" />
              <Text style={styles.loadingText}>Đang tải thời tiết...</Text>
            </View>
          ) : weatherData?.current ? (
            <View style={styles.weatherCard}>
              {iconUrl && <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />}
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTempText}>
                  {Math.round(weatherData.current.temp)}°C
                </Text>
                <Text style={styles.weatherDescText}>
                  {weatherData.current.weather[0].description.charAt(0).toUpperCase() +
                    weatherData.current.weather[0].description.slice(1)}
                </Text>
              </View>
              {weatherData.alerts?.length > 0 && (
                <View style={styles.alertContainer}>
                  <Ionicons name="warning" size={16} color="#F59E0B" />
                  <Text style={styles.weatherAlertText}>Cảnh báo</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </View>

      <BottomNavBar activeScreen="Map" navigation={navigation} />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  overlayContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0, 
    paddingHorizontal: 16,
    zIndex: 10,
  },
  
  searchBarPlacement: {
    paddingTop: Platform.OS === 'ios' ? 10 : 16, 
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14, 
    height: 56, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    height: '100%',
    fontSize: 16,
    color: '#1F2937', 
  },
  searchButton: {
    backgroundColor: '#3B82F6', 
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  weatherPlacement: {
    alignItems: 'flex-end', 
    marginTop: 12,
  },

  loadingCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
      android: { elevation: 4, },
    }),
  },
  loadingText: { 
    marginLeft: 8, 
    color: '#1F2937', 
    fontSize: 14, 
    fontWeight: '500' 
  },

  weatherCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 16, 
    alignSelf: 'flex-start',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  weatherIcon: {
    width: 40, 
    height: 40,
  },
  weatherInfo: {
    marginLeft: 8,
  },
  weatherTempText: {
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1F2937', 
    lineHeight: 24,
  },
  weatherDescText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
    fontWeight: '400',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#FEF3C7', 
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  weatherAlertText: {
    fontSize: 12,
    color: '#B45309', 
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default MapScreen;