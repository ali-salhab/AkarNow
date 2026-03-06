/**
 * In-App Animated Splash Screen
 * Shown while auth state loads from storage
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function AppSplash() {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const blobScale1 = useRef(new Animated.Value(0.6)).current;
  const blobScale2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Blob pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobScale1, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(blobScale1, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blobScale2, {
          toValue: 1.1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(blobScale2, {
          toValue: 0.85,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1A3C6E", "#0F172A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs */}
      <Animated.View
        style={[styles.blob1, { transform: [{ scale: blobScale1 }] }]}
      />
      <Animated.View
        style={[styles.blob2, { transform: [{ scale: blobScale2 }] }]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("../assets/images/adaptive-icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Brand name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
        <Text style={styles.brandName}>
          <Text style={styles.brandAqar}>Aqar</Text>
          <Text style={styles.brandNow}>Now</Text>
        </Text>
        <Text style={styles.tagline}>بوابتك لعقارات الفاخرة</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        {[0, 1, 2].map((i) => (
          <LoadingDot key={i} delay={i * 200} />
        ))}
      </Animated.View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  blob1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(26,133,230,0.18)",
    top: height * 0.05,
    right: -80,
  },
  blob2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(14,198,227,0.12)",
    bottom: height * 0.1,
    left: -60,
  },
  logoWrap: {
    width: 170,
    height: 170,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1.5,
    borderColor: "rgba(14,198,227,0.3)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  brandName: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  brandAqar: { color: "rgba(255,255,255,0.85)" },
  brandNow: { color: "#0EC6E3" },
  tagline: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0EC6E3",
  },
});
