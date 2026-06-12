import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#1E3A8A",      // Deep navy blue (branding)
  accent: "#2563EB",       // Vibrant blue (buttons, links, highlights)
  accentLight: "#DBEAFE",  // Very light blue tint
  background: "#F5F7FA",   // Cool gray-blue background
  cardBackground: "#FFFFFF",
  textPrimary: "#111827",   // Dark charcoal
  textSecondary: "#4B5563", // Slate gray
  textLight: "#9CA3AF",     // Muted gray
  border: "#E5E7EB",        // Clean border gray
  white: "#FFFFFF",
  success: "#10B981",      // Forest green for paid status
  successLight: "#D1FAE5", // Light green tint
  warning: "#F59E0B",      // Amber for pending status
  warningLight: "#FEF3C7", // Light amber tint
  danger: "#EF4444",       // Red for unpaid/expired fines
  dangerLight: "#FEE2E2",  // Light red tint
  darkGray: "#374151",
};

export const COMMON_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
});
