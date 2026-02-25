/**
 * Home Screen
 * Featured listings, property categories, and infinite scroll feed
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePropertyStore } from "../../store/propertyStore";
import { useAuthStore } from "../../store/authStore";
import { useFavoriteStore } from "../../store/favoriteStore";
import PropertyCard from "../../components/PropertyCard";
import FilterSheet from "../../components/FilterSheet";
import { Colors } from "../../constants/Colors";
import { Shadow, LISTING_TYPES } from "../../constants/theme";
import { Property } from "../../types";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeListingType, setActiveListingType] = useState<string | null>(
    null,
  );
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuthStore();
  const {
    properties,
    featured,
    isLoading,
    isLoadingMore,
    pagination,
    fetchProperties,
    fetchFeatured,
    loadMore,
    setFilters,
  } = usePropertyStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchFeatured();
    fetchProperties();
    fetchFavorites();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFeatured(),
      fetchProperties({}, true),
      fetchFavorites(),
    ]);
    setRefreshing(false);
  }, []);

  const handleListingTypeFilter = (type: string | null) => {
    setActiveListingType(type);
    setFilters({ listingType: type as any });
    fetchProperties({ listingType: type as any }, true);
  };

  const handlePropertyPress = (property: Property) => {
    router.push(`/property/${property._id}`);
  };

  const renderHeader = () => (
    <View>
      {/* ─── Top Header ─────────────────────────────────────── */}
      <LinearGradient
        colors={["#1A3C6E", "#1A85E6"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </Text>
            <Text style={styles.headerTitle}>Find Your Perfect Home</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (tappable — navigates to search screen) */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search properties, cities...
          </Text>
          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </LinearGradient>

      {/* ─── Featured Carousel ───────────────────────────────── */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Featured</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featured.map((property, index) => (
              <MotiView
                key={property._id}
                from={{ opacity: 0, translateX: 30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "timing",
                  duration: 400,
                  delay: index * 100,
                }}
              >
                <PropertyCard
                  property={property}
                  onPress={() => handlePropertyPress(property)}
                  variant="featured"
                />
              </MotiView>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ─── Listing Type Filter Pills ───────────────────────── */}
      <View style={styles.pillsContainer}>
        <TouchableOpacity
          style={[styles.pill, !activeListingType && styles.pillActive]}
          onPress={() => handleListingTypeFilter(null)}
        >
          <Text
            style={[
              styles.pillText,
              !activeListingType && styles.pillTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {LISTING_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.pill,
              activeListingType === type.key && { backgroundColor: type.color },
            ]}
            onPress={() => handleListingTypeFilter(type.key)}
          >
            <Text
              style={[
                styles.pillText,
                activeListingType === type.key && styles.pillTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Properties</Text>
        {pagination && (
          <Text style={styles.count}>{pagination.total} listings</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: 80 }]}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: index * 50 }}
            style={{ paddingHorizontal: 16 }}
          >
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item)}
              variant="list"
            />
          </MotiView>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>No properties found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters
              </Text>
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          setFilters(filters);
          fetchProperties(filters, true);
          setFilterVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  greeting: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4757",
    borderWidth: 1.5,
    borderColor: "#1A85E6",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    ...Shadow.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pillsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 24,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: "#fff",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
