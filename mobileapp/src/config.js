import { Platform } from "react-native";

// In Expo Go:
// - Android Emulator uses 10.0.2.2 to access localhost
// - iOS Simulator uses localhost
// - Web uses localhost
// - Real devices need the computer's local network IP (e.g. 192.168.x.x). We fallback to localhost, but allow setting it.
const getApiHost = () => {
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
  return "localhost";
};

export const API_HOST = getApiHost();
export const API_BASE_URL = `http://${API_HOST}:5000/api/v1`;
