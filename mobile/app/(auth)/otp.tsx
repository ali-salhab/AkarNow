/**
 * OTP Verification Screen
 * 6-digit OTP input with auto-focus, auto-submit, and resend timer
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
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/Colors";
import { Shadow, Radius, Spacing } from "../../constants/theme";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { phone, devCode } = useLocalSearchParams<{
    phone: string;
    devCode?: string;
  }>();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { verifyOTP, sendOTP } = useAuthStore();

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auto-fill dev OTP in development
  useEffect(() => {
    if (devCode && devCode.length === 6) {
      const digits = devCode.split("");
      setOtp(digits);
    }
  }, [devCode]);

  const handleOTPChange = (value: string, index: number) => {
    // Handle paste
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
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d !== "") && digit) {
      handleVerify(newOtp.join(""));
    }
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
      Alert.alert("Incomplete Code", "Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyOTP(phone, otpCode);

      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Invalid Code",
          "The verification code you entered is incorrect.",
        );
        // Clear OTP
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      Alert.alert("Error", "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    try {
      await sendOTP(phone);
      Alert.alert("Sent!", "A new code has been sent to your phone.");
    } catch {
      Alert.alert("Error", "Failed to resend. Please try again.");
    }
  };

  const maskedPhone = phone
    ? phone.replace(/(\+\d{3,4})\d{3}(\d{4})/, "$1 *** $2")
    : "";

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

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.iconContainer}
        >
          <LinearGradient
            colors={["#1A85E6", "#0EC6E3"]}
            style={styles.iconGradient}
          >
            <Ionicons name="phone-portrait" size={40} color="#fff" />
          </LinearGradient>
        </MotiView>

        <MotiText
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.title}
        >
          Verify Your Number
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.subtitle}
        >
          We sent a 6-digit code to{"\n"}
          <Text style={styles.phone}>{maskedPhone}</Text>
        </MotiText>

        {/* Dev hint */}
        {devCode ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.devHint}
          >
            <Text style={styles.devHintText}>🛠 Dev code: {devCode}</Text>
          </MotiView>
        ) : null}

        {/* OTP Inputs */}
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 350 }}
          style={styles.otpContainer}
        >
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleOTPChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
              caretHidden
            />
          ))}
        </MotiView>

        {/* Verify Button */}
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 450 }}
          style={{ width: "100%" }}
        >
          <TouchableOpacity
            style={[styles.verifyBtn, isLoading && styles.verifyBtnDisabled]}
            onPress={() => handleVerify()}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={
                isLoading ? ["#94A3B8", "#94A3B8"] : ["#1A85E6", "#0EC6E3"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyGradient}
            >
              <Text style={styles.verifyText}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
              {!isLoading && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        {/* Resend */}
        <TouchableOpacity
          onPress={handleResend}
          style={styles.resendBtn}
          disabled={resendTimer > 0}
        >
          <Text style={styles.resendText}>
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Didn't receive code? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(14,198,227,0.12)",
    bottom: 50,
    right: -80,
  },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconContainer: {
    marginBottom: 28,
    ...Shadow.lg,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  phone: {
    color: "#0EC6E3",
    fontWeight: "700",
  },
  devHint: {
    backgroundColor: "rgba(255,193,7,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.4)",
  },
  devHintText: {
    color: "#FFC107",
    fontSize: 12,
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
    marginTop: 12,
  },
  otpBox: {
    width: 48,
    height: 60,
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
  verifyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    ...Shadow.md,
  },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  verifyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resendBtn: {
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
});
