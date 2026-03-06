/**
 * Onboarding Screen
 * 3 slides with Moti animations, horizontal swipe, animated dots
 */

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/Colors";
import { Shadow } from "../constants/theme";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Find Your Dream\nHome",
    titleAr: "اعثر على منزل\nأحلامك",
    subtitle:
      "Discover thousands of verified properties for rent and sale across the Middle East.",
    subtitleAr:
      "اكتشف آلاف العقارات الموثوقة للإيجار والبيع في جميع أنحاء الشرق الأوسط.",
    icon: "home",
    color: "#1A3C6E",
    accentColor: "#1A85E6",
  },
  {
    id: "2",
    title: "Smart Search &\nFilters",
    titleAr: "بحث ذكي\nوتصفية متقدمة",
    subtitle:
      "Filter by city, type, price, view, and more. Find exactly what you need in seconds.",
    subtitleAr:
      "صفّح حسب المدينة والنوع والسعر والإطلالة والمزيد. اعثر على ما تريد في ثوانٍ.",
    icon: "search",
    color: "#0F4C81",
    accentColor: "#0EC6E3",
  },
  {
    id: "3",
    title: "Connect Directly\nWith Agents",
    titleAr: "تواصل مباشرة\nmع الوكلاء",
    subtitle:
      "Chat via WhatsApp, call, or book a visit. Real estate simplified.",
    subtitleAr: "تحدث عبر واتساب أو اتصل أو احجز زيارة. العقارات أصبحت أسهل.",
    icon: "chatbubbles",
    color: "#1A3C6E",
    accentColor: "#22C55E",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatlistRef = useRef<FlatList>(null);
  const { setOnboarded } = useAuthStore();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatlistRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await setOnboarded();
    router.replace("/(auth)/login");
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: (typeof slides)[0];
    index: number;
  }) => (
    <View style={[styles.slide, { width }]}>
      <LinearGradient
        colors={[item.color, item.accentColor, "#0EC6E3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Circles */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ type: "timing", duration: 800, delay: index * 100 }}
        style={styles.decorCircleLarge}
      />
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ type: "timing", duration: 1000, delay: index * 150 }}
        style={styles.decorCircleSmall}
      />

      {/* Icon Illustration */}
      <MotiView
        from={{ scale: 0, opacity: 0, rotate: "-20deg" }}
        animate={{ scale: 1, opacity: 1, rotate: "0deg" }}
        transition={{ type: "spring", delay: 200 }}
        style={styles.iconContainer}
      >
        <View style={styles.iconInner}>
          <Ionicons name={item.icon as any} size={80} color="#fff" />
        </View>
        {/* Orbital rings */}
        <MotiView
          from={{ rotate: "0deg" }}
          animate={{ rotate: "360deg" }}
          transition={{ type: "timing", duration: 8000, loop: true }}
          style={styles.orbit}
        />
      </MotiView>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <MotiText
          from={{ translateY: 30, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
          style={styles.title}
        >
          {item.titleAr}
        </MotiText>

        <MotiText
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 450 }}
          style={styles.subtitle}
        >
          {item.subtitleAr}
        </MotiText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Pagination Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <MotiView
              key={i}
              animate={{
                width: i === currentIndex ? 28 : 8,
                opacity: i === currentIndex ? 1 : 0.4,
              }}
              transition={{ type: "spring", damping: 15 }}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
            <Text style={styles.skipText}>تخطّي</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#1A85E6", "#0EC6E3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? "ابدأ الآن" : "التالي"}
              </Text>
              <Ionicons
                name={
                  currentIndex === slides.length - 1
                    ? "rocket"
                    : "arrow-forward"
                }
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A3C6E",
  },
  slide: {
    flex: 1,
    height,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  decorCircleLarge: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    borderWidth: 2,
    borderColor: "#fff",
    top: -width * 0.3,
    right: -width * 0.3,
  },
  decorCircleSmall: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1.5,
    borderColor: "#fff",
    bottom: height * 0.2,
    left: -width * 0.15,
  },
  iconContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    ...Shadow.lg,
  },
  orbit: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  textContainer: {
    paddingHorizontal: 36,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "500",
  },
  nextBtn: {
    borderRadius: 30,
    overflow: "hidden",
    ...Shadow.md,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
