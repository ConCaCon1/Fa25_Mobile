import { View, Text, Button } from 'react-native'
import React, { useEffect } from 'react'
import { getRole } from '../../auth/authStorage'

const CaptainAccount = ({ navigation }) => {
  useEffect(() => {
    const checkRole = async () => {
      const role = await getRole();
      if (role !== "Captain") {
        navigation.replace("Home");
      }
    };
    checkRole();
  }, []);


  return (
    <View>
      <Text>CaptainAccount</Text>
      <Button title="Go to Home" onPress={() => navigation.replace("Home")} />
    </View>
  )
}

export default CaptainAccount