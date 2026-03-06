/**
 * Search Screen
 * Real-time debounced search with suggestions, recent searches, and results
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePropertyStore } from "../../store/propertyStore";
import { propertiesAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import PropertyCard from "../../components/PropertyCard";
import FilterSheet from "../../components/FilterSheet";
import { Colors } from "../../constants/Colors";
import { Shadow, Radius } from "../../constants/theme";
import { Property, SearchSuggestion } from "../../types";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const {
    properties,
    isLoading,
    pagination,
    fetchProperties,
    setSearchQuery,
    setFilters,
    loadMore,
  } = usePropertyStore();

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsFetchingSuggestions(true);
      propertiesAPI
        .getSuggestions(debouncedQuery)
        .then((res) => {
          setSuggestions(res.data.data || []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsFetchingSuggestions(false));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Execute search
  useEffect(() => {
    if (debouncedQuery) {
      setSearchQuery(debouncedQuery);
      fetchProperties({ search: debouncedQuery }, true);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    setShowSuggestions(false);
    if (suggestion.type === "property") {
      router.push(`/property/${suggestion.id}`);
    } else {
      fetchProperties({ city: suggestion.id, search: "" }, true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchQuery("");
    fetchProperties({}, true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ابحث عن عقارات</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="مدينة، حي، نوع عقار..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => setShowSuggestions(false)}
              autoFocus={false}
            />
            {query ? (
              <TouchableOpacity onPress={handleClear}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            ) : isFetchingSuggestions ? (
              <ActivityIndicator size="small" color={Colors.primaryLight} />
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={`${suggestion.type}-${suggestion.id}`}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons
                name={suggestion.type === "city" ? "location" : "home"}
                size={16}
                color={Colors.primaryLight}
              />
              <View style={styles.suggestionText}>
                <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
                <Text style={styles.suggestionType}>
                  {suggestion.type === "city" ? "مدينة" : "عقار"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </MotiView>
      )}

      {/* Results */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 40 }}
            style={{ paddingHorizontal: 16 }}
          >
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item._id}`)}
              variant="list"
            />
          </MotiView>
        )}
        ListHeaderComponent={
          query && !isLoading && pagination ? (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {pagination.total} نتيجة لـ "{query}"
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              {query ? (
                <>
                  <Ionicons
                    name="search-outline"
                    size={56}
                    color={Colors.border}
                  />
                  <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
                  <Text style={styles.emptySubtext}>جرّب كلمة بحث مختلفة</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="home-outline"
                    size={56}
                    color={Colors.border}
                  />
                  <Text style={styles.emptyTitle}>اعثر على عقارك المثالي</Text>
                  <Text style={styles.emptySubtext}>
                    ابحث بالمدينة أو النوع أو كلمة مفتاحية
                  </Text>
                </>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          setFilters(filters);
          fetchProperties({ ...filters, search: query }, true);
          setFilterVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    zIndex: 100,
    ...Shadow.md,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  suggestionText: { flex: 1 },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  suggestionType: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  loadingFooter: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
