/**
 * Login Screen
 * Phone + Password login with inline OTP verification modal
 */

import React, { useState, useRef, useEffect } from "react";
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
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/Colors";
import { Shadow, Spacing, Radius } from "../../constants/theme";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 6;

const COUNTRY_CODES = [
  { code: "+966", flag: "🇸🇦", name: "السعودية" },
  { code: "+971", flag: "🇦🇪", name: "الإمارات" },
  { code: "+965", flag: "🇰🇼", name: "الكويت" },
  { code: "+974", flag: "🇶🇦", name: "قطر" },
  { code: "+973", flag: "🇧🇭", name: "البحرين" },
  { code: "+968", flag: "🇴🇲", name: "عُمان" },
  { code: "+20", flag: "🇪🇬", name: "مصر" },
];

export default function LoginScreen() {
  // ─── Form State ────────────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ─── OTP Modal State ───────────────────────────────────────────────────────
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { login, verifyOTP, sendOTP, devLogin } = useAuthStore();

  // ─── Resend countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!otpModalVisible || resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [otpModalVisible, resendTimer]);

  // ─── Auto-fill dev code & auto-submit ────────────────────────────────────
  useEffect(() => {
    if (devCode && devCode.length === OTP_LENGTH) {
      setOtp(devCode.split(""));
      setTimeout(() => handleVerify(devCode), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devCode]);

  // ─── Focus first OTP box when modal opens ─────────────────────────────────
  useEffect(() => {
    if (otpModalVisible) {
      setTimeout(() => inputRefs.current[0]?.focus(), 350);
    }
  }, [otpModalVisible]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (phone.length < 7) {
      Alert.alert("رقم غير صحيح", "يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const result = await login(fullPhone, password || undefined);

      setDevCode(result.devCode);
      setOtp(new Array(OTP_LENGTH).fill(""));
      setResendTimer(60);
      setOtpModalVisible(true);
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) {
      const digits = value
        .replace(/[^0-9]/g, "")
        .slice(0, OTP_LENGTH)
        .split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      inputRefs.current[
        Math.min(index + digits.length, OTP_LENGTH - 1)
      ]?.focus();
      return;
    }
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "") && digit) handleVerify(newOtp.join(""));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length < OTP_LENGTH) {
      Alert.alert("الرمز غير مكتمل", "يرجى إدخال الأرقام الستة كاملة");
      return;
    }
    setIsVerifying(true);
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const success = await verifyOTP(fullPhone, otpCode);
      if (success) {
        setOtpModalVisible(false);
        router.replace("/(tabs)");
      } else {
        Alert.alert("رمز غير صحيح", "الرمز الذي أدخلته غير صحيح.");
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      Alert.alert("خطأ", "فشل التحقق. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const result = await sendOTP(fullPhone);
      setDevCode(result.devCode);
      setOtp(new Array(OTP_LENGTH).fill(""));
      Alert.alert("تم الإرسال!", "تم إرسال رمز جديد إلى هاتفك.");
    } catch {
      Alert.alert("خطأ", "فشل إعادة الإرسال.");
    }
  };

  const maskedPhone = `${selectedCountry.code} *** ${phone.slice(-4)}`;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0F172A", "#1A3C6E"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo ──────────────────────────────────────────────────── */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.logoContainer}
        >
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>
            <Text style={styles.brandAqar}>Aqar</Text>
            <Text style={styles.brandNow}>Now</Text>
          </Text>
          <Text style={styles.brandTagline}>بوابتك لعقارات الفاخرة</Text>
        </MotiView>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <MotiView
          from={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>تسجيل الدخول 👋</Text>
          <Text style={styles.cardSubtitle}>أدخل بياناتك للمتابعة</Text>

          {/* Phone Label */}
          <Text style={styles.label}>رقم الهاتف</Text>

          {/* Phone Row */}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setShowCountryPicker((v) => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="5X XXX XXXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
              maxLength={10}
              returnKeyType="next"
            />
          </View>

          {/* Country Picker Dropdown */}
          {showCountryPicker && (
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.dropdown}
            >
              {COUNTRY_CODES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.dropdownItem,
                    selectedCountry.code === c.code &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCountry(c);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text style={styles.dropdownName}>{c.name}</Text>
                  <Text style={styles.dropdownCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </MotiView>
          )}

          {/* Password Label */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            كلمة المرور (اختياري)
          </Text>

          {/* Password Input */}
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#1A85E6", "#0EC6E3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {isLoading ? (
                <Text style={styles.loginText}>جاري الإرسال...</Text>
              ) : (
                <>
                  <Text style={styles.loginText}>تسجيل الدخول</Text>
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
            بالمتابعة، أنت توافق على{" "}
            <Text style={styles.link}>شروط الخدمة</Text> و{" "}
            <Text style={styles.link}>سياسة الخصوصية</Text>
          </Text>

          {/* Link to signup */}
          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.signupLinkText}>
              ليس لديك حساب؟{" "}
              <Text style={styles.signupLinkBold}>إنشاء حساب جديد</Text>
            </Text>
          </TouchableOpacity>

          {/* DEV MODE BYPASS */}
          <TouchableOpacity
            style={styles.devBypassBtn}
            onPress={async () => {
              await devLogin();
              router.replace("/(tabs)");
            }}
          >
            <Text style={styles.devBypassText}>🛠 دخول تجريبي بدون سيرفر</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════
          OTP Verification Modal
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={otpModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#0F172A", "#1A3C6E"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalBlob} />

          {/* Close */}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setOtpModalVisible(false)}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            {/* Icon */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              style={styles.modalIconWrap}
            >
              <LinearGradient
                colors={["#1A85E6", "#0EC6E3"]}
                style={styles.modalIconGradient}
              >
                <Ionicons name="shield-checkmark" size={38} color="#fff" />
              </LinearGradient>
            </MotiView>

            <Text style={styles.modalTitle}>رمز التحقق</Text>
            <Text style={styles.modalSubtitle}>
              {`أرسلنا رمزًا مكوّنًا من ٦ أرقام إلى\n`}
              <Text style={styles.modalPhone}>{maskedPhone}</Text>
            </Text>

            {/* ── Dev Code Banner ──────────────────────────────────── */}
            {devCode ? (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.devBanner}
              >
                <View style={styles.devBannerRow}>
                  <Text style={styles.devBannerIcon}>🛠</Text>
                  <Text style={styles.devBannerLabel}>
                    وضع التطوير — الرمز:
                  </Text>
                </View>
                <Text style={styles.devBannerCode}>{devCode}</Text>
              </MotiView>
            ) : null}

            {/* ── OTP Inputs ───────────────────────────────────────── */}
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(r) => (inputRefs.current[idx] = r)}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={(t) => handleOTPChange(t, idx)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, idx)
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  caretHidden
                />
              ))}
            </View>

            {/* ── Verify Button ────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.verifyBtn, isVerifying && { opacity: 0.7 }]}
              onPress={() => handleVerify()}
              activeOpacity={0.85}
              disabled={isVerifying}
            >
              <LinearGradient
                colors={
                  isVerifying ? ["#94A3B8", "#94A3B8"] : ["#1A85E6", "#0EC6E3"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyGradient}
              >
                <Text style={styles.verifyText}>
                  {isVerifying ? "جاري التحقق..." : "تحقّق"}
                </Text>
                {!isVerifying && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Resend ───────────────────────────────────────────── */}
            <TouchableOpacity
              onPress={handleResend}
              style={styles.resendBtn}
              disabled={resendTimer > 0}
            >
              <Text
                style={[
                  styles.resendText,
                  resendTimer === 0 && styles.resendTextActive,
                ]}
              >
                {resendTimer > 0
                  ? `إعادة الإرسال خلال ${resendTimer}ث`
                  : "لم تستلم الرمز؟ إعادة الإرسال"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // ── Logo ──────────────────────────────────────────────────────────────────
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  brandName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  brandAqar: { color: "rgba(255,255,255,0.85)" },
  brandNow: { color: "#0EC6E3" },
  brandTagline: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 },
  // ── Card ──────────────────────────────────────────────────────────────────
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
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  // ── Phone ─────────────────────────────────────────────────────────────────
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
    gap: 4,
  },
  flag: { fontSize: 20 },
  countryCode: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
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
    marginTop: 6,
    marginBottom: 4,
    overflow: "hidden",
    ...Shadow.md,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  dropdownItemActive: { backgroundColor: Colors.surfaceAlt },
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
  // ── Password ──────────────────────────────────────────────────────────────
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    paddingVertical: 16,
    letterSpacing: 2,
  },
  eyeBtn: { padding: 4 },
  // ── Login Button ──────────────────────────────────────────────────────────
  loginBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 24,
    ...Shadow.md,
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  link: { color: Colors.primaryLight, fontWeight: "600" },
  signupLink: { marginTop: 12, alignItems: "center" },
  signupLinkText: { fontSize: 13, color: Colors.textMuted },
  signupLinkBold: { color: Colors.primaryLight, fontWeight: "700" },
  devBypassBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,193,7,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.35)",
    alignItems: "center",
  },
  devBypassText: { fontSize: 12, color: "#F59E0B", fontWeight: "700" },
  // ── Modal ─────────────────────────────────────────────────────────────────
  modalContainer: { flex: 1 },
  modalBlob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(14,198,227,0.1)",
    bottom: 40,
    right: -80,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalIconWrap: { marginBottom: 24, ...Shadow.lg },
  modalIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  modalPhone: { color: "#0EC6E3", fontWeight: "700" },
  // ── Dev Banner ────────────────────────────────────────────────────────────
  devBanner: {
    backgroundColor: "rgba(255,193,7,0.12)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,193,7,0.4)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 24,
    alignItems: "center",
    width: "100%",
  },
  devBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  devBannerIcon: { fontSize: 16 },
  devBannerLabel: {
    fontSize: 12,
    color: "rgba(255,193,7,0.85)",
    fontWeight: "600",
  },
  devBannerCode: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFC107",
    letterSpacing: 8,
  },
  // ── OTP Input ─────────────────────────────────────────────────────────────
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  otpBox: {
    width: 46,
    height: 58,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  otpBoxFilled: {
    borderColor: "#0EC6E3",
    backgroundColor: "rgba(14,198,227,0.15)",
  },
  // ── Verify Button ─────────────────────────────────────────────────────────
  verifyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    ...Shadow.md,
  },
  verifyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  verifyText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // ── Resend ────────────────────────────────────────────────────────────────
  resendBtn: { marginTop: 18, paddingVertical: 8 },
  resendText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    textAlign: "center",
  },
  resendTextActive: { color: "#0EC6E3", fontWeight: "600" },
});
