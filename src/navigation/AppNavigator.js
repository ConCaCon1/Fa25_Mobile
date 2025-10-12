import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import OTPScreen from "../screens/OTPScreen/OTPScreen";
import GoogleTestScreen from "../screens/GoogleTestScreen/GoogleTestScreen";
import MapScreen from "../screens/MapScreen/MapScreen";


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
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
