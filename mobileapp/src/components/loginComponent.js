import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "../config";
import { COLORS, COMMON_STYLES } from "../theme";

export default function LoginComponent({ onRegisterPress, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Login failed");
      }

      console.log("Auth user:", payload.data.user);
      console.log("Access token:", payload.data.accessToken);

      // Call the success callback passed from App.js to trigger redirect
      if (onLoginSuccess) {
        onLoginSuccess(payload.data.user, payload.data.accessToken);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Traffic Fine System</Text>
        <Text style={styles.subtitle}>Sign in to access your dashboard</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="email@example.com"
          placeholderTextColor={COLORS.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          disabled={loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Enter your password"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          disabled={loading}
        />

        <TouchableOpacity
          style={[COMMON_STYLES.button, loading && COMMON_STYLES.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={COMMON_STYLES.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerBtn} onPress={onRegisterPress} disabled={loading}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink}>Register here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    ...COMMON_STYLES.card,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    ...COMMON_STYLES.title,
    color: COLORS.primary,
  },
  subtitle: {
    ...COMMON_STYLES.subtitle,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  forgotBtn: {
    marginTop: 15,
    alignSelf: "center",
  },
  forgotText: {
    color: COLORS.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  registerBtn: {
    marginTop: 25,
    alignSelf: "center",
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  registerLink: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
