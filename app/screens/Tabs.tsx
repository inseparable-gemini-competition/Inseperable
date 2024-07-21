import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSignIn } from "@/hooks/useSignIn";
import { Modal, Card, Text, Button } from "react-native-ui-lib";
import useStore from "../store";

const TabsScreen = () => {
  const [showModal, setShowModal] = useState({
    show: false,
    wasAlreadyShown: false,
  });

  const { userData } = useStore();

  const colorScheme = useColorScheme();

  useSignIn();

  useEffect(() => {
    if (!showModal.wasAlreadyShown && userData?.country) {
      setShowModal({
        show: true,
        wasAlreadyShown: true,
      });
    }
  }, [userData?.country]);

  const closeModal = () => {
    setShowModal({
      show: false,
      wasAlreadyShown: true,
    });
  };

  return (
    <>
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
          name="HandmadeItems"
          options={{
            title: "Local Shopping",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "basket" : "basket-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* Modal to show user data */}
      {showModal && (
        <Modal
          visible={showModal?.show}
          onBackgroundPress={closeModal}
          transparent
          animationType="slide"
        >
          <Card style={styles.card}>
            {userData?.country && (
              <>
                <Text>
                  Welcome to {userData?.country} {userData?.flag}
                </Text>
                <Text>Enjoy the ride 😉</Text>
              </>
            )}
            <Button onPress={closeModal} label="Close" style={styles.button} />
          </Card>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    width: 300,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -100 }],
  },
  button: {
    marginTop: 20,
  },
});

export default TabsScreen;
