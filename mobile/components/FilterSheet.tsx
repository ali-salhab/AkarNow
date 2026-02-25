/**
 * FilterSheet Component
 * Bottom sheet modal with full filtering options
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import {
  Shadow,
  Radius,
  PROPERTY_TYPES,
  LISTING_TYPES,
  VIEW_TYPES,
} from "../constants/theme";
import { PropertyFilters, ListingType, PropertyType, ViewType } from "../types";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PropertyFilters) => void;
  initialFilters?: PropertyFilters;
}

const PRICE_RANGES = [
  { label: "Any", min: undefined, max: undefined },
  { label: "< 500K", min: undefined, max: 500000 },
  { label: "500K - 1M", min: 500000, max: 1000000 },
  { label: "1M - 2M", min: 1000000, max: 2000000 },
  { label: "2M - 5M", min: 2000000, max: 5000000 },
  { label: "5M+", min: 5000000, max: undefined },
];

const ROOMS_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "Studio", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5+", value: 5 },
];

export default function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterSheetProps) {
  const [listingType, setListingType] = useState<ListingType | undefined>(
    initialFilters?.listingType,
  );
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>(
    initialFilters?.propertyType,
  );
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>(
    {},
  );
  const [rooms, setRooms] = useState<number | undefined>(undefined);
  const [viewTypes, setViewTypes] = useState<ViewType[]>([]);

  const handleReset = () => {
    setListingType(undefined);
    setPropertyType(undefined);
    setPriceRange({});
    setRooms(undefined);
    setViewTypes([]);
  };

  const handleApply = () => {
    onApply({
      listingType,
      propertyType,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRooms: rooms,
      viewType: viewTypes.length > 0 ? viewTypes : undefined,
    });
  };

  const toggleViewType = (type: ViewType) => {
    setViewTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const activeFiltersCount = [
    listingType,
    propertyType,
    priceRange.min || priceRange.max,
    rooms !== undefined,
    viewTypes.length > 0,
  ].filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>
              Reset{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── Listing Type ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Type</Text>
            <View style={styles.optionsRow}>
              {LISTING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.optionChip,
                    listingType === type.key && {
                      backgroundColor: type.color,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() =>
                    setListingType(
                      listingType === type.key
                        ? undefined
                        : (type.key as ListingType),
                    )
                  }
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      listingType === type.key && styles.optionChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── Property Type ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.optionsGrid}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeCard,
                    propertyType === type.key && styles.typeCardActive,
                  ]}
                  onPress={() =>
                    setPropertyType(
                      propertyType === type.key
                        ? undefined
                        : (type.key as PropertyType),
                    )
                  }
                >
                  <Ionicons
                    name={type.icon as any}
                    size={22}
                    color={
                      propertyType === type.key ? "#fff" : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeCardText,
                      propertyType === type.key && styles.typeCardTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── Price Range ───────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (SAR)</Text>
            <View style={styles.optionsRow}>
              {PRICE_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.label}
                  style={[
                    styles.optionChip,
                    priceRange.min === range.min &&
                      priceRange.max === range.max &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() =>
                    setPriceRange({ min: range.min, max: range.max })
                  }
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      priceRange.min === range.min &&
                        priceRange.max === range.max &&
                        styles.optionChipTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── Rooms ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms</Text>
            <View style={styles.optionsRow}>
              {ROOMS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[
                    styles.roomChip,
                    rooms === opt.value && styles.roomChipActive,
                  ]}
                  onPress={() =>
                    setRooms(rooms === opt.value ? undefined : opt.value)
                  }
                >
                  <Text
                    style={[
                      styles.roomChipText,
                      rooms === opt.value && styles.roomChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── View Type ─────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>View</Text>
            <View style={styles.optionsRow}>
              {VIEW_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.viewChip,
                    viewTypes.includes(type.key as ViewType) &&
                      styles.viewChipActive,
                  ]}
                  onPress={() => toggleViewType(type.key as ViewType)}
                >
                  <Text style={styles.viewEmoji}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.optionChipText,
                      viewTypes.includes(type.key as ViewType) &&
                        styles.optionChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#1A3C6E", "#1A85E6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyGradient}
            >
              <Text style={styles.applyText}>
                Apply Filters
                {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
              </Text>
              <Ionicons
                name="checkmark"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  resetText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  optionChipTextActive: {
    color: "#fff",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeCard: {
    width: "30%",
    padding: 14,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  typeCardTextActive: { color: "#fff" },
  roomChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  roomChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roomChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  roomChipTextActive: { color: "#fff" },
  viewChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    gap: 4,
  },
  viewChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  viewEmoji: { fontSize: 14 },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...Shadow.md,
  },
  applyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
