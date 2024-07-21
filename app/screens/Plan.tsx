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
  Animated,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-ui-lib";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../helpers/firebaseConfig"; // Ensure the correct path
import { colors } from "@/app/theme"; // Ensure the correct path
import { useSignIn } from "@/hooks/useSignIn";
import { useNavigation } from "expo-router";
import { translate } from "@/app/helpers/i18n";

const { width, height } = Dimensions.get("window");

interface MenuButtonProps {
  iconName: string;
  selected?: boolean;
  onPress: () => void;
}

const categories = [
  { name: translate("adventure"), icon: "hiking" },
  { name: translate("romance"), icon: "favorite" },
  { name: translate("culturalExploration"), icon: "museum" },
  { name: translate("relaxation"), icon: "spa" },
  { name: translate("familyFun"), icon: "family-restroom" },
  { name: translate("foodDining"), icon: "restaurant" },
  { name: translate("shopping"), icon: "shopping-cart" },
];

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
      <MaterialIcons name={iconName} size={20} color="white" />
    </TouchableOpacity>
  );
};

const CategoryCard: React.FC<{
  category: string;
  item: any;
  setCurrentItem: any;
}> = ({ item, setCurrentItem }) => {
  useEffect(() => {
    setCurrentItem(item);
  }, [item, setCurrentItem]);

  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{
          uri: item?.photoUrl || "default-placeholder-image-url", // Fallback to a placeholder if the URL is not available
        }}
        style={styles.card}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.currentLocation}>{item?.time}</Text>
          <Text style={styles.museumName}>{item?.name}</Text>
          <Text style={styles.currentLocation}>{item?.description}</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const openGoogleMaps = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url).catch((err) => console.error("An error occurred", err));
};

const Plan: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0].name
  );
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const { reset } = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const { authenticateUser } = useSignIn();
  const [currentItem, setCurrentItem] = useState<any>();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const id = await authenticateUser();

      if (!id) {
        console.error("User ID is not defined");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", id));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          const travelPlan = userData?.travelPlan || {};
          const data = travelPlan[selectedCategory] || [];

          console.log("Data for selected category:", selectedCategory, data);
          setCategoryData(data);
        } else {
          console.log("User document does not exist");
          setCategoryData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategoryData([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => reset({ index: 0, routes: [{ name: "Main" }] })}
        >
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>
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
      {loading && categoryData.length < 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>{translate("loading")}</Text>
        </View>
      ) : (
        <Swiper
          cards={categoryData}
          renderCard={(card) => (
            <CategoryCard
              category={selectedCategory}
              item={card}
              setCurrentItem={setCurrentItem}
            />
          )}
          infinite
          backgroundColor="transparent"
          cardVerticalMargin={0}
          cardHorizontalMargin={0}
          stackSize={3}
          containerStyle={styles.swiperContainer}
          cardStyle={styles.card}
          onSwiped={(cardIndex) => setCurrentItem(categoryData[cardIndex])}
        />
      )}
      <View style={styles.footer}>
        <Button
          label={translate("openInGoogleMaps")}
          backgroundColor="#FFC107"
          color="white"
          onPress={() =>
            openGoogleMaps(currentItem?.latitude, currentItem?.longitude)
          }
          style={styles.mapsButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 10, // Ensure the header is on top
  },
  backButton: {
    marginLeft: 5,
    marginTop:20,
    width: 50,
    height: 50
  },
  menu: {
    position: "absolute",
    left: 10,
    top: 100,
    zIndex: 1, // Ensure the menu is on top
  },
  button: {
    marginVertical: 10,
    padding: 10, // Reduced padding
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
  selected: {
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FFC107",
  },
});

export default Plan;
