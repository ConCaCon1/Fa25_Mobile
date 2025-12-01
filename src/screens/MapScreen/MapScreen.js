import React, { useRef, useState, useEffect } from 'react';
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
  Linking,
  Dimensions,
  FlatList, // Import thêm FlatList
  Keyboard, // Import Keyboard để ẩn bàn phím
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VITE_GOONG_MAP_KEY,
  VITE_GOONG_API_KEY,
  WEATHER_API_KEY,
} from '@env';

import { apiGet } from '../../ultis/api'; 
import BottomNavBar from '../../components/BottomNavBar';

const { width, height } = Dimensions.get('window');

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapScreen = ({ navigation }) => {
  const webviewRef = useRef(null);
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  // --- STATE MỚI CHO GỢI Ý TÌM KIẾM ---
  const [suggestions, setSuggestions] = useState([]); // Danh sách gợi ý
  const [showSuggestions, setShowSuggestions] = useState(false); // Ẩn/hiện danh sách
  const typingTimeoutRef = useRef(null); // Để debounce việc gõ phím

  const [routeStats, setRouteStats] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null); 
  const [selectedMode, setSelectedMode] = useState('car');
  
  const locationSubscription = useRef(null);

  // --- HÀM TÌM KIẾM AUTOCOMPLETE (MỚI) ---
  const onChangeSearch = (text) => {
      setQuery(text);
      
      // Clear timeout cũ nếu người dùng vẫn đang gõ
      if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
      }

      if (text.length < 2) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
      }

      // Đợi 500ms sau khi ngừng gõ mới gọi API (Debounce)
      typingTimeoutRef.current = setTimeout(async () => {
          try {
              const url = `https://rsapi.goong.io/place/autocomplete?api_key=${VITE_GOONG_API_KEY}&input=${encodeURIComponent(text)}`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.predictions) {
                  setSuggestions(data.predictions);
                  setShowSuggestions(true);
              }
          } catch (error) {
              console.log("Autocomplete Error:", error);
          }
      }, 500);
  };

  // --- HÀM KHI CHỌN MỘT ĐỊA ĐIỂM TỪ DANH SÁCH (MỚI) ---
  const onSelectSuggestion = async (item) => {
      Keyboard.dismiss();
      setQuery(item.description); // Điền text vào ô input
      setSuggestions([]); // Xóa danh sách gợi ý
      setShowSuggestions(false);
      setRouteStats(null); // Reset panel đường đi cũ

      try {
          // Gọi API Detail để lấy tọa độ chính xác từ place_id
          const detailUrl = `https://rsapi.goong.io/place/detail?place_id=${item.place_id}&api_key=${VITE_GOONG_API_KEY}`;
          const res = await fetch(detailUrl);
          const data = await res.json();

          if (data.result && data.result.geometry) {
              const { lat, lng } = data.result.geometry.location;
              const address = data.result.formatted_address || item.description;

              // Gọi hàm trong WebView để vẽ đường
              const js = `window.handleRouteSelection(${lat}, ${lng}, "${address}");`;
              webviewRef.current?.injectJavaScript(js);
          }
      } catch (error) {
          Alert.alert("Lỗi", "Không thể lấy thông tin chi tiết địa điểm này.");
      }
  };

  // --- Logic Dẫn đường ---
  const handleStartNavigation = async () => {
    if (!destinationCoords) {
        Alert.alert("Lỗi", "Chưa xác định được tọa độ đích.");
        return;
    }
    setIsNavigating(true);
    setRouteStats(null); 

    const startJs = `
        if (typeof map !== 'undefined') {
            map.flyTo({ zoom: 18, pitch: 50 });
            window.isNavigating = true;
        }
    `;
    webviewRef.current?.injectJavaScript(startJs);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000, 
        distanceInterval: 5, 
      },
      (newLocation) => {
        const { latitude, longitude, heading } = newLocation.coords;
        const updateJs = `
            if (window.updateUserPosition) {
                window.updateUserPosition(${latitude}, ${longitude}, ${heading || 0});
            }
        `;
        webviewRef.current?.injectJavaScript(updateJs);

        const distanceToDest = getDistanceFromLatLonInMeters(
            latitude, longitude, 
            destinationCoords.lat, destinationCoords.lng
        );

        if (distanceToDest < 30) {
            handleStopNavigation();
            Alert.alert("Thành công", "Bạn đã đến nơi!");
        }
      }
    );
  };

  const handleStopNavigation = () => {
    if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
    }
    setIsNavigating(false);
    const stopJs = `
        if (typeof map !== 'undefined') {
            window.isNavigating = false;
            map.flyTo({ pitch: 0, zoom: 15 });
        }
    `;
    webviewRef.current?.injectJavaScript(stopJs);
  };

  const handleSwitchMode = (mode) => {
      setSelectedMode(mode);
      const js = `
         if (window.switchTransportMode) {
            window.switchTransportMode('${mode}');
         }
      `;
      webviewRef.current?.injectJavaScript(js);
  };

  useEffect(() => {
      return () => {
          if (locationSubscription.current) {
              locationSubscription.current.remove();
          }
      };
  }, []);

  const fetchPorts = async () => {
    try {
        const res = await apiGet('/ports?page=1&size=100');
        const items = res?.data?.data?.items || res?.data?.items || [];
        injectPorts(items);
    } catch (error) { console.log(error); }
  };

  const fetchBoatyards = async () => {
    try {
        const res = await apiGet('/boatyards?page=1&size=100');
        const items = res?.data?.data?.items || res?.data?.items || [];
        injectBoatyards(items);
    } catch (error) { console.log(error); }
  };

  const injectPorts = (items) => {
    const js = `
      (function() {
        if (window.portMarkers) { window.portMarkers.forEach(m => m.remove()); }
        window.portMarkers = [];
        const items = ${JSON.stringify(items)};
        const getVal = (item, keys) => { for (let key of keys) { if (item[key]) return item[key]; } return null; };
        items.forEach(item => {
            let lat = parseFloat(getVal(item, ['latitude', 'lat', 'Lat']));
            let lng = parseFloat(getVal(item, ['longitude', 'lng', 'long', 'Long']));
            if (isNaN(lat) || isNaN(lng)) return;
            let name = getVal(item, ['name']) || 'Cảng chưa đặt tên';
            const popupContent = '<div style="padding:5px"><b style="font-size:14px; color:#333">' + name + '</b></div>';
            const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent);
            const marker = new maplibregl.Marker({ color: '#7B1FA2' }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
            marker.getElement().addEventListener('click', () => {
                 window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FACILITY_CLICK', facilityType: 'PORT', data: item }));
            });
            window.portMarkers.push(marker);
        });
      })();
    `;
    webviewRef.current?.injectJavaScript(js);
  };

  const injectBoatyards = (items) => {
    const js = `
      (function() {
        if (window.boatyardMarkers) { window.boatyardMarkers.forEach(m => m.remove()); }
        window.boatyardMarkers = [];
        const items = ${JSON.stringify(items)};
        const getVal = (item, keys) => { for (let key of keys) { if (item[key]) return item[key]; } return null; };
        items.forEach(item => {
            let lat = parseFloat(getVal(item, ['latitude', 'lat', 'Lat']));
            let lng = parseFloat(getVal(item, ['longitude', 'lng', 'long', 'Long']));
            if (isNaN(lat) || isNaN(lng)) return;
            let name = getVal(item, ['name']) || 'Xưởng chưa đặt tên';
            const popupContent = '<div style="padding:5px"><b style="font-size:14px; color:#333">' + name + '</b></div>';
            const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent);
            const marker = new maplibregl.Marker({ color: '#F57C00' }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
            marker.getElement().addEventListener('click', () => {
                 window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FACILITY_CLICK', facilityType: 'BOATYARD', data: item }));
            });
            window.boatyardMarkers.push(marker);
        });
      })();
    `;
    webviewRef.current?.injectJavaScript(js);
  };

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MULTI_ROUTE_INFO') {
          setDestinationCoords({ lat: msg.destLat, lng: msg.destLng });
          setSelectedMode('car');
          setRouteStats({
              address: msg.address,
              car: msg.car,
              bike: msg.bike,
              walk: msg.walk
          });
          return;
      }
      if (msg.type === 'FACILITY_CLICK') {
          setRouteStats(null); 
          const item = msg.data;
          Alert.alert(msg.facilityType === 'PORT' ? '⚓ Cảng' : '🛠️ Xưởng', item.name);
          return;
      }
    } catch (e) { console.warn(e); }
  };

  const fetchWeather = async (lat, lng) => {
    try {
      setWeatherLoading(true);
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=vi&appid=${WEATHER_API_KEY}`);
      const data = await res.json();
      if(data.main) {
          setWeatherData({
            current: { temp: data.main.temp, weather: [{ icon: data.weather[0].icon }] },
          });
      }
    } catch (err) { } finally { setWeatherLoading(false); }
  };

  const handleMapLoaded = async () => {
    fetchPorts();
    fetchBoatyards();
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return setWeatherLoading(false);
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    fetchWeather(latitude, longitude);
    const js = `
      if (typeof map !== 'undefined') {
        const userLoc = { lat: ${latitude}, lng: ${longitude} };
        if (window.userMarker) window.userMarker.remove();
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.width = '20px'; el.style.height = '20px'; el.style.backgroundColor = '#007AFF';
        el.style.borderRadius = '50%'; el.style.border = '2px solid white';
        window.userMarker = new maplibregl.Marker({ element: el }).setLngLat([userLoc.lng, userLoc.lat]).addTo(map);
        map.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 13 });
        window.userLocation = userLoc;
      }
    `;
    webviewRef.current?.injectJavaScript(js);
  };

  // Giữ lại handleSearch cũ để dùng cho nút Search (enter)
  const handleSearch = () => {
    if (!query) return;
    setRouteStats(null);
    setShowSuggestions(false); // Ẩn gợi ý khi bấm nút tìm kiếm
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
              window.handleRouteSelection(loc.lat, loc.lng, place.description);
            }
          }
        } catch(e){ }
      })();
    `;
    webviewRef.current?.injectJavaScript(js);
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { position: absolute; top:0; bottom:0; width:100%; }
          .maplibregl-ctrl-bottom-right { bottom: 100px; right: 16px; }
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
          window.isNavigating = false;
          window.portMarkers = [];
          window.boatyardMarkers = [];
          window.routeCache = { car: null, bike: null, walk: null };

          window.updateUserPosition = (lat, lng, heading) => {
             if (window.userMarker) { window.userMarker.setLngLat([lng, lat]); }
             if (window.isNavigating) { map.flyTo({ center: [lng, lat], bearing: heading }); }
             window.userLocation = { lat: lat, lng: lng };
          };

          function decodePolyline(str) {
              let index = 0, lat = 0, lng = 0, coordinates = [];
              while (index < str.length) {
                  let b, shift = 0, result = 0;
                  do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
                  lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
                  shift = 0; result = 0;
                  do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
                  lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
                  coordinates.push([lng * 1e-5, lat * 1e-5]);
              }
              return coordinates;
          }

          async function fetchDirection(origin, dest, vehicle) {
             const url = "https://rsapi.goong.io/Direction?origin=" + origin.lat + "," + origin.lng + 
                         "&destination=" + dest.lat + "," + dest.lng + 
                         "&vehicle=" + vehicle + "&api_key=${VITE_GOONG_API_KEY}";
             try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                    const points = data.routes[0].overview_polyline.points;
                    const coords = decodePolyline(points);
                    return {
                        distance: data.routes[0].legs[0].distance.value, 
                        distanceText: data.routes[0].legs[0].distance.text,
                        duration: data.routes[0].legs[0].duration.text,
                        points: points,
                        coords: coords 
                    };
                }
             } catch (e) { return null; }
             return null;
          }

          window.switchTransportMode = (mode) => {
             let routeData = window.routeCache[mode];
             if (mode === 'walk') routeData = window.routeCache.bike; // Walk dùng chung geometry với Bike
             if (!routeData || !routeData.coords) return;

             const geojson = {
                type: 'FeatureCollection',
                features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeData.coords } }]
             };

             if(map.getSource('routeLine')){
                 map.getSource('routeLine').setData(geojson);
             } else {
                 map.addSource('routeLine', { type: 'geojson', data: geojson });
                 map.addLayer({ 
                     id: 'routeLine', type: 'line', source: 'routeLine', 
                     paint: { 
                         'line-color': mode === 'walk' ? '#4CAF50' : '#4285F4', 
                         'line-width': 6,
                         'line-dasharray': mode === 'walk' ? [2, 1] : [1, 0] 
                     }
                 });
             }
             const bounds = new maplibregl.LngLatBounds();
             routeData.coords.forEach(coord => bounds.extend(coord));
             map.fitBounds(bounds, { padding: 50 });
          };

          window.handleRouteSelection = async (lat, lng, address) => {
             if(window.searchMarker) window.searchMarker.remove();
             window.searchMarker = new maplibregl.Marker({ color: '#FF3B30' }).setLngLat([lng, lat]).addTo(map);

             if(window.userLocation){
                 const dest = { lat: lat, lng: lng };
                 const [carData, bikeData] = await Promise.all([
                     fetchDirection(window.userLocation, dest, 'car'),
                     fetchDirection(window.userLocation, dest, 'bike')
                 ]);
                 window.routeCache.car = carData;
                 window.routeCache.bike = bikeData;

                 let walkData = null;
                 if (bikeData) {
                     const minutes = Math.ceil(bikeData.distance / 83);
                     walkData = { duration: minutes > 60 ? Math.floor(minutes/60) + "h " + (minutes%60) + "m" : minutes + " p", distanceText: bikeData.distanceText };
                 } else if (carData) {
                     const minutes = Math.ceil(carData.distance / 83);
                     walkData = { duration: minutes > 60 ? Math.floor(minutes/60) + "h " + (minutes%60) + "m" : minutes + " p", distanceText: carData.distanceText };
                 }

                 window.switchTransportMode('car');
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                     type: 'MULTI_ROUTE_INFO',
                     address: address,
                     destLat: lat, destLng: lng, 
                     car: carData ? { distance: carData.distanceText, duration: carData.duration } : null,
                     bike: bikeData ? { distance: bikeData.distanceText, duration: bikeData.duration } : null,
                     walk: walkData
                 }));
             }
          };

          map.on('click', async (e) => {
            if (e.originalEvent.defaultPrevented) return;
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            try {
              const res = await fetch("https://rsapi.goong.io/Geocode?latlng=" + lat + "," + lng + "&api_key=${VITE_GOONG_API_KEY}");
              const data = await res.json();
              const address = data.results?.[0]?.formatted_address || 'Vị trí đã chọn';
              window.handleRouteSelection(lat, lng, address);
            } catch { }
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
        {isNavigating ? (
            <View style={styles.navigationHeader}>
                <View style={styles.navInfoBox}>
                    <Text style={styles.navTitle}>Đang dẫn đường...</Text>
                    <Text style={styles.navSub}>Theo dõi màn hình</Text>
                </View>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopNavigation}>
                    <Text style={styles.stopText}>Thoát</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <>
                {/* Search Bar */}
                <View style={styles.searchBarPlacement}>
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#6B7280" style={{ marginLeft: 16 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm địa điểm..."
                            placeholderTextColor="#9CA3AF"
                            value={query}
                            onChangeText={onChangeSearch} // Dùng hàm mới
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Ionicons name="arrow-forward-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* LIST SUGGESTIONS (Hiển thị ngay dưới Search bar) */}
                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.place_id}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.suggestionItem}
                                    onPress={() => onSelectSuggestion(item)}
                                >
                                    <Ionicons name="location-outline" size={20} color="#555" style={{marginRight: 10}} />
                                    <View style={{flex:1}}>
                                        <Text style={styles.suggestionTextMain} numberOfLines={1}>{item.structured_formatting?.main_text || item.description}</Text>
                                        <Text style={styles.suggestionTextSub} numberOfLines={1}>{item.structured_formatting?.secondary_text || ''}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* Các overlay khác ẩn khi có list suggestions để đỡ rối */}
                {!showSuggestions && (
                    <>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#7B1FA2'}]} /><Text style={styles.legendText}>Cảng tàu</Text></View>
                            <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#F57C00'}]} /><Text style={styles.legendText}>Xưởng</Text></View>
                        </View>
                        <View style={styles.weatherPlacement} pointerEvents="box-none">
                        {weatherLoading ? <View style={styles.loadingCard}><ActivityIndicator size="small" color="#1F2937" /></View> 
                        : weatherData?.current ? (
                            <View style={styles.weatherCard}>
                            {iconUrl && <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />}
                            <View style={styles.weatherInfo}><Text style={styles.weatherTempText}>{Math.round(weatherData.current.temp)}°C</Text></View>
                            </View>
                        ) : null}
                        </View>
                    </>
                )}
            </>
        )}
      </View>

      {routeStats && !isNavigating && (
        <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle} numberOfLines={1}>{routeStats.address}</Text>
                <TouchableOpacity onPress={() => setRouteStats(null)}>
                    <Ionicons name="close-circle" size={24} color="#ccc" />
                </TouchableOpacity>
            </View>
            <View style={styles.transportModesContainer}>
                <TouchableOpacity style={styles.transportItem} onPress={() => handleSwitchMode('car')}>
                    <View style={[styles.iconCircle, selectedMode === 'car' ? styles.activeCircle : styles.inactiveCircle]}>
                        <MaterialCommunityIcons name="car" size={24} color={selectedMode === 'car' ? '#fff' : '#555'} />
                    </View>
                    <Text style={[styles.timeText, selectedMode === 'car' ? {} : {color:'#555'}]}>{routeStats.car?.duration || '--'}</Text>
                    <Text style={styles.distanceText}>{routeStats.car?.distance || '--'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportItem} onPress={() => handleSwitchMode('bike')}>
                    <View style={[styles.iconCircle, selectedMode === 'bike' ? styles.activeCircle : styles.inactiveCircle]}>
                        <MaterialCommunityIcons name="motorbike" size={24} color={selectedMode === 'bike' ? '#fff' : '#555'} />
                    </View>
                    <Text style={[styles.timeText, selectedMode === 'bike' ? {} : {color:'#555'}]}>{routeStats.bike?.duration || '--'}</Text>
                    <Text style={styles.distanceText}>{routeStats.bike?.distance || '--'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportItem} onPress={() => handleSwitchMode('walk')}>
                    <View style={[styles.iconCircle, selectedMode === 'walk' ? styles.activeCircle : styles.inactiveCircle]}>
                        <MaterialCommunityIcons name="walk" size={24} color={selectedMode === 'walk' ? '#fff' : '#555'} />
                    </View>
                    <Text style={[styles.timeText, selectedMode === 'walk' ? {} : {color:'#555'}]}>{routeStats.walk?.duration || '--'}</Text>
                    <Text style={styles.distanceText}>{routeStats.walk?.distanceText || ''}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.startNavButton} onPress={handleStartNavigation}>
                <Ionicons name="navigate" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.startNavText}>Bắt đầu</Text>
            </TouchableOpacity>
        </View>
      )}

      {!isNavigating && <BottomNavBar activeScreen="Map" navigation={navigation} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
  overlayContainer: { position: 'absolute', top: 40, left: 0, right: 0, bottom: 0, paddingHorizontal: 16, zIndex: 10 },
  searchBarPlacement: { paddingTop: Platform.OS === 'ios' ? 10 : 16 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, height: 50, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
  searchInput: { flex: 1, paddingHorizontal: 12, height: '100%', fontSize: 16, color: '#1F2937' },
  searchButton: { backgroundColor: '#0A2540', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', height: '100%' },
  
  // Suggestion Styles
  suggestionsContainer: {
      marginTop: 5,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      maxHeight: 250,
  },
  suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  suggestionTextMain: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  suggestionTextSub: { fontSize: 12, color: '#666', marginTop: 2 },

  weatherPlacement: { alignItems: 'flex-end', marginTop: 10 },
  weatherCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 8, borderRadius: 12, alignItems: 'center', elevation: 3 },
  weatherIcon: { width: 30, height: 30 },
  weatherTempText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  loadingCard: { backgroundColor: 'white', padding: 8, borderRadius: 8 },
  legendContainer: { flexDirection: 'row', marginTop: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, elevation: 20, paddingBottom: 80, zIndex: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  transportModesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  transportItem: { alignItems: 'center', flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  activeCircle: { backgroundColor: '#4285F4' },
  inactiveCircle: { backgroundColor: '#E0E0E0' },
  timeText: { fontSize: 14, fontWeight: 'bold', color: '#4285F4' },
  distanceText: { fontSize: 11, color: '#888' },
  startNavButton: { backgroundColor: '#4285F4', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 30 },
  startNavText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  navigationHeader: { flexDirection: 'row', backgroundColor: '#0A2540', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  navInfoBox: { flex: 1 },
  navTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  navSub: { color: '#ddd', fontSize: 14 },
  stopButton: { backgroundColor: '#EF476F', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  stopText: { color: 'white', fontWeight: 'bold' }
});

export default MapScreen;