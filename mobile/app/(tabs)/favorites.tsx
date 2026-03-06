/**
 * Favorites Screen
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavoriteStore } from "../../store/favoriteStore";
import PropertyCard from "../../components/PropertyCard";
import { Colors } from "../../constants/Colors";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isLoading, fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>العقارات المحفوظة</Text>
        <Text style={styles.subtitle}>{favorites.length} محفوظ</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 60 }}
            style={{ paddingHorizontal: 16 }}
          >
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item._id}`)}
              variant="list"
            />
          </MotiView>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                <Ionicons
                  name="heart-outline"
                  size={70}
                  color={Colors.border}
                />
              </MotiView>
              <Text style={styles.emptyTitle}>لا توجد عقارات محفوظة بعد</Text>
              <Text style={styles.emptySubtext}>
                اضغط على أيقونة القلب على أي عقار لحفظه هنا
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.browseBtnText}>تصفح العقارات</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchFavorites}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
  },
  listContent: { paddingTop: 12 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
