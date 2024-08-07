import React, { useEffect, useState } from "react";
import { FlatList, ListRenderItem, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Card, Button } from "react-native-ui-lib";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/app/theme";
import styles from "./HandMadeStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getFirestore,
  doc,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import useStore from "@/app/store";

interface HandmadeItem {
  id: string;
  name: { original: string; translated?: string };
  price: { original: string; translated?: string };
  imageUrl: string;
  carbonFootprint: { original: string; translated?: string };
  ownerId: string;
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
  const result = await getHandmadeItems({
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

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } =
    useInfiniteQuery<FetchResponse, Error>({
      queryKey: ["handmadeItems", country],
      queryFn: ({ pageParam }) =>
        fetchHandmadeItems({ pageParam, country, language: currentLanguage }),
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
        ["handmadeItems"],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => ({
                ...item,
                name: {
                  ...item.name,
                  translated:
                    translationUpdates[item.id]?.name || item.name.translated,
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
  }, [translationUpdates, queryClient]);

  const purchaseItem = (item: HandmadeItem) => {
    navigation.navigate("Chat", {
      recipientId: item.ownerId,
      itemName: item.name.original,
    });
  };

  const TranslatingText: React.FC<{
    original: string;
    translated?: string;
  }> = ({ original, translated }) => {
    const [isTranslating, setIsTranslating] = useState(!translated);

    useEffect(() => {
      if (translated) {
        setIsTranslating(false);
      }
    }, [translated]);

    if (isTranslating) {
      return (
        <View>
          <Text>{original}</Text>
          <Text>{translate("translating")}</Text>
        </View>
      );
    }

    return <Text>{translated || original}</Text>;
  };

  const renderItem: ListRenderItem<HandmadeItem> = ({ item }) => (
    <Animated.View style={[styles.itemContainer, fadeInUpStyle]}>
      <Card style={styles.card}>
        <Card.Section
          imageSource={{ uri: item.imageUrl }}
          imageStyle={styles.itemImage}
        />
        <View style={styles.cardContent}>
          <TranslatingText
            original={item.name.original}
            translated={item.name.translated}
          />
          <View style={styles.itemRow}>
            <Ionicons
              name="pricetag"
              size={16}
              color={colors.primary}
              style={styles.icon}
            />
            <TranslatingText
              original={item.price.original}
              translated={item.price.translated}
            />
          </View>
          <View style={styles.itemRow}>
            <Ionicons
              name="leaf"
              size={16}
              color={colors.secondary}
              style={styles.icon}
            />
            <View>
              <Text style={styles.itemCarbonFootprint}>
                {translate("carbonFootprint")}
              </Text>
              <TranslatingText
                original={convertMarkdownToPlainText(
                  item.carbonFootprint.original
                )}
                translated={
                  item.carbonFootprint.translated &&
                  convertMarkdownToPlainText(item.carbonFootprint.translated)
                }
              />
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
        <Text style={styles.title}>{translate("handmadeItems")}</Text>
      </Animated.View>
      {isLoading && (
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <Ionicons name="reload" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>{translate("loading")}</Text>
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
                <Text style={styles.loadingText}>
                  {translate("loadingMore")}
                </Text>
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

export default HandMade;
