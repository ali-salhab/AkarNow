/**
 * Add Property Screen
 * Lets authenticated users publish a new listing.
 * All fields mirror the admin panel; map location is optional.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { propertiesAPI } from "../../services/api";
import LocationPicker, { Coordinates } from "../../components/LocationPicker";
import { Colors } from "../../constants/Colors";
import { Shadow, Radius, Spacing } from "../../constants/theme";

// ─── Option helpers ──────────────────────────────────────────────────────────

const LISTING_TYPES = [
  { value: "rent", label: "إيجار" },
  { value: "sale", label: "بيع" },
  { value: "buy", label: "شراء" },
] as const;

const PROPERTY_TYPES = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "chalet", label: "شاليه" },
  { value: "studio", label: "استوديو" },
  { value: "office", label: "مكتب" },
  { value: "land", label: "أرض" },
  { value: "warehouse", label: "مستودع" },
] as const;

const CURRENCIES = ["SAR", "AED", "KWD", "BHD", "QAR", "OMR", "EGP", "USD"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddPropertyScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();

  // ── Form fields ────────────────────────────────────────────────────────────
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"rent" | "sale" | "buy">("sale");
  const [propertyType, setPropertyType] = useState("apartment");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  // ── Location ───────────────────────────────────────────────────────────────
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [showMap, setShowMap] = useState(false);

  // ── State ──────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Guard: must be logged in ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={styles.authWall}>
        <Ionicons name="lock-closed-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.authWallTitle}>تسجيل الدخول مطلوب</Text>
        <Text style={styles.authWallSub}>
          يجب عليك تسجيل الدخول أولاً لإضافة عقار
        </Text>
        <TouchableOpacity
          style={styles.authWallBtn}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.authWallBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validation
    if (!titleAr.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال عنوان العقار");
      return;
    }
    if (!description.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى كتابة وصف للعقار");
      return;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال سعر صحيح");
      return;
    }
    if (!area || Number(area) <= 0) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال المساحة");
      return;
    }
    if (!city.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال المدينة");
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال رقم التواصل");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        titleAr: titleAr.trim(),
        title: titleAr.trim(), // fallback English = Arabic
        description: description.trim(),
        listingType,
        propertyType,
        price: Number(price),
        currency,
        area: Number(area),
        rooms: Number(rooms),
        bathrooms: Number(bathrooms),
        city: city.trim(),
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        contactPhone: contactPhone.trim(),
      };

      if (coordinates) {
        payload.coordinates = coordinates;
      }

      await propertiesAPI.create(payload);

      Alert.alert(
        "تم الإرسال ✓",
        "تم إرسال إعلانك للمراجعة وسيُنشر بعد الموافقة عليه.",
        [
          {
            text: "حسناً",
            onPress: () => {
              // Reset form
              setTitleAr("");
              setDescription("");
              setListingType("sale");
              setPropertyType("apartment");
              setPrice("");
              setArea("");
              setRooms("0");
              setBathrooms("0");
              setCity("");
              setDistrict("");
              setAddress("");
              setContactPhone(user?.phone || "");
              setCoordinates(null);
              router.push("/(tabs)");
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "حدث خطأ",
        err?.response?.data?.message || "فشل إرسال الإعلان. حاول مجدداً.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Chips helper ─────────────────────────────────────────────────────────
  const Chips = ({
    options,
    value,
    onChange,
  }: {
    options: readonly { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View style={styles.chipsRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.chip, value === o.value && styles.chipActive]}
          onPress={() => onChange(o.value)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              value === o.value && styles.chipTextActive,
            ]}
          >
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ─── Counter helper ────────────────────────────────────────────────────────
  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View style={styles.counterBlock}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() =>
            onChange(String(Math.max(0, Number(value) - 1)))
          }
        >
          <Ionicons name="remove" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.counterVal}>{value}</Text>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => onChange(String(Number(value) + 1))}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#1A3C6E", "#1A85E6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pageHeader}
        >
          <View style={styles.pageHeaderInner}>
            <View style={styles.pageHeaderIcon}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageHeaderTitle}>نشر عقار جديد</Text>
              <Text style={styles.pageHeaderSub}>
                سيُراجع الإعلان قبل النشر
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Listing type ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الإعلان</Text>
          <Chips
            options={LISTING_TYPES}
            value={listingType}
            onChange={(v) => setListingType(v as typeof listingType)}
          />
        </View>

        {/* ── Property type ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع العقار</Text>
          <Chips
            options={PROPERTY_TYPES}
            value={propertyType}
            onChange={setPropertyType}
          />
        </View>

        {/* ── Title ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            عنوان العقار <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: شقة للإيجار في حي النزهة — 3 غرف"
            placeholderTextColor={Colors.textMuted}
            value={titleAr}
            onChangeText={setTitleAr}
            textAlign="right"
            maxLength={150}
          />
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            وصف العقار <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="صف العقار بالتفصيل: الميزات، الموقع، المرافق القريبة..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right"
            maxLength={2000}
          />
        </View>

        {/* ── Price ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            السعر <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              textAlign="right"
            />
            {/* Currency selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.currencyScroll}
              contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}
            >
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.currencyChip,
                    currency === c && styles.currencyChipActive,
                  ]}
                  onPress={() => setCurrency(c)}
                >
                  <Text
                    style={[
                      styles.currencyChipText,
                      currency === c && styles.currencyChipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── Area ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            المساحة (م²) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 120"
            placeholderTextColor={Colors.textMuted}
            value={area}
            onChangeText={setArea}
            keyboardType="numeric"
            textAlign="right"
          />
        </View>

        {/* ── Rooms & Bathrooms ── */}
        <View style={[styles.section, styles.countersRow]}>
          <Counter label="غرف النوم" value={rooms} onChange={setRooms} />
          <View style={styles.countersDivider} />
          <Counter label="دورات المياه" value={bathrooms} onChange={setBathrooms} />
        </View>

        {/* ── Location text ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الموقع</Text>
          <TextInput
            style={styles.input}
            placeholder="المدينة *"
            placeholderTextColor={Colors.textMuted}
            value={city}
            onChangeText={setCity}
            textAlign="right"
          />
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="الحي (اختياري)"
            placeholderTextColor={Colors.textMuted}
            value={district}
            onChangeText={setDistrict}
            textAlign="right"
          />
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="العنوان التفصيلي (اختياري)"
            placeholderTextColor={Colors.textMuted}
            value={address}
            onChangeText={setAddress}
            textAlign="right"
          />
        </View>

        {/* ── Map location (optional) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            تحديد الموقع على الخريطة{" "}
            <Text style={styles.optional}>(اختياري)</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.mapPickerBtn,
              coordinates && styles.mapPickerBtnActive,
            ]}
            onPress={() => setShowMap(true)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={coordinates ? "location" : "map-outline"}
              size={22}
              color={coordinates ? Colors.primary : Colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.mapPickerText,
                  coordinates && { color: Colors.primary },
                ]}
              >
                {coordinates
                  ? "تم تحديد الموقع ✓"
                  : "اضغط لتحديد الموقع على الخريطة"}
              </Text>
              {coordinates && (
                <Text style={styles.mapPickerCoords}>
                  {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                </Text>
              )}
            </View>
            {coordinates && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setCoordinates(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Contact phone ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            رقم التواصل <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: +966501234567"
            placeholderTextColor={Colors.textMuted}
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && { opacity: 0.65 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#1A3C6E", "#1A85E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.submitText}>نشر الإعلان</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Map picker modal */}
      <LocationPicker
        visible={showMap}
        initial={coordinates || undefined}
        onConfirm={(coords) => setCoordinates(coords)}
        onClose={() => setShowMap(false)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 16 },

  // Auth wall
  authWall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 32,
    gap: 12,
  },
  authWallTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
  },
  authWallSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  authWallBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  authWallBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Page header
  pageHeader: {
    borderRadius: Radius.xl,
    marginBottom: 20,
    ...Shadow.md,
  },
  pageHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  pageHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  pageHeaderSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  // Sections
  section: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
    textAlign: "right",
  },
  required: { color: "#EF4444" },
  optional: { color: Colors.textMuted, fontWeight: "400" },

  // Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  chipTextActive: { color: Colors.primary, fontWeight: "700" },

  // Inputs
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: "#1E293B",
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: 12,
  },

  // Price row
  priceRow: { gap: 8 },
  currencyScroll: { flexGrow: 0, marginTop: 8 },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  currencyChipActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  currencyChipText: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  currencyChipTextActive: { color: Colors.primary },

  // Counters
  countersRow: { flexDirection: "row", gap: 0 },
  counterBlock: { flex: 1, alignItems: "center" },
  counterLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
    textAlign: "center",
  },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    minWidth: 28,
    textAlign: "center",
  },
  countersDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },

  // Map picker
  mapPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: Radius.lg,
    padding: 14,
    backgroundColor: "#F8FAFC",
  },
  mapPickerBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  mapPickerText: { fontSize: 14, color: Colors.textMuted },
  mapPickerCoords: { fontSize: 11, color: Colors.primary, marginTop: 2 },

  // Submit
  submitBtn: { borderRadius: Radius.xl, overflow: "hidden", marginTop: 4 },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
