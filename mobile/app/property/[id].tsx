/**
 * Property Details Screen
 * Full-screen image slider, collapsible header with blur effect,
 * comprehensive property info, and contact actions
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Share,
  Platform,
  FlatList,
  ViewToken,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePropertyStore } from "../../store/propertyStore";
import { useFavoriteStore } from "../../store/favoriteStore";
import { Colors } from "../../constants/Colors";
import { Shadow, Radius, CURRENCIES, AMENITIES } from "../../constants/theme";
import { Property } from "../../types";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 320;

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageListRef = useRef<FlatList>(null);

  const {
    fetchPropertyById,
    selectedProperty: property,
    isLoading,
  } = usePropertyStore();
  const { toggleFavorite, isFavorited } = useFavoriteStore();

  const favorited = property ? isFavorited(property._id) : false;

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const imageTransform = useAnimatedStyle(() => {
    const sv = scrollY.value;
    if (sv < 0) {
      // Overscroll (pull down) — image grows downward, top stays anchored
      const scale = interpolate(sv, [-150, 0], [1.4, 1], Extrapolation.CLAMP);
      const translateY = (scale - 1) * HEADER_HEIGHT * 0.5;
      return { transform: [{ translateY }, { scale }] };
    }
    // Normal scroll — parallax (image drifts up slower than content)
    return { transform: [{ translateY: -sv * 0.4 }, { scale: 1 }] };
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveImageIndex(viewableItems[0].index ?? 0);
    },
  );

  if (!property && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="home-outline" size={60} color={Colors.border} />
        <Text style={styles.errorText}>لم يتم العثور على العقار</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtnFull}
        >
          <Text style={styles.backBtnText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    const symbol = CURRENCIES[currency] || currency;
    return `${symbol}${price.toLocaleString()}`;
  };

  const handleWhatsApp = () => {
    const phone = property?.contactWhatsApp || property?.contactPhone;
    if (phone) {
      const msg = encodeURIComponent(
        `مرحبا، أنا مهتم بعقارك: ${property?.title}`,
      );
      Linking.openURL(
        `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`,
      );
    }
  };

  const handleCall = () => {
    if (property?.contactPhone) {
      Linking.openURL(`tel:${property.contactPhone}`);
    }
  };

  const handleShare = async () => {
    await Share.share({
      message: `اكتشف هذا العقار على عقارناو: ${property?.title} - ${formatPrice(property?.price || 0, property?.currency || "SAR")}`,
    });
  };

  const images = property?.images?.length
    ? property.images
    : ["https://via.placeholder.com/800x500"];

  return (
    <View style={styles.container}>
      {/* ─── Image Section (fixed behind scrollable content) ─── */}
      <Animated.View style={[styles.imageContainer, imageTransform]}>
        <FlatList
          ref={imageListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
            />
          )}
        />

        {/* Image gradient overlay */}
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.6)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Pagination dots */}
        {images.length > 1 && (
          <View style={styles.imageDots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.imageDot,
                  i === activeImageIndex && styles.imageDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Image counter */}
        <View style={[styles.imageCounter, { top: insets.top + 12 }]}>
          <Ionicons name="images-outline" size={12} color="#fff" />
          <Text style={styles.imageCounterText}>
            {activeImageIndex + 1}/{images.length}
          </Text>
        </View>

        {/* Price overlay on image */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>
            {property ? formatPrice(property.price, property.currency) : "---"}
          </Text>
          {property?.listingType === "rent" && (
            <Text style={styles.priceSubtext}>
              /{property.rentPeriod === "yearly" ? "سنة" : "شهر"}
            </Text>
          )}
        </View>
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 120,
        }}
      >
        {/* ─── Main Content ─────────────────────────────────── */}
        <View style={styles.content}>
          {/* Title & Badge */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: Colors[property?.listingType || "sale"],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {property?.listingType === "rent"
                      ? "للإيجار"
                      : property?.listingType === "sale"
                        ? "للبيع"
                        : "شراء"}
                  </Text>
                </View>
                {property?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={Colors.success}
                    />
                    <Text style={styles.verifiedText}>موثّق</Text>
                  </View>
                )}
              </View>
              <Text style={styles.propertyTitle}>{property?.title}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primaryLight} />
            <Text style={styles.locationText}>
              {[
                property?.district,
                typeof property?.city === "object"
                  ? property?.city.name
                  : property?.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            {[
              {
                icon: "resize-outline",
                label: `${property?.area || 0} م²`,
                title: "المساحة",
              },
              {
                icon: "bed-outline",
                label: property?.rooms || 0,
                title: "غرف النوم",
              },
              {
                icon: "water-outline",
                label: property?.bathrooms || 0,
                title: "دورات المياه",
              },
              {
                icon: "layers-outline",
                label: property?.floorNumber || 1,
                title: "الطابق",
              },
            ].map((stat) => (
              <View key={stat.title} style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons
                    name={stat.icon as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.statValue}>{stat.label}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{property?.description}</Text>
          </View>

          {/* View Types */}
          {property?.viewType && property.viewType.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الإطلالات</Text>
              <View style={styles.tagsRow}>
                {property.viewType.map((view) => (
                  <View key={view} style={styles.tag}>
                    <Ionicons
                      name="eye-outline"
                      size={13}
                      color={Colors.primaryLight}
                    />
                    <Text style={styles.tagText}>{view}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Amenities */}
          {property?.amenities && property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المرافق والميزات</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity) => {
                  const info = AMENITIES.find((a) => a.key === amenity);
                  return (
                    <View key={amenity} style={styles.amenityItem}>
                      <View style={styles.amenityIconBox}>
                        <Ionicons
                          name={(info?.icon || "star-outline") as any}
                          size={18}
                          color={Colors.primary}
                        />
                      </View>
                      <Text style={styles.amenityText}>
                        {info?.label || amenity}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Agent Card */}
          {(property?.agentName || property?.contactPhone) && (
            <View style={styles.agentCard}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>
                  {property?.agentName?.[0] || "A"}
                </Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {property?.agentName || "Agent"}
                </Text>
                <Text style={styles.agentRole}>وكيل عقاري</Text>
              </View>
              <TouchableOpacity
                style={styles.agentCallBtn}
                onPress={handleCall}
              >
                <Ionicons name="call" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      {/* ─── Overlay Buttons (fixed, safe area protected) ──── */}
      <View style={[styles.transparentHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRightBtns}>
          <TouchableOpacity
            style={styles.headerCircleBtn}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerCircleBtn,
              favorited && styles.headerCircleBtnFav,
            ]}
            onPress={() => property && toggleFavorite(property._id)}
          >
            <Ionicons
              name={favorited ? "heart" : "heart-outline"}
              size={20}
              color={favorited ? "#FF4757" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Animated sticky header (shows on scroll) */}
      <Animated.View
        style={[styles.stickyHeader, { paddingTop: insets.top }, headerStyle]}
      >
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {property?.title}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerShareBtn}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </Animated.View>
      {/* ─── Bottom Action Bar ──────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.callBtnText}>اتصال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={handleWhatsApp}
          activeOpacity={0.85}
        >
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ type: "timing", duration: 2000, loop: true }}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </MotiView>
          <Text style={styles.whatsappBtnText}>واتسآب</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => {}}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#1A3C6E", "#1A85E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookGradient}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>حجز زيارة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginHorizontal: 8,
  },
  headerShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  // Image
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  heroImage: {
    width,
    height: HEADER_HEIGHT,
  },
  transparentHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCircleBtnFav: {
    backgroundColor: "rgba(255,71,87,0.3)",
  },
  headerRightBtns: {
    flexDirection: "row",
    gap: 8,
  },
  imageDots: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  imageDotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  imageCounter: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  imageCounterText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  priceOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  priceSubtext: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
  // Content
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleContainer: { flex: 1 },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: { fontSize: 11, color: Colors.success, fontWeight: "600" },
  propertyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 29,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: Radius["2xl"],
    padding: 16,
    marginBottom: 20,
    ...Shadow.sm,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statTitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  amenityIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: Radius["2xl"],
    padding: 16,
    marginBottom: 20,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  agentAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  agentInfo: { flex: 1 },
  agentName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  agentRole: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  agentCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "#fff",
  },
  callBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#25D366",
    ...Shadow.sm,
  },
  whatsappBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  bookBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    ...Shadow.sm,
  },
  bookGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  backBtnFull: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
