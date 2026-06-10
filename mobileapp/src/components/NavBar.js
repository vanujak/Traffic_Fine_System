import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";

export default function NavBar({ currentTab, onTabPress, role }) {
  // Define tabs based on role
  const isOfficer = role === "OFFICER" || role === "ADMIN";

  const tabs = isOfficer
    ? [
        { id: "dashboard", label: "Home", iconActive: "home", iconInactive: "home-outline" },
        { id: "issue", label: "Issue Fine", iconActive: "add-circle", iconInactive: "add-circle-outline" },
        { id: "myfines", label: "My Fines", iconActive: "document-text", iconInactive: "document-text-outline" },
        { id: "profile", label: "Profile", iconActive: "person", iconInactive: "person-outline" },
      ]
    : [
        { id: "dashboard", label: "Home", iconActive: "home", iconInactive: "home-outline" },
        { id: "fines", label: "Pay Fines", iconActive: "card", iconInactive: "card-outline" },
        { id: "profile", label: "Profile", iconActive: "person", iconInactive: "person-outline" },
      ];

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={24}
                color={isActive ? COLORS.accent : COLORS.textLight}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 24,
    height: 64,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textLight,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
