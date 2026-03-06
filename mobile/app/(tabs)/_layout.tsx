/**
 * Tabs Layout
 * Bottom tab navigation with custom animated tab bar
 */

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Shadow } from "../../constants/theme";

const TAB_ITEMS = [
  { name: "index", label: "Home", icon: "home", iconActive: "home" },
  {
    name: "search",
    label: "Search",
    icon: "search-outline",
    iconActive: "search",
  },
  {
    name: "favorites",
    label: "Saved",
    icon: "heart-outline",
    iconActive: "heart",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "بحث",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "نشر عقار",
          tabBarIcon: ({ focused }) => (
            <View style={styles.addBtnWrap}>
              <View style={[styles.addBtn, focused && styles.addBtnFocused]}>
                <Ionicons name="add" size={28} color="#fff" />
              </View>
            </View>
          ),
          tabBarLabel: () => <Text style={styles.addBtnLabel}>نشر</Text>,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "المحفوظات",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "الملف الشخصي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 80,
    paddingBottom: 16,
    paddingTop: 10,
    position: "absolute",
    ...Shadow.lg,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  addBtnWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnFocused: {
    backgroundColor: "#1A3C6E",
  },
  addBtnLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
  },
});
