/**
 * LocationPicker
 * Full-screen modal map for selecting a property location.
 * - Tap anywhere on the map to drop a pin
 * - "My Location" button centers on current GPS position
 * - "Confirm" saves the coordinates
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export interface Coordinates {
  lat: number;
  lng: number;
}

interface Props {
  visible: boolean;
  initial?: Coordinates;
  onConfirm: (coords: Coordinates) => void;
  onClose: () => void;
}

// Default center — Riyadh, KSA
const DEFAULT_REGION: Region = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationPicker({
  visible,
  initial,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(
    initial
      ? {
          latitude: initial.lat,
          longitude: initial.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION,
  );

  const [marker, setMarker] = useState<Coordinates | null>(initial || null);
  const [locating, setLocating] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (visible && initial) {
      const r = {
        latitude: initial.lat,
        longitude: initial.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
      setMarker(initial);
    }
  }, [visible]);

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  };

  const handleMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "صلاحية الموقع",
          "يرجى السماح للتطبيق بالوصول إلى موقعك",
        );
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMarker({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
    } catch {
      Alert.alert("خطأ", "تعذّر تحديد موقعك. تأكد من تفعيل GPS.");
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = () => {
    if (!marker) {
      Alert.alert("اختر موقعاً", "اضغط على الخريطة لتحديد موقع العقار");
      return;
    }
    onConfirm(marker);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Map */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard"
        >
          {marker && (
            <Marker
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarker({ lat: latitude, lng: longitude });
              }}
            />
          )}
        </MapView>

        {/* Header bar */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + (Platform.OS === "android" ? 12 : 8) },
          ]}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>حدّد موقع العقار</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hint */}
        {!marker && (
          <View style={styles.hintBubble}>
            <Ionicons name="finger-print-outline" size={16} color="#fff" />
            <Text style={styles.hintText}>اضغط على الخريطة لتحديد الموقع</Text>
          </View>
        )}

        {/* Bottom controls */}
        <View
          style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}
        >
          {/* My location button */}
          <TouchableOpacity
            style={styles.myLocBtn}
            onPress={handleMyLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons
                name="navigate-circle-outline"
                size={22}
                color={Colors.primary}
              />
            )}
            <Text style={styles.myLocText}>موقعي الحالي</Text>
          </TouchableOpacity>

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmBtn, !marker && { opacity: 0.5 }]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.confirmText}>تأكيد الموقع</Text>
          </TouchableOpacity>
        </View>

        {/* Coordinates badge */}
        {marker && (
          <View style={styles.coordsBadge}>
            <Ionicons name="location" size={13} color={Colors.primary} />
            <Text style={styles.coordsText}>
              {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(15,23,42,0.75)",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  hintBubble: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hintText: { color: "#fff", fontSize: 13 },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "rgba(15,23,42,0.80)",
  },
  myLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
    justifyContent: "center",
  },
  myLocText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1.5,
    justifyContent: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  coordsBadge: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  coordsText: {
    fontSize: 11,
    color: "#334155",
    fontFamily: "monospace",
  },
});
