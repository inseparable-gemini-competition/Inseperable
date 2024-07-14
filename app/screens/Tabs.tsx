import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const TabsScreen = () => {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName={"Identify"}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Questionnaire"
        options={{
          title: "Questionnaire",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "call" : "call-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Chat"
        options={{
          title: "Chat",
          href: null,
          headerShown: true,
        }}
      />

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
    </Tabs>
  );
};

export default TabsScreen;
