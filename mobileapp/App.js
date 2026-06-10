import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View, Platform } from "react-native";
import LoginComponent from "./src/components/loginComponent";
import SignupComponent from "./src/components/signupComponent";
import DashboardScreen from "./src/components/DashboardScreen";
import FinesScreen from "./src/components/FinesScreen";
import IssueFineScreen from "./src/components/IssueFineScreen";
import ProfileScreen from "./src/components/ProfileScreen";
import NavBar from "./src/components/NavBar";
import { COLORS } from "./src/theme";

export default function App() {
  const [screen, setScreen] = useState("login"); // 'login' | 'signup' | 'app'
  const [currentTab, setCurrentTab] = useState("dashboard"); // 'dashboard' | 'fines' | 'issue' | 'myfines' | 'profile'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [searchedFineFromDashboard, setSearchedFineFromDashboard] = useState(null);

  // Authentication Handlers
  const handleLoginSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setScreen("app");
    setCurrentTab("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setScreen("login");
    setCurrentTab("dashboard");
  };

  const handleSearchReferenceFromDashboard = (fineData) => {
    setSearchedFineFromDashboard(fineData);
    // Navigate to respective fine tab depending on role
    const isOfficer = user?.role === "OFFICER" || user?.role === "ADMIN";
    setCurrentTab(isOfficer ? "myfines" : "fines");
  };

  // Render Screens based on active tab in 'app' state
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardScreen
            user={user}
            token={token}
            onNavigateToTab={(tabId) => setCurrentTab(tabId)}
            onSearchReference={handleSearchReferenceFromDashboard}
          />
        );
      case "fines":
      case "myfines":
        return (
          <FinesScreen
            user={user}
            token={token}
            initialSearchedFine={searchedFineFromDashboard}
            onClearInitialFine={() => setSearchedFineFromDashboard(null)}
          />
        );
      case "issue":
        return (
          <IssueFineScreen
            token={token}
            onFineIssued={() => {
              // Redirect back to dashboard or officer fines list
              setCurrentTab("myfines");
            }}
          />
        );
      case "profile":
        return <ProfileScreen user={user} token={token} onLogout={handleLogout} />;
      default:
        return (
          <DashboardScreen
            user={user}
            token={token}
            onNavigateToTab={(tabId) => setCurrentTab(tabId)}
            onSearchReference={handleSearchReferenceFromDashboard}
          />
        );
    }
  };

  // Main navigation switcher
  if (screen === "signup") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <SignupComponent onLoginPress={() => setScreen("login")} />
      </SafeAreaView>
    );
  }

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LoginComponent
          onRegisterPress={() => setScreen("signup")}
          onLoginSuccess={handleLoginSuccess}
        />
      </SafeAreaView>
    );
  }

  // Logged-in application state
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.appContainer}>
        {/* Render active tab screen */}
        <View style={styles.mainContent}>{renderTabContent()}</View>

        {/* Dynamic bottom navigation bar */}
        <NavBar
          currentTab={currentTab}
          onTabPress={(tabId) => {
            // Clear search buffer when changing tabs manually
            setSearchedFineFromDashboard(null);
            setCurrentTab(tabId);
          }}
          role={user?.role}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  appContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
  },
});
