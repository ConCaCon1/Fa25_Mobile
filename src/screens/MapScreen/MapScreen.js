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
  FlatList,
  Keyboard,
  StatusBar,
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

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#4285F4',
  success: '#34A853',
  warning: '#FBBC05',
  danger: '#EA4335',
  textMain: '#202124',
  textSub: '#5F6368',
  bg: '#FFFFFF',
  surface: '#F8F9FA',
  divider: '#E8EAED',
};

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
  
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const typingTimeoutRef = useRef(null); 

  const [routeStats, setRouteStats] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null); 
  const [selectedMode, setSelectedMode] = useState('car');
  
  const locationSubscription = useRef(null);

  const onChangeSearch = (text) => {
      setQuery(text);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (text.length < 2) {
          setSuggestions([]); setShowSuggestions(false); return;
      }
      typingTimeoutRef.current = setTimeout(async () => {
          try {
              const url = `https://rsapi.goong.io/place/autocomplete?api_key=${VITE_GOONG_API_KEY}&input=${encodeURIComponent(text)}`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.predictions) {
                  setSuggestions(data.predictions); setShowSuggestions(true);
              }
          } catch (error) {}
      }, 500);
  };

  const onSelectSuggestion = async (item) => {
      Keyboard.dismiss();
      setQuery(item.description);
      setSuggestions([]);
      setShowSuggestions(false);
      setRouteStats(null);

      try {
          const detailUrl = `https://rsapi.goong.io/place/detail?place_id=${item.place_id}&api_key=${VITE_GOONG_API_KEY}`;
          const res = await fetch(detailUrl);
          const data = await res.json();
          if (data.result && data.result.geometry) {
              const { lat, lng } = data.result.geometry.location;
              const address = data.result.formatted_address || item.description;
              const js = `window.handleRouteSelection(${lat}, ${lng}, "${address}");`;
              webviewRef.current?.injectJavaScript(js);
          }
      } catch (error) { Alert.alert("Lỗi", "Không thể lấy thông tin địa điểm."); }
  };

  const handleStartNavigation = async () => {
    if (!destinationCoords) return Alert.alert("Lỗi", "Chưa xác định tọa độ đích.");
    setIsNavigating(true); setRouteStats(null); 
    const startJs = `if (typeof map !== 'undefined') { map.flyTo({ zoom: 19, pitch: 60 }); window.isNavigating = true; }`;
    webviewRef.current?.injectJavaScript(startJs);

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 5 },
      (newLocation) => {
        const { latitude, longitude, heading } = newLocation.coords;
        const updateJs = `if (window.updateUserPosition) { window.updateUserPosition(${latitude}, ${longitude}, ${heading || 0}); }`;
        webviewRef.current?.injectJavaScript(updateJs);
        const distanceToDest = getDistanceFromLatLonInMeters(latitude, longitude, destinationCoords.lat, destinationCoords.lng);
        if (distanceToDest < 30) { handleStopNavigation(); Alert.alert("Đã đến nơi", "Bạn đã đến địa điểm mong muốn!"); }
      }
    );
  };

  const handleStopNavigation = () => {
    if (locationSubscription.current) { locationSubscription.current.remove(); locationSubscription.current = null; }
    setIsNavigating(false);
    const stopJs = `if (typeof map !== 'undefined') { window.isNavigating = false; map.flyTo({ pitch: 0, zoom: 15 }); }`;
    webviewRef.current?.injectJavaScript(stopJs);
  };

  const handleSwitchMode = (mode) => {
      setSelectedMode(mode);
      const js = `if (window.switchTransportMode) { window.switchTransportMode('${mode}'); }`;
      webviewRef.current?.injectJavaScript(js);
  };

  useEffect(() => { return () => { if (locationSubscription.current) locationSubscription.current.remove(); }; }, []);

  const fetchPorts = async () => {
    try {
        const res = await apiGet('/ports?page=1&size=100');
        const items = res?.data?.data?.items || res?.data?.items || [];
        injectPorts(items);
    } catch (error) {}
  };

  const fetchBoatyards = async () => {
    try {
        const res = await apiGet('/boatyards?page=1&size=100');
        const items = res?.data?.data?.items || res?.data?.items || [];
        injectBoatyards(items);
    } catch (error) {}
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
            let name = getVal(item, ['name']) || 'Cảng';
            const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML('<div style="padding:5px; font-weight:600">' + name + '</div>');
            const marker = new maplibregl.Marker({ color: '#7B1FA2' }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
            marker.getElement().addEventListener('click', () => { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FACILITY_CLICK', facilityType: 'PORT', data: item })); });
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
            let name = getVal(item, ['name']) || 'Xưởng';
            const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML('<div style="padding:5px; font-weight:600">' + name + '</div>');
            const marker = new maplibregl.Marker({ color: '#F57C00' }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
            marker.getElement().addEventListener('click', () => { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FACILITY_CLICK', facilityType: 'BOATYARD', data: item })); });
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
          setRouteStats({ address: msg.address, car: msg.car, bike: msg.bike, walk: msg.walk });
          return;
      }
      if (msg.type === 'FACILITY_CLICK') {
          setRouteStats(null); 
          const item = msg.data;
          Alert.alert(msg.facilityType === 'PORT' ? '⚓ Cảng' : '🛠️ Xưởng', item.name);
          return;
      }
    } catch (e) {}
  };

  const fetchWeather = async (lat, lng) => {
    try {
      setWeatherLoading(true);
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=vi&appid=${WEATHER_API_KEY}`);
      const data = await res.json();
      if(data.main) {
          setWeatherData({ current: { temp: data.main.temp, weather: [{ icon: data.weather[0].icon }] } });
      }
    } catch (err) {} finally { setWeatherLoading(false); }
  };

  const handleMapLoaded = async () => {
    fetchPorts();
    fetchBoatyards();
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return setWeatherLoading(false);
    const location = await Location.getCurrentPositionAsync({});
    fetchWeather(location.coords.latitude, location.coords.longitude);
    const js = `
      if (typeof map !== 'undefined') {
        const userLoc = { lat: ${location.coords.latitude}, lng: ${location.coords.longitude} };
        if (window.userMarker) window.userMarker.remove();
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.width = '24px'; el.style.height = '24px'; 
        el.style.backgroundColor = '#4285F4'; el.style.borderRadius = '50%'; 
        el.style.border = '3px solid white'; el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        window.userMarker = new maplibregl.Marker({ element: el }).setLngLat([userLoc.lng, userLoc.lat]).addTo(map);
        map.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 14 });
        window.userLocation = userLoc;
      }
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
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          #map { position: absolute; top:0; bottom:0; width:100%; }
          .maplibregl-ctrl-bottom-right { bottom: 100px; right: 16px; }
          .maplibregl-popup-content { padding: 8px 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; }
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
            zoom: 12,
            pitch: 0
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
             const url = "https://rsapi.goong.io/Direction?origin=" + origin.lat + "," + origin.lng + "&destination=" + dest.lat + "," + dest.lng + "&vehicle=" + vehicle + "&api_key=${VITE_GOONG_API_KEY}";
             try {
                const res = await fetch(url); const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                    const points = data.routes[0].overview_polyline.points;
                    return {
                        distance: data.routes[0].legs[0].distance.value, 
                        distanceText: data.routes[0].legs[0].distance.text,
                        duration: data.routes[0].legs[0].duration.text,
                        points: points,
                        coords: decodePolyline(points)
                    };
                }
             } catch (e) { return null; }
             return null;
          }

          window.switchTransportMode = (mode) => {
             let routeData = window.routeCache[mode];
             if (mode === 'walk') routeData = window.routeCache.bike; 
             if (!routeData || !routeData.coords) return;

             const geojson = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeData.coords } }] };
             if(map.getSource('routeLine')){ map.getSource('routeLine').setData(geojson); } 
             else {
                 map.addSource('routeLine', { type: 'geojson', data: geojson });
                 map.addLayer({ id: 'routeLine', type: 'line', source: 'routeLine', 
                     paint: { 'line-color': mode === 'walk' ? '#34A853' : '#4285F4', 'line-width': 6, 'line-dasharray': mode === 'walk' ? [2, 1] : [1, 0] },
                     layout: { 'line-cap': 'round', 'line-join': 'round' }
                 });
             }
             const bounds = new maplibregl.LngLatBounds();
             routeData.coords.forEach(coord => bounds.extend(coord));
             map.fitBounds(bounds, { padding: 80 });
          };

          window.handleRouteSelection = async (lat, lng, address) => {
             if(window.searchMarker) window.searchMarker.remove();
             window.searchMarker = new maplibregl.Marker({ color: '#EA4335' }).setLngLat([lng, lat]).addTo(map);

             if(window.userLocation){
                 const dest = { lat: lat, lng: lng };
                 const [carData, bikeData] = await Promise.all([ fetchDirection(window.userLocation, dest, 'car'), fetchDirection(window.userLocation, dest, 'bike') ]);
                 window.routeCache.car = carData; window.routeCache.bike = bikeData;

                 let walkData = null;
                 if (bikeData) {
                     const minutes = Math.ceil(bikeData.distance / 83);
                     walkData = { duration: minutes > 60 ? Math.floor(minutes/60) + " giờ " + (minutes%60) + " phút" : minutes + " phút", distanceText: bikeData.distanceText };
                 } else if (carData) {
                     const minutes = Math.ceil(carData.distance / 83);
                     walkData = { duration: minutes > 60 ? Math.floor(minutes/60) + " giờ " + (minutes%60) + " phút" : minutes + " phút", distanceText: carData.distanceText };
                 }

                 window.switchTransportMode('car');
                 
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                     type: 'MULTI_ROUTE_INFO', address: address, destLat: lat, destLng: lng, 
                     car: carData ? { distanceText: carData.distanceText, duration: carData.duration } : null,
                     bike: bikeData ? { distanceText: bikeData.distanceText, duration: bikeData.duration } : null,
                     walk: walkData
                 }));
             }
          };

          map.on('click', async (e) => {
            if (e.originalEvent.defaultPrevented) return;
            const lng = e.lngLat.lng; const lat = e.lngLat.lat;
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

  const iconUrl = weatherData?.current?.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png` : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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

      <View style={styles.uiContainer} pointerEvents="box-none">
        
        {isNavigating ? (
            <View style={styles.navHeaderCard}>
                <View style={styles.navInfoBox}>
                    <View style={styles.navIconBox}>
                        <MaterialCommunityIcons name="navigation" size={24} color="#fff" />
                    </View>
                    <View style={{marginLeft: 12}}>
                        <Text style={styles.navTitle}>Đang dẫn đường...</Text>
                        <Text style={styles.navSub}>Giữ màn hình luôn bật</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopNavigation}>
                    <Text style={styles.stopText}>Thoát</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <>
                <View style={styles.searchContainer}>
                    <TouchableOpacity onPress={() => onChangeSearch(query)} style={{padding: 4}}>
                        <Ionicons name="search" size={22} color={COLORS.textMain} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm địa điểm..."
                        placeholderTextColor={COLORS.textSub}
                        value={query}
                        onChangeText={onChangeSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => {setQuery(''); setSuggestions([]); setShowSuggestions(false);}}>
                            <Ionicons name="close-circle" size={20} color={COLORS.textSub} />
                        </TouchableOpacity>
                    )}
                </View>

                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsBox}>
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.place_id}
                            keyboardShouldPersistTaps="handled"
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.suggestionItem}
                                    onPress={() => onSelectSuggestion(item)}
                                >
                                    <View style={styles.suggestionIcon}>
                                        <Ionicons name="location-sharp" size={18} color={COLORS.textSub} />
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.suggestionMainText} numberOfLines={1}>{item.structured_formatting?.main_text || item.description}</Text>
                                        <Text style={styles.suggestionSubText} numberOfLines={1}>{item.structured_formatting?.secondary_text || ''}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {!showSuggestions && (
                    <View style={styles.rightFloatingContainer}>
                        {weatherData?.current && (
                            <View style={styles.weatherBadge}>
                                {iconUrl && <Image source={{ uri: iconUrl }} style={{width: 30, height: 30}} />}
                                <Text style={styles.weatherText}>{Math.round(weatherData.current.temp)}°</Text>
                            </View>
                        )}
                        <View style={styles.legendBadge}>
                            <View style={styles.legendRow}>
                                <View style={[styles.dot, {backgroundColor: '#7B1FA2'}]} />
                                <Text style={styles.legendLabel}>Cảng</Text>
                            </View>
                            <View style={styles.legendRow}>
                                <View style={[styles.dot, {backgroundColor: '#F57C00'}]} />
                                <Text style={styles.legendLabel}>Xưởng</Text>
                            </View>
                        </View>
                    </View>
                )}
            </>
        )}
      </View>

      {routeStats && !isNavigating && (
        <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle} numberOfLines={1}>{routeStats.address}</Text>
                <TouchableOpacity onPress={() => setRouteStats(null)} style={styles.closeSheetBtn}>
                    <Ionicons name="close" size={20} color={COLORS.textSub} />
                </TouchableOpacity>
            </View>

            <View style={styles.modeSelector}>
                <TouchableOpacity 
                    style={[styles.modeBtn, selectedMode === 'car' && styles.modeBtnActive]} 
                    onPress={() => handleSwitchMode('car')}
                >
                    <MaterialCommunityIcons name="car" size={24} color={selectedMode === 'car' ? '#FFF' : COLORS.textSub} />
                    <View style={styles.modeTextContainer}>
                        <Text style={[styles.modeLabel, selectedMode === 'car' && styles.modeTextActive]}>Ô tô</Text>
                        <Text style={[styles.modeDuration, selectedMode === 'car' && styles.modeTextActive]} numberOfLines={1}>
                            {routeStats.car?.duration || '--'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.modeBtn, selectedMode === 'bike' && styles.modeBtnActive]} 
                    onPress={() => handleSwitchMode('bike')}
                >
                    <MaterialCommunityIcons name="motorbike" size={24} color={selectedMode === 'bike' ? '#FFF' : COLORS.textSub} />
                    <View style={styles.modeTextContainer}>
                        <Text style={[styles.modeLabel, selectedMode === 'bike' && styles.modeTextActive]}>Xe máy</Text>
                        <Text style={[styles.modeDuration, selectedMode === 'bike' && styles.modeTextActive]} numberOfLines={1}>
                            {routeStats.bike?.duration || '--'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.modeBtn, selectedMode === 'walk' && styles.modeBtnActive]} 
                    onPress={() => handleSwitchMode('walk')}
                >
                    <MaterialCommunityIcons name="walk" size={24} color={selectedMode === 'walk' ? '#FFF' : COLORS.textSub} />
                    <View style={styles.modeTextContainer}>
                        <Text style={[styles.modeLabel, selectedMode === 'walk' && styles.modeTextActive]}>Đi bộ</Text>
                        <Text style={[styles.modeDuration, selectedMode === 'walk' && styles.modeTextActive]} numberOfLines={1}>
                            {routeStats.walk?.duration || '--'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.routeSummary}>
                Khoảng cách: {routeStats[selectedMode]?.distanceText || '--'}
            </Text>
            
            <TouchableOpacity style={styles.btnStart} onPress={handleStartNavigation} activeOpacity={0.8}>
                <Ionicons name="navigate" size={20} color="#FFF" style={{marginRight: 8}} />
                <Text style={styles.btnStartText}>Bắt đầu</Text>
            </TouchableOpacity>
        </View>
      )}

      {!isNavigating && <BottomNavBar activeScreen="Map" navigation={navigation} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  uiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  
  searchContainer: {
    top:50,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: COLORS.bg,
      marginTop: Platform.OS === 'ios' ? 10 : 40,
      paddingHorizontal: 12, height: 50,
      borderRadius: 25, 
      elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5,
  },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textMain, marginLeft: 8 },
  
  suggestionsBox: {
    top: 50,
      backgroundColor: COLORS.bg,
      borderRadius: 12,
      marginTop: 8,
      maxHeight: 250,
      elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
      overflow: 'hidden'
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  suggestionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F3F4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  suggestionMainText: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  suggestionSubText: { fontSize: 13, color: COLORS.textSub, marginTop: 2 },
  separator: { height: 1, backgroundColor: COLORS.divider, marginLeft: 56 },

  rightFloatingContainer: { alignItems: 'flex-end', marginTop: 12 },
  weatherBadge: {
    top:60,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.95)',
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 20, marginBottom: 8,
      elevation: 3, shadowOpacity: 0.1, shadowRadius: 3
  },
  weatherText: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginLeft: 4 },
  legendBadge: {
    top:70,
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: 10, borderRadius: 12,
      elevation: 3, shadowOpacity: 0.1, shadowRadius: 3
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSub },

  bottomSheetCard: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: COLORS.bg,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 20, paddingBottom: 90, 
      elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.2, shadowRadius: 8,
      zIndex: 20
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, flex: 1, marginRight: 10 },
  closeSheetBtn: { padding: 4, backgroundColor: '#F1F3F4', borderRadius: 15 },
  
  modeSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 5 },
  modeBtn: { 
      flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: '#F1F3F4', marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' 
  },
  modeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  modeTextContainer: { alignItems: 'center', marginTop: 4 },
  modeLabel: { fontSize: 11, color: COLORS.textSub, fontWeight: '500', marginBottom: 2 },
  modeDuration: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, textAlign: 'center' },
  modeTextActive: { color: '#FFF' },
  
  routeSummary: { textAlign: 'center', color: COLORS.textSub, marginBottom: 16, fontSize: 13 },
  btnStart: {
      backgroundColor: COLORS.primary,
      borderRadius: 30,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 14,
      elevation: 4
  },
  btnStartText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  navHeaderCard: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: '#202124', 
      marginTop: Platform.OS === 'ios' ? 10 : 40,
      padding: 16, borderRadius: 16,
      elevation: 6
  },
  navInfoBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  navIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  navTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  navSub: { color: '#9AA0A6', fontSize: 13 },
  stopButton: { backgroundColor: COLORS.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  stopText: { color: '#FFF', fontWeight: '600' }
});

export default MapScreen;