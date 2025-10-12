import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert, TextInput, Button } from 'react-native';
import { VITE_GOONG_MAP_KEY, VITE_GOONG_API_KEY } from '@env';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapScreen = () => {
  const webviewRef = useRef(null);
  const [query, setQuery] = useState('');

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    const { lng, lat, address } = data;
    Alert.alert('Selected Location', `Lng: ${lng}, Lat: ${lat}\nAddress: ${address || 'N/A'}`);
    console.log('Location:', data);
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
              // Xóa marker cũ
              document.querySelectorAll('.maplibregl-marker').forEach(el => el.remove());
              // Marker mới
              new maplibregl.Marker().setLngLat([loc.lng, loc.lat]).addTo(map);
              // Vẽ circle
              const circleCoords = [];
              const points = 64;
              const radius = 500;
              const km = radius / 1000;
              const distanceX = km / (111.320 * Math.cos((loc.lat * Math.PI)/180));
              const distanceY = km / 110.574;
              for(let i=0;i<points;i++){
                const theta = (i/points)*(2*Math.PI);
                const x = distanceX * Math.cos(theta);
                const y = distanceY * Math.sin(theta);
                circleCoords.push([loc.lng + x, loc.lat + y]);
              }
              circleCoords.push(circleCoords[0]);
              if(map.getSource('circle')) map.getSource('circle').setData({type:'FeatureCollection', features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[circleCoords]}}]});
              else {
                map.addSource('circle', {type:'geojson', data:{type:'FeatureCollection', features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[circleCoords]}}]}});
                map.addLayer({id:'circle', type:'fill', source:'circle', paint:{'fill-color':'#588888','fill-opacity':0.5}});
              }
              map.flyTo({center:[loc.lng, loc.lat], zoom:14});
              window.ReactNativeWebView.postMessage(JSON.stringify({lng:loc.lng, lat:loc.lat, address: place.description}));
            }
          }
        } catch(e){ console.error(e); }
      })();
    `;
    webviewRef.current.injectJavaScript(js);
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Goong Map</title>
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
          style: 'https://tiles.goong.io/assets/goong_satellite.json?api_key=${VITE_GOONG_MAP_KEY}',
          center: [106.660172, 10.762622],
          zoom: 12
        });
        map.addControl(new maplibregl.NavigationControl());

        // Click map
        map.on('click', async (e) => {
          const lngLat = e.lngLat;
          document.querySelectorAll('.maplibregl-marker').forEach(el => el.remove());
          new maplibregl.Marker().setLngLat([lngLat.lng, lngLat.lat]).addTo(map);
          // Vẽ circle
          const circleCoords = [];
          const points = 64;
          const radius = 500;
          const km = radius / 1000;
          const distanceX = km / (111.320 * Math.cos((lngLat.lat * Math.PI)/180));
          const distanceY = km / 110.574;
          for(let i=0;i<points;i++){
            const theta = (i/points)*(2*Math.PI);
            const x = distanceX * Math.cos(theta);
            const y = distanceY * Math.sin(theta);
            circleCoords.push([lngLat.lng + x, lngLat.lat + y]);
          }
          circleCoords.push(circleCoords[0]);
          if(map.getSource('circle')) map.getSource('circle').setData({type:'FeatureCollection', features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[circleCoords]}}]});
          else {
            map.addSource('circle', {type:'geojson', data:{type:'FeatureCollection', features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[circleCoords]}}]}});
            map.addLayer({id:'circle', type:'fill', source:'circle', paint:{'fill-color':'#588888','fill-opacity':0.5}});
          }

          // Reverse geocode
          try{
            const res = await fetch("https://rsapi.goong.io/geocode?api_key=${VITE_GOONG_API_KEY}&latlng=" + lngLat.lat + "," + lngLat.lng);
            const data = await res.json();
            const address = data.results && data.results.length>0 ? data.results[0].formatted_address : '';
            window.ReactNativeWebView.postMessage(JSON.stringify({lng:lngLat.lng, lat:lngLat.lat, address: address}));
          } catch(e){ console.error(e); }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#fff', zIndex: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 8, height: 40, borderRadius: 4 }}
          placeholder="Nhập địa chỉ"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Tìm" onPress={handleSearch} />
      </View>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
};

export default MapScreen;
