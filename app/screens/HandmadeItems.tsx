import React, { useEffect } from "react";
import { StyleSheet, FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Card, Button } from "react-native-ui-lib";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { db } from "@/app/helpers/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from "@/app/theme";
import { translate } from "@/app/helpers/i18n";

interface HandmadeItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  carbonFootprint: string;
  ownerId: string;
}

interface FetchResponse {
  items: HandmadeItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

const fetchHandmadeItems = async ({ pageParam = undefined }): Promise<FetchResponse> => {
  const itemsQuery = query(
    collection(db, "products"),
    orderBy("createdAt"),
    limit(10),
    ...(pageParam ? [startAfter(pageParam)] : [])
  );

  const querySnapshot = await getDocs(itemsQuery);
  const items: HandmadeItem[] = [];
  let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;

  querySnapshot.forEach((doc) => {
    if (doc.exists() && doc.data().createdAt) {
      items.push({ id: doc.id, ...doc.data() } as HandmadeItem);
    } else {
      console.error("Document missing createdAt:", doc.id);
    }
  });

  if (!querySnapshot.empty) {
    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  }

  return {
    items,
    lastVisible,
  };
};

const HandMade: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { data, error, isLoading, isFetching, fetchNextPage, hasNextPage } =
    useInfiniteQuery<FetchResponse>({
      queryKey: ["handmadeItems"],
      queryFn: fetchHandmadeItems,
      getNextPageParam: (lastPage) => lastPage.lastVisible,
      staleTime: 1000,
    });

  const purchaseItem = (item: HandmadeItem) => {
    navigation.navigate("Chat", { recipientId: item.ownerId, itemName: item.name });
  };

  const renderItem: ListRenderItem<HandmadeItem> = ({ item }) => (
    <Animated.View style={[styles.itemContainer, fadeInUpStyle]}>
      <Card style={styles.card}>
        <Card.Section
          imageSource={{ uri: item.imageUrl }}
          imageStyle={styles.itemImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemRow}>
            <Ionicons name="pricetag" size={16} color={colors.primary} style={styles.icon} />
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="leaf" size={16} color={colors.secondary} style={styles.icon} />
            <View>
              <Text style={styles.itemCarbonFootprint}>{translate("carbonFootprint")}</Text>
              <Text style={styles.itemCarbonFootprintValue}>{item.carbonFootprint}</Text>
            </View>
          </View>
          <Button
            label={translate("contactSeller")}
            onPress={() => purchaseItem(item)}
            style={styles.buyButton}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const opacity = useSharedValue(0);
  const fadeInUpStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacity.value, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }),
      transform: [{ translateY: withTiming(opacity.value === 1 ? 0 : 20, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }) }],
    };
  });

  useEffect(() => {
    opacity.value = 1;
  }, [opacity]);

  const fadeInDownStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }),
      transform: [{ translateY: withTiming(0, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }) }],
    };
  });

  const loadingRotation = useSharedValue(0);
  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        rotate: `${loadingRotation.value}deg`,
      }],
    };
  });

  useEffect(() => {
    loadingRotation.value = withRepeat(withTiming(360, {
      duration: 1000,
      easing: Easing.linear,
    }), -1, false);
  }, [loadingRotation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, fadeInDownStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate("handmadeItems")}</Text>
      </Animated.View>
      {isLoading && (
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <Ionicons name="reload" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>{translate("loading")}</Text>
        </Animated.View>
      )}
      {error && (
        <Text style={styles.errorText}>
          {translate("fetchError")}
        </Text>
      )}
      {data && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data.pages.flatMap((page) => page.items)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasNextPage && !isFetching) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching ? (
              <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
                <Ionicons name="reload" size={48} color={colors.primary} />
                <Text style={styles.loadingText}>{translate("loadingMore")}</Text>
              </Animated.View>
            ) : null
          }
        />
      )}
      {!data && !isLoading && (
        <Text style={styles.noDataText}>{translate("noHandmadeItems")}</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.backgroundGradientStart,
  },
  title: {
    fontSize: 24,
    fontFamily: "marcellus",
    color: colors.white,
    marginBottom: 20,
    top: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.headerBackground,
    padding: 10,
    borderRadius: 10,
  },
  backButton: {
    marginRight: 10,
  },
  itemContainer: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    elevation: 3,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  itemImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 15,
    backgroundColor: colors.backgroundGradientEnd,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  itemName: {
    fontSize: 20,
    fontFamily: "marcellus",
    color: colors.black,
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
  itemPrice: {
    fontSize: 18,
    color: colors.primary,
  },
  itemCarbonFootprint: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: 'bold'
  },
  itemCarbonFootprintValue: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 5,
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignSelf: "stretch",
  },
  noDataText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.primary,
    marginTop: 10,
  },
});

export default HandMade;
