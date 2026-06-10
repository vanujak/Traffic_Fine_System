import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, COMMON_STYLES } from "../theme";
import { API_BASE_URL } from "../config";

export default function DashboardScreen({ user, token, onNavigateToTab, onSearchReference }) {
  const isOfficer = user?.role === "OFFICER" || user?.role === "ADMIN";
  const [refNo, setRefNo] = useState("");
  const [searching, setSearching] = useState(false);
  const [stats, setStats] = useState({
    totalCount: 0,
    unpaidCount: 0,
    paidCount: 0,
    totalAmount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOfficer) {
      fetchOfficerStats();
    } else {
      fetchMotoristStats();
    }
  }, []);

  const fetchMotoristStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fines/motorist/my-fines`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        const fines = resData.data || [];
        let unpaid = 0;
        let paid = 0;
        let totalAmt = 0;
        fines.forEach((f) => {
          if (f.status === "PAID") {
            paid++;
          } else if (f.status === "PENDING") {
            unpaid++;
          }
          totalAmt += f.category?.amount || 0;
        });

        setStats({
          totalCount: fines.length,
          unpaidCount: unpaid,
          paidCount: paid,
          totalAmount: totalAmt,
        });
      }
    } catch (err) {
      console.log("Error fetching motorist stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchOfficerStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fines/officer/my-fines`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        const fines = resData.data || [];
        let unpaid = 0;
        let paid = 0;
        let totalAmt = 0;
        fines.forEach((f) => {
          if (f.status === "PAID") {
            paid++;
          } else if (f.status === "PENDING") {
            unpaid++;
          }
          totalAmt += f.category?.amount || 0;
        });

        setStats({
          totalCount: fines.length,
          unpaidCount: unpaid,
          paidCount: paid,
          totalAmount: totalAmt,
        });
      }
    } catch (err) {
      console.log("Error fetching officer stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearchRef = async () => {
    if (!refNo.trim()) {
      Alert.alert("Error", "Please enter a reference number");
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fines/${refNo.trim()}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        // Switch to Fines screen and pass searched fine details
        onSearchReference(resData.data);
      } else {
        Alert.alert("Not Found", "No traffic fine found with this reference number.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to contact server. Please check your connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <ScrollView style={COMMON_STYLES.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || "MOTORIST"}</Text>
        </View>
      </View>

      {/* Info Status Card */}
      {!isOfficer && (
        <View style={[styles.bannerCard, { backgroundColor: stats.unpaidCount > 0 ? COLORS.dangerLight : COLORS.successLight }]}>
          <Ionicons
            name={stats.unpaidCount > 0 ? "warning" : "checkmark-circle"}
            size={28}
            color={stats.unpaidCount > 0 ? COLORS.danger : COLORS.success}
          />
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: stats.unpaidCount > 0 ? COLORS.danger : COLORS.success }]}>
              {stats.unpaidCount > 0 ? "Pending Fines Found" : "Driving Record Clear"}
            </Text>
            <Text style={styles.bannerSub}>
              {stats.unpaidCount > 0
                ? `You have ${stats.unpaidCount} unpaid ticket(s). Pay now to avoid court action.`
                : "No outstanding violations matching your license profile."}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Cards Section */}
      <Text style={styles.sectionTitle}>{isOfficer ? "Performance Metrics" : "Fines Overview"}</Text>
      {loadingStats ? (
        <ActivityIndicator color={COLORS.accent} style={{ margin: 20 }} />
      ) : (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statVal}>{stats.totalCount}</Text>
            <Text style={styles.statLbl}>{isOfficer ? "Fines Issued" : "Total Fines"}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
            <Text style={[styles.statVal, { color: COLORS.warning }]}>{stats.unpaidCount}</Text>
            <Text style={styles.statLbl}>Unpaid</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{stats.paidCount}</Text>
            <Text style={styles.statLbl}>Paid</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.accent }]}>
            <Text style={styles.statVal}>
              LKR {stats.totalAmount.toLocaleString()}
            </Text>
            <Text style={styles.statLbl}>{isOfficer ? "Value Issued" : "Total Fined"}</Text>
          </View>
        </View>
      )}

      {/* Action Sections */}
      {isOfficer ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Road Safety Operations</Text>
          <Text style={styles.actionSub}>Issue a violation notice immediately on the spot.</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigateToTab("issue")}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Issue New Fine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Ticket Quick Pay</Text>
          <Text style={styles.actionSub}>Enter your fine reference number to pay online instantly.</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. TF-20260610-XYZAB"
              placeholderTextColor={COLORS.textLight}
              value={refNo}
              onChangeText={setRefNo}
              autoCapitalize="characters"
              disabled={searching}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchRef}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="search" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Safety Tips Card */}
      <View style={styles.tipsCard}>
        <View style={COMMON_STYLES.row}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.tipsTitle}>Driving Guidelines</Text>
        </View>
        <Text style={styles.tipsText}>
          Always keep your driver's license and vehicle registration document in your possession. Ensure your vehicle insurance policy is current and valid.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 12,
  },
  bannerCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 25,
    alignItems: "center",
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statLbl: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: "500",
  },
  actionCard: {
    ...COMMON_STYLES.card,
    padding: 20,
    marginBottom: 25,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 6,
  },
  actionSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  actionButton: {
    ...COMMON_STYLES.button,
    flexDirection: "row",
    marginTop: 0,
    height: 48,
  },
  actionButtonText: {
    ...COMMON_STYLES.buttonText,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    height: 48,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  searchButton: {
    backgroundColor: COLORS.accent,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  tipsCard: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
});
