import React, { useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  Image,
  TextStyle,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Card, Button } from "react-native-ui-lib";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useInfiniteQuery, useQueryClient } from "react-query";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import {
  getFirestore,
  doc,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import useStore from "@/app/store";
import { CustomText } from "@/app/components/CustomText";
import { useFont } from "@/app/context/fontContext";

interface HandmadeItem {
  id: string;
  name: { original: string; translated?: string };
  price: { original: string; translated?: string };
  imageUrl: string;
  carbonFootprint: { original: string; translated?: string };
  ownerId: string;
  description: { original: string; translated?: string };
}

interface FetchResponse {
  items: HandmadeItem[];
  lastVisible: string | null;
}

interface TranslationUpdate {
  [key: string]: {
    name?: string;
    price?: string;
    carbonFootprint?: string;
    description?: string;
  };
}

const functions = getFunctions();
const getHandmadeItems = httpsCallable<
  { pageParam?: string; language: string; country: string },
  FetchResponse
>(functions, "getHandmadeItems");
const db = getFirestore();

const fetchHandmadeItems = async ({
  pageParam = undefined,
  country = "",
  language = "en",
}: {
  pageParam?: string;
  country: string;
  language: string;
}): Promise<FetchResponse> => {
  const result: HttpsCallableResult<FetchResponse> = await getHandmadeItems({
    pageParam,
    language,
    country,
  });
  return result.data;
};

const HandMade: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const queryClient = useQueryClient();
  const [translationUpdates, setTranslationUpdates] =
    useState<TranslationUpdate>({});
  const { userData } = useStore();
  const country = userData?.country || "";
  const { translate, isRTL, currentLanguage } = useTranslations();
  const { selectedFont, fontSize } = useFont();

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } =
    useInfiniteQuery<FetchResponse, Error>({
      queryKey: ["handmadeItems", country],
      queryFn: ({ pageParam }) =>
        fetchHandmadeItems({
          pageParam: pageParam as string | undefined,
          country,
          language: currentLanguage,
        }),
      getNextPageParam: (lastPage) => lastPage.lastVisible,
      staleTime: 1000,
    });

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    if (data) {
      data.pages
        .flatMap((page) => page.items)
        .forEach((item) => {
          const unsubscribe = onSnapshot(
            doc(db, "products", item.id),
            (doc) => {
              const updatedData = doc.data() as DocumentData | undefined;
              if (updatedData && updatedData.translations) {
                setTranslationUpdates((prev) => ({
                  ...prev,
                  [item.id]: updatedData.translations[currentLanguage],
                }));
              }
            }
          );
          unsubscribes.push(unsubscribe);
        });
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [data, currentLanguage]);

  useEffect(() => {
    if (Object.keys(translationUpdates).length > 0) {
      queryClient.setQueryData<{ pages: { items: HandmadeItem[] }[] }>(
        ["handmadeItems", country],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) => ({
                ...item,
                name: {
                  ...item.name,
                  translated:
                    translationUpdates[item.id]?.name || item.name.translated,
                },
                description: {
                  ...item.description,
                  translated:
                    translationUpdates[item.id]?.description ||
                    item.description.translated,
                },
                price: {
                  ...item.price,
                  translated:
                    translationUpdates[item.id]?.price || item.price.translated,
                },
                carbonFootprint: {
                  ...item.carbonFootprint,
                  translated:
                    translationUpdates[item.id]?.carbonFootprint ||
                    item.carbonFootprint.translated,
                },
              })),
            })),
          };
        }
      );
    }
  }, [translationUpdates, queryClient, country]);

  const purchaseItem = (item: HandmadeItem) => {
    navigation.navigate("Chat", {
      recipientId: item.ownerId,
      itemName: item.name.original,
    });
  };

  const TranslatingText: React.FC<{
    original: string;
    translated?: string;
    style?: TextStyle;
  }> = ({ original, translated, style }) => {
    const [isTranslating, setIsTranslating] = useState(!translated);

    useEffect(() => {
      if (translated) {
        setIsTranslating(false);
      }
    }, [translated]);

    if (isTranslating) {
      return (
        <View>
          <CustomText style={style}>{original}</CustomText>
          <CustomText style={[style, { color: colors.translatedTextLight }]}>
            {translate("translating")}
          </CustomText>
        </View>
      );
    }

    return <CustomText style={style}>{translated || original}</CustomText>;
  };

  const renderItem: ListRenderItem<HandmadeItem> = ({ item }) => (
    <Animated.View style={[styles.itemContainer, fadeInUpStyle]}>
      <Card style={styles.card} elevation={4}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <View style={styles.priceTag}>
            <TranslatingText
              original={item.price.original}
              translated={item.price.translated}
              style={styles.priceText}
            />
          </View>
        </View>
        <View style={styles.cardContent}>
          <TranslatingText
            original={item.name.original}
            translated={item.name.translated}
            style={styles.itemName}
          />
          <View style={styles.itemRow}>
            <Ionicons
              name="leaf"
              size={18}
              color={colors.success}
              style={styles.icon}
            />
            <View>
              <CustomText style={styles.itemCarbonFootprint}>
                {translate("carbonFootprint")}
              </CustomText>
              <TranslatingText
                original={convertMarkdownToPlainText(
                  item.carbonFootprint.original
                )}
                translated={
                  item.carbonFootprint.translated &&
                  convertMarkdownToPlainText(item.carbonFootprint.translated)
                }
                style={styles.carbonFootprintText}
              />
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <TranslatingText
              original={convertMarkdownToPlainText(item.description.original)}
              translated={
                item.description.translated &&
                convertMarkdownToPlainText(item.description.translated)
              }
              style={styles.descriptionText}
            />
          </View>
          <Button
            label={translate("contactSeller")}
            onPress={() => purchaseItem(item)}
            style={styles.buyButton}
            labelStyle={[
              styles.buyButtonLabel,
              { fontFamily: selectedFont, fontSize },
            ]}
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
      transform: [
        {
          translateY: withTiming(opacity.value === 1 ? 0 : 20, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
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
      transform: [
        {
          translateY: withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    };
  });

  const loadingRotation = useSharedValue(0);
  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${loadingRotation.value}deg`,
        },
      ],
    };
  });

  useEffect(() => {
    loadingRotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [loadingRotation]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.header, fadeInDownStyle]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
          <CustomText style={styles.title}>
            {translate("handmadeItems")}
          </CustomText>
        </Animated.View>
        {isLoading && (
          <Animated.View
            style={[styles.loadingContainer, loadingAnimatedStyle]}
          >
            <Ionicons name="reload" size={48} color={colors.primary} />
            <CustomText style={styles.loadingText}>
              {translate("loading")}
            </CustomText>
          </Animated.View>
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
                <Animated.View
                  style={[styles.loadingContainer, loadingAnimatedStyle]}
                >
                  <Ionicons name="reload" size={48} color={colors.primary} />
                  <CustomText style={styles.loadingText}>
                    {translate("loadingMore")}
                  </CustomText>
                </Animated.View>
              ) : null
            }
          />
        )}
        {!data && !isLoading && (
          <CustomText style={styles.noDataText}>
            {translate("noHandmadeItems")}
          </CustomText>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.headerBackground,
  },
  backButton: {
    marginEnd: 16,
  },
  title: {
    fontSize: 20,
    color: colors.white,
  },
  itemContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  imageContainer: {
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  priceTag: {
    position: "absolute",
    top: 10,
    end: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: colors.white,
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 20,
    marginBottom: 8,
    color: colors.dark,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginEnd: 8,
  },
  itemCarbonFootprint: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 2,
  },
  carbonFootprintText: {
    fontSize: 14,
    color: colors.dark,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  buyButtonLabel: {
    fontSize: 16,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondary,
  },
  noDataText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 32,
  },
});

export default HandMade;
