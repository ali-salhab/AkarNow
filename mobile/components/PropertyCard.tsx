/**
 * PropertyCard Component
 * Supports two variants: 'featured' (horizontal card) and 'list' (vertical card)
 * Includes favorite button, listing type badge, price, location
 */

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useFavoriteStore } from "../store/favoriteStore";
import { Colors } from "../constants/Colors";
import { Shadow, Radius, CURRENCIES } from "../constants/theme";
import { Property } from "../types";

const { width } = Dimensions.get("window");

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  variant?: "list" | "featured";
}

const LISTING_BADGE_COLORS: Record<string, string> = {
  rent: Colors.rent,
  sale: Colors.sale,
  buy: Colors.buy,
};

const LISTING_BADGE_LABELS: Record<string, string> = {
  rent: "للإيجار",
  sale: "للبيع",
  buy: "شراء",
};

function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCIES[currency] || currency;
  if (price >= 1_000_000) {
    return `${symbol}${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `${symbol}${(price / 1_000).toFixed(0)}K`;
  }
  return `${symbol}${price.toLocaleString()}`;
}

const PropertyCard = memo(
  ({ property, onPress, variant = "list" }: PropertyCardProps) => {
    const { toggleFavorite, isFavorited } = useFavoriteStore();
    const favorited = isFavorited(property._id);
    const cardWidth = variant === "featured" ? width * 0.72 : width - 32;

    const handleFavorite = async (e: any) => {
      e.stopPropagation();
      await toggleFavorite(property._id);
    };

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth },
          variant === "featured" ? styles.cardFeatured : styles.cardList,
        ]}
        onPress={onPress}
        activeOpacity={0.93}
      >
        {/* Image */}
        <ImageBackground
          source={{
            uri:
              property.coverImage ||
              property.images?.[0] ||
              "https://via.placeholder.com/400x250",
          }}
          style={styles.image}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={["transparent", "rgba(26,60,110,0.85)"]}
            style={styles.imageGradient}
          />

          {/* Listing Type Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: LISTING_BADGE_COLORS[property.listingType] },
            ]}
          >
            <Text style={styles.badgeText}>
              {LISTING_BADGE_LABELS[property.listingType]}
            </Text>
          </View>

          {/* Verified Badge */}
          {property.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={styles.verifiedText}>موثّق</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={[styles.favoriteBtn, favorited && styles.favoriteBtnActive]}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <MotiView
              animate={{
                scale: favorited ? [1.3, 1] : 1,
              }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={18}
                color={favorited ? "#FF4757" : "#fff"}
              />
            </MotiView>
          </TouchableOpacity>

          {/* Price — overlaid on image */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(property.price, property.currency)}
            </Text>
            {property.listingType === "rent" && property.rentPeriod && (
              <Text style={styles.pricePeriod}>
                /{property.rentPeriod === "yearly" ? "سنة" : "شهر"}
              </Text>
            )}
          </View>
        </ImageBackground>

        {/* Card Body */}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={Colors.textMuted}
            />
            <Text style={styles.location} numberOfLines={1}>
              {property.district ? `${property.district}, ` : ""}
              {typeof property.city === "object"
                ? property.city.name
                : property.city}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {property.rooms > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="bed-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.statText}>{property.rooms}</Text>
              </View>
            )}
            <View style={styles.stat}>
              <Ionicons
                name="water-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons
                name="resize-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.statText}>{property.area} م²</Text>
            </View>
            {property.viewType?.length > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.statText} numberOfLines={1}>
                  {property.viewType[0]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

PropertyCard.displayName = "PropertyCard";

export default PropertyCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius["2xl"],
    overflow: "hidden",
    ...Shadow.md,
  },
  cardList: {
    marginBottom: 16,
  },
  cardFeatured: {
    marginBottom: 4,
  },
  image: {
    height: 200,
    justifyContent: "space-between",
  },
  imageStyle: {
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    right: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteBtnActive: {
    backgroundColor: "rgba(255,71,87,0.2)",
  },
  priceContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginLeft: 3,
    fontWeight: "500",
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  location: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
