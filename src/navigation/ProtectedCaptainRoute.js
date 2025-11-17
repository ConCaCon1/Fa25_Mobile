import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getRole } from "../auth/authStorage";

const ProtectedCaptainRoute = ({ navigation, children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getRole();
      if (role !== "Captain") {
        navigation.replace("Home");
      } else {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return children;
};

export default ProtectedCaptainRoute;