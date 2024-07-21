// App.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Text,
  Dimensions,
  Linking,
  ActivityIndicator,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-ui-lib";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../helpers/firebaseConfig"; // Ensure the correct path
import { colors } from "@/app/theme"; // Ensure the correct path
import { useSignIn } from "@/hooks/useSignIn";

const { width, height } = Dimensions.get("window");

// Define the types for the props
interface MenuButtonProps {
  iconName: string;
  selected?: boolean;
  onPress: () => void;
}

// Categories and their corresponding icons
const categories = [
  { name: "Adventure", icon: "hiking" },
  { name: "Romance", icon: "favorite" },
  { name: "Cultural Exploration", icon: "museum" },
  { name: "Relaxation", icon: "spa" },
  { name: "Family Fun", icon: "family-restroom" },
  { name: "Food & Dining", icon: "restaurant" },
  { name: "Shopping", icon: "shopping-cart" },
];

// MenuButton component
const MenuButton: React.FC<MenuButtonProps> = ({
  iconName,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.selected]}
      onPress={onPress}
    >
      <MaterialIcons name={iconName} size={24} color="white" />
    </TouchableOpacity>
  );
};

// Sample card component for each category
const CategoryCard: React.FC<{
  category: string;
  item: any;
  setCurrentItem: any;
}> = ({ item, setCurrentItem }) => {
  setCurrentItem?.(item);
  return (
    <ImageBackground
      source={{
        uri: item?.photoUrl,
      }} // Placeholder image
      style={styles.card}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.currentLocation}>{item?.time}</Text>
        <Text style={styles.museumName}>{item?.name}</Text>
        <Text style={styles.currentLocation}>{item?.description}</Text>
      </View>
    </ImageBackground>
  );
};

const openGoogleMaps = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url).catch((err) => console.error("An error occurred", err));
};

// Main App component
const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0].name
  );
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userId, authenticateUser } = useSignIn();
  // state for currentItem
  const [currentItem, setCurrentItem] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await authenticateUser();
      try {
        console.log("Fetching data for userId:", userId); // Log the userId
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data fetched:", userData); // Log the fetched user data
          const travelPlan = userData?.travelPlan || {};
          const data = travelPlan[selectedCategory] || [];
          console.log("Data for selected category:", selectedCategory, data); // Log the data for the selected category
          setCategoryData(data);
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedCategory, userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menu}>
        {categories.map((category) => (
          <MenuButton
            key={category.name}
            iconName={category.icon}
            selected={selectedCategory === category.name}
            onPress={() => setSelectedCategory(category.name)}
          />
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FFC107" />
      ) : (
        <Swiper
          cards={categoryData}
          renderCard={(card) => (
            <CategoryCard category={selectedCategory} item={card} setCurrentItem={setCurrentItem} />
          )}
          infinite
          backgroundColor="transparent"
          cardVerticalMargin={0}
          cardHorizontalMargin={0}
          stackSize={3}
          containerStyle={styles.swiperContainer}
          cardStyle={styles.card}
        />
      )}
      <View style={styles.footer}>
        <Button
          label="Open In Google Maps"
          backgroundColor="#FFC107"
          color="white"
          onPress={() => openGoogleMaps(currentItem?.latitude, currentItem?.longitude)}
          style={styles.mapsButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  menu: {
    position: "absolute",
    left: 10,
    top: 50,
    zIndex: 1, // Ensure the menu is on top
  },
  button: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
  selected: {
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  card: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "flex-end",
    borderRadius: 20,
    overflow: "hidden", // Ensure the image doesn't overflow
  },
  swiperContainer: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add a background for better text visibility
  },
  currentLocation: {
    color: "#FFF",
    fontSize: 14,
  },
  museumName: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 10, // Adjusted bottom margin
    left: 0,
    right: 0,
    alignItems: "center",
  },
  mapsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
});

export default App;
