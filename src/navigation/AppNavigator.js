import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen/SplashScreen";
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
import ShipDetailScreen from "../screens/ShipDetailScreen/ShipDetailScreen";
import CaptainAccount from "../screens/CaptainAccount/CaptainAccount";
import ProtectedCaptainRoute from "./ProtectedCaptainRoute";
import ProductListScreen from "../screens/ProductListScreen/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen/ProductDetailScreen";
import SelectShipScreen from "../screens/SelectShipScreen/SelectShipScreen";
import OrderScreen from "../screens/OrderScreen/OrderScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen/OrderDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen/CheckoutScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen/OrderSuccessScreen";
import OrderFailScreen from "../screens/OrderFailScreen/OrderFailScreen";
import SelectDockSlotScreen from "../screens/SelectDockSlotScreen/SelectDockSlotScreen";
import BookingScreen from "../screens/BookingScreen/BookingScreen";
import SelectShipDockScreen from "../screens/SelectShipDockScreen/SelectShipDockScreen";
import ConfirmBookingScreen from "../screens/ConfirmBookingScreen/ConfirmBookingScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen/BookingDetailScreen";
import CheckoutDockScreen from "../screens/CheckoutDockScreen/CheckoutDockScreen";
import BookingSuccessScreen from "../screens/BookingSuccessScreen/BookingSuccessScreen";
import BookingFailScreen from "../screens/BookingFailScreen/BookingFailScreen";
import EditProfileScreen from "../screens/EditProfileScreen/EditProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
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
        <Stack.Screen name="AddCaptainScreen" component={AddCaptainScreen} />
        <Stack.Screen name="ShipDetailScreen" component={ShipDetailScreen} />
        <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
        <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
        <Stack.Screen name="SelectShipScreen" component={SelectShipScreen} />
        <Stack.Screen name="OrderScreen" component={OrderScreen} />
        <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
        <Stack.Screen name="OrderFailScreen" component={OrderFailScreen} />
        <Stack.Screen name="SelectDockSlotScreen" component={SelectDockSlotScreen} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="SelectShipDockScreen" component={SelectShipDockScreen} />
        <Stack.Screen name="ConfirmBookingScreen" component={ConfirmBookingScreen} />
        <Stack.Screen name="BookingDetailScreen" component={BookingDetailScreen} />
        <Stack.Screen name="CheckoutDockScreen" component={CheckoutDockScreen} />
        <Stack.Screen name="BookingSuccessScreen" component={BookingSuccessScreen} />
        <Stack.Screen name="BookingFailScreen" component={BookingFailScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen
          name="CaptainAccount"
          children={(props) => (
            <ProtectedCaptainRoute navigation={props.navigation}>
              <CaptainAccount {...props} />
            </ProtectedCaptainRoute>
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}