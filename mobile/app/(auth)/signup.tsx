/**
 * Signup Screen
 * Phone + details registration with inline OTP verification modal
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
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/Colors";
import { Shadow, Spacing, Radius } from "../../constants/theme";

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

export default function SignupScreen() {
  // ─── Form State ────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ─── New profile fields ────────────────────────────────────────────────────
  const [residenceCity, setResidenceCity] = useState("");
  const [hasOffice, setHasOffice] = useState(false);
  const [officeName, setOfficeName] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");

  // ─── OTP Modal State ───────────────────────────────────────────────────────
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { register, verifyOTP, sendOTP } = useAuthStore();

  // ─── Resend countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!otpModalVisible || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpModalVisible, resendTimer]);

  // ─── Auto-fill dev code & auto-submit ────────────────────────────────────
  useEffect(() => {
    if (devCode && devCode.length === OTP_LENGTH) {
      setOtp(devCode.split(""));
      setTimeout(() => handleVerify(devCode), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devCode]);

  // ─── Focus first box ──────────────────────────────────────────────────────
  useEffect(() => {
    if (otpModalVisible) setTimeout(() => inputRefs.current[0]?.focus(), 350);
  }, [otpModalVisible]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال الاسم الأول والأخير");
      return;
    }
    if (phone.length < 7) {
      Alert.alert("رقم غير صحيح", "يرجى إدخال رقم هاتف صحيح");
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("بريد غير صحيح", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    if (password && password.length < 6) {
      Alert.alert(
        "كلمة مرور ضعيفة",
        "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      );
      return;
    }
    if (hasOffice && !officeName.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال اسم المكتب العقاري");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const result = await register(
        fullPhone,
        firstName.trim(),
        lastName.trim(),
        email.trim() || undefined,
        password || undefined,
        {
          residenceCity: residenceCity.trim() || undefined,
          hasOffice,
          officeName: hasOffice ? officeName.trim() : undefined,
          officeLocation: hasOffice ? officeLocation.trim() : undefined,
        },
      );

      setDevCode(result.devCode);
      setOtp(new Array(OTP_LENGTH).fill(""));
      setResendTimer(60);
      setOtpModalVisible(true);
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل إنشاء الحساب");
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
      const nameParts = [
        firstName.trim(),
        middleName.trim(),
        lastName.trim(),
      ].filter(Boolean);
      const fullName = nameParts.join(" ");
      const success = await verifyOTP(
        fullPhone,
        otpCode,
        fullName,
        email.trim() || undefined,
        password || undefined,
        {
          residenceCity: residenceCity.trim() || undefined,
          hasOffice,
          officeName: hasOffice ? officeName.trim() : undefined,
          officeLocation: hasOffice ? officeLocation.trim() : undefined,
        },
      );
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
        {/* ── Back button ───────────────────────────────────────────── */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

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
        </MotiView>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <MotiView
          from={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>إنشاء حساب ✨</Text>
          <Text style={styles.cardSubtitle}>
            أدخل بياناتك لإنشاء حسابك الجديد
          </Text>

          {/* First + Last name row */}
          <Text style={styles.label}>الاسم الكامل</Text>
          <View style={styles.nameRow}>
            <TextInput
              style={[styles.nameInput, { marginLeft: 8 }]}
              placeholder="الاسم الأول"
              placeholderTextColor={Colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              returnKeyType="next"
            />
            <TextInput
              style={styles.nameInput}
              placeholder="الاسم الأخير"
              placeholderTextColor={Colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="next"
            />
          </View>
          {/* Middle name (optional) */}
          <View style={[styles.fieldRow, { marginTop: 8 }]}>
            <Ionicons
              name="person-outline"
              size={18}
              color={Colors.textMuted}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.fieldInput}
              placeholder="اسم الأب / الجد (اختياري)"
              placeholderTextColor={Colors.textMuted}
              value={middleName}
              onChangeText={setMiddleName}
              returnKeyType="next"
            />
          </View>

          {/* Phone */}
          <Text style={[styles.label, { marginTop: 16 }]}>رقم الهاتف</Text>
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

          {/* Country dropdown */}
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

          {/* Email */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            البريد الإلكتروني (اختياري)
          </Text>
          <View style={styles.fieldRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={Colors.textMuted}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.fieldInput}
              placeholder="example@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            كلمة المرور (اختياري)
          </Text>
          <View style={styles.fieldRow}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={Colors.textMuted}
              style={styles.fieldIcon}
            />
            <TextInput
              style={[styles.fieldInput, { letterSpacing: password ? 2 : 0 }]}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
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

          {/* Register Button */}
          {/* ─── Additional Profile Fields ───────────────────────── */}

          {/* Residence City */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            مدينة الإقامة (اختياري)
          </Text>
          <View style={styles.fieldRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.textMuted}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.fieldInput}
              placeholder="مثال: الرياض، دبي..."
              placeholderTextColor={Colors.textMuted}
              value={residenceCity}
              onChangeText={setResidenceCity}
              returnKeyType="next"
            />
          </View>

          {/* Has Office Toggle */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            هل تمتلك مكتباً عقارياً؟
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, hasOffice && styles.toggleBtnActive]}
              onPress={() => setHasOffice(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  hasOffice && styles.toggleBtnTextActive,
                ]}
              >
                نعم
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !hasOffice && styles.toggleBtnActive]}
              onPress={() => setHasOffice(false)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  !hasOffice && styles.toggleBtnTextActive,
                ]}
              >
                لا
              </Text>
            </TouchableOpacity>
          </View>

          {/* Office details (conditional) */}
          {hasOffice && (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>
                اسم المكتب *
              </Text>
              <View style={styles.fieldRow}>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={Colors.textMuted}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="اسم المكتب العقاري"
                  placeholderTextColor={Colors.textMuted}
                  value={officeName}
                  onChangeText={setOfficeName}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>موقع المكتب</Text>
              <View style={styles.fieldRow}>
                <Ionicons
                  name="map-outline"
                  size={18}
                  color={Colors.textMuted}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="العنوان أو الحي..."
                  placeholderTextColor={Colors.textMuted}
                  value={officeLocation}
                  onChangeText={setOfficeLocation}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>
            </>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#1A85E6", "#0EC6E3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <Text style={styles.submitText}>جاري الإرسال...</Text>
              ) : (
                <>
                  <Text style={styles.submitText}>إنشاء الحساب</Text>
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

          {/* Link to login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.loginLinkText}>
              لديك حساب بالفعل؟{" "}
              <Text style={styles.loginLinkBold}>تسجيل الدخول</Text>
            </Text>
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

          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setOtpModalVisible(false)}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modalContent}>
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

            <Text style={styles.modalTitle}>تحقق من هاتفك</Text>
            <Text style={styles.modalSubtitle}>
              {`أرسلنا رمزًا مكوّنًا من ٦ أرقام إلى\n`}
              <Text style={styles.modalPhone}>{maskedPhone}</Text>
            </Text>

            {/* Dev Code Banner */}
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

            {/* OTP Inputs */}
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

            {/* Verify Button */}
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
                  {isVerifying ? "جاري التحقق..." : "تحقّق وإنشاء الحساب"}
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

            {/* Resend */}
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
    padding: Spacing.base,
    paddingTop: 60,
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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  // ── Logo ──────────────────────────────────────────────────────────────────
  logoContainer: { alignItems: "center", marginBottom: 28 },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  brandName: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  brandAqar: { color: "rgba(255,255,255,0.85)" },
  brandNow: { color: "#0EC6E3" },
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius["3xl"],
    padding: 28,
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 22,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  // ── Name row ──────────────────────────────────────────────────────────────
  nameRow: { flexDirection: "row" },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
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
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
    gap: 4,
  },
  flag: { fontSize: 20 },
  countryCode: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
  // ── Generic field ─────────────────────────────────────────────────────────
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  // ── Submit button ─────────────────────────────────────────────────────────
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 24,
    ...Shadow.md,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // ── Login link ────────────────────────────────────────────────────────────
  loginLink: { marginTop: 16, alignItems: "center" },
  loginLinkText: { fontSize: 13, color: Colors.textMuted },
  loginLinkBold: { color: Colors.primaryLight, fontWeight: "700" },
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
    fontSize: 26,
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
  // ── OTP ───────────────────────────────────────────────────────────────────
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
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
  // ── Verify button ─────────────────────────────────────────────────────────
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
  // ── Office toggle ─────────────────────────────────────────────────────────
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(26,133,230,0.25)",
    borderColor: "#1A85E6",
  },
  toggleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  toggleBtnTextActive: {
    color: "#fff",
  },
});
