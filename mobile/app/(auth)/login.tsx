/**
 * Login Screen
 * Phone number input with country code selector
 * Middle East focused (+966, +971, etc.)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/Colors";
import { Shadow, Spacing, Radius } from "../../constants/theme";

const COUNTRY_CODES = [
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", short: "SA" },
  { code: "+971", flag: "🇦🇪", name: "UAE", short: "AE" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait", short: "KW" },
  { code: "+974", flag: "🇶🇦", name: "Qatar", short: "QA" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain", short: "BH" },
  { code: "+968", flag: "🇴🇲", name: "Oman", short: "OM" },
  { code: "+20", flag: "🇪🇬", name: "Egypt", short: "EG" },
];

export default function LoginScreen() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sendOTP } = useAuthStore();

  const handleSendOTP = async () => {
    if (phone.length < 9) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const result = await sendOTP(fullPhone);

      router.push({
        pathname: "/(auth)/otp",
        params: {
          phone: fullPhone,
          devCode: result.devCode || "",
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={["#0F172A", "#1A3C6E"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blur circles */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.logoContainer}
        >
          <View style={styles.logoBox}>
            <Ionicons name="home" size={42} color="#fff" />
          </View>
          <Text style={styles.brandName}>
            <Text style={styles.brandAqar}>Aqar</Text>
            <Text style={styles.brandNow}>Now</Text>
          </Text>
          <Text style={styles.brandTagline}>
            Your Gateway to Premium Real Estate
          </Text>
        </MotiView>

        {/* Card */}
        <MotiView
          from={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSubtitle}>
            Enter your phone number to continue
          </Text>

          {/* Phone Input */}
          <View style={styles.inputLabel}>
            <Text style={styles.label}>Phone Number</Text>
          </View>

          <View style={styles.phoneRow}>
            {/* Country Code Picker */}
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              activeOpacity={0.8}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="5X XXX XXXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
          </View>

          {/* Country Picker Dropdown */}
          {showCountryPicker && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              style={styles.dropdown}
            >
              {COUNTRY_CODES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.dropdownItem,
                    selectedCountry.code === country.code &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.flag}>{country.flag}</Text>
                  <Text style={styles.dropdownName}>{country.name}</Text>
                  <Text style={styles.dropdownCode}>{country.code}</Text>
                </TouchableOpacity>
              ))}
            </MotiView>
          )}

          {/* Send OTP Button */}
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendOTP}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#1A85E6", "#0EC6E3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendGradient}
            >
              {isLoading ? (
                <Text style={styles.sendText}>Sending...</Text>
              ) : (
                <>
                  <Text style={styles.sendText}>Send Verification Code</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.base,
    paddingTop: 80,
    paddingBottom: 40,
  },
  blob1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(26,133,230,0.2)",
    top: -80,
    right: -80,
  },
  blob2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(14,198,227,0.15)",
    bottom: 100,
    left: -60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    ...Shadow.md,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandAqar: {
    color: "rgba(255,255,255,0.85)",
  },
  brandNow: {
    color: "#0EC6E3",
  },
  brandTagline: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius["3xl"],
    padding: 28,
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },
  inputLabel: { marginBottom: 8 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
    gap: 4,
  },
  flag: { fontSize: 20 },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 16,
    letterSpacing: 1,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
    ...Shadow.md,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  dropdownItemActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  dropdownName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  dropdownCode: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  sendBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
    ...Shadow.md,
  },
  sendGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  sendText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  link: {
    color: Colors.primaryLight,
    fontWeight: "600",
  },
});
