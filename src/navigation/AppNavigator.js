import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import OTPScreen from "../screens/OTPScreen/OTPScreen";
import GoogleTestScreen from "../screens/GoogleTestScreen/GoogleTestScreen";
import MapScreen from "../screens/MapScreen/MapScreen";
import AccountScreen from "../screens/AccountScreen/AccountScreen";
import HistoryScreen from "../screens/HistoryScreen.js/HistoryScreen";
import NotificationScreen from "../screens/NotificationScreen/NotificationScreen";
import BoatyardDetailsScreen from "../screens/BoatyardDetailsScreen/BoatyardDetailsScreen";
import ShipMapScreen from "../screens/ShipMapScreen/ShipMapScreen";
import AddShipScreen from "../screens/AddShipScreen/AddShipScreen";
import BoatyardsListScreen from "../screens/BoatyardsListScreen/BoatyardsListScreen";
import SupplierListScreen from "../screens/SupplierListScreen/SupplierListScreen";
import SupplierDetailScreen from "../screens/SupplierDetailScreen/SupplierDetailScreen";
import AddCaptainScreen from "../screens/AddCaptainScreen/AddCaptainScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="GoogleTest" component={GoogleTestScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="BoatyardDetail" component={BoatyardDetailsScreen} />
        <Stack.Screen name="ShipMapScreen" component={ShipMapScreen} />
        <Stack.Screen name="AddShipScreen" component={AddShipScreen} />
        <Stack.Screen name="BoatyardsList" component={BoatyardsListScreen} />
        <Stack.Screen name="SupplierList" component={SupplierListScreen} />
        <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} />
        <Stack.Screen name ="AddCaptainScreen" component={AddCaptainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
