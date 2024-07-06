import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "react-query";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        initialRouteName={"Identify"}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Identify",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "camera" : "camera-outline"}
                color={color}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
        name="PriceRanges"
        options={{
          title: 'Price Range',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'pricetag' : 'pricetag-outline'} color={color} />
          ),
        }}
      /> */}
        <Tabs.Screen
          name="Translation"
          options={{
            title: "Communicate",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "language" : "language-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="HandmadeItems"
          options={{
            title: "Buy",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "basket" : "basket-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Donate"
          options={{
            title: "Donate",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "heart" : "heart-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
