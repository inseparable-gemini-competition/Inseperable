import React, { useState, useEffect } from "react";
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Dimensions,
  Platform,
} from "react-native";
import { View, Text } from "react-native-ui-lib";
import * as ImagePicker from "expo-image-picker";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useInfiniteQuery, useMutation } from "react-query";
import { db, auth, functions, storage } from "@/app/helpers/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { colors } from "@/app/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import { useTranslations } from "@/hooks/ui/useTranslations";
import useStore from "@/app/store";

// Types
interface Photo {
  id: string;
  url: string;
  captions: string[];
  description: string;
  timestamp: number;
}

interface PhotosResponse {
  photos: Photo[];
  lastVisible: any;
}

// API functions
const fetchPhotos = async ({
  pageParam = null,
  userId,
}: {
  pageParam: any;
  userId: string;
}): Promise<PhotosResponse> => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
  if (!userId) {
    throw new Error("userId is required for fetchPhotos");
  }
  const photosRef = collection(db, "photos");
  let q = query(
    photosRef,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(20)
  );

  if (pageParam) {
    q = query(q, startAfter(pageParam));
  }

  const snapshot = await getDocs(q);
  const photos = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Photo)
  );

  return {
    photos,
    lastVisible: snapshot.docs[snapshot.docs.length - 1],
  };
};

const uploadAndAnalyzePhoto = async ({
  uri,
  userId,
}: {
  uri: string;
  userId: string;
}): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
  if (!userId) {
    throw new Error("userId is required for uploadAndAnalyzePhoto");
  }

  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `photos/${userId}/${filename}`);

    const metadata = {
      contentType: "image/jpeg",
      customMetadata: {
        userId,
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress monitoring can be added here if needed
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const searchPhotos = async ({
  pageParam = null,
  queryKey,
  userId,
}: {
  pageParam: any;
  userId: string;
  queryKey: (string | null)[];
}): Promise<PhotosResponse> => {
  if (!userId) {
    throw new Error("userId is required for searchPhotos");
  }

  const [_key, query] = queryKey;
  const searchPhotosFunction = httpsCallable(functions, "searchPhotos");
  const result = await searchPhotosFunction({
    query,
    lastVisible: pageParam,
    userId,
    pageSize: 20,
  });
  return result.data as PhotosResponse;
};

// Custom hook
const usePhotos = (searchQuery: string) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const { userData } = useStore();

  const infiniteQuery = useInfiniteQuery<PhotosResponse, Error>(
    ["photos", searchQuery, userData?.id],
    ({ pageParam, queryKey }) => {
      const [_, __, userId = ""] = queryKey;
      if (!userId) throw new Error("User ID is not available");

      return searchQuery
        ? searchPhotos({ pageParam, queryKey: [_, searchQuery], userId })
        : fetchPhotos({ pageParam, userId });
    },
    {
      getNextPageParam: (lastPage) => lastPage.lastVisible,
      enabled: !!userData?.id,
    }
  );

  const uploadMutation = useMutation(uploadAndAnalyzePhoto, {
    onSuccess: () => {
      setInternalLoading(true);
      setTimeout(() => {
        infiniteQuery.refetch();
        setInternalLoading(false);
      }, 8000);
    },
    onError: (error: any) => {
      Alert.alert("Error", `Failed to upload image: ${error.message}`);
    },
  });

  return { ...infiniteQuery, uploadMutation, internalLoading };
};

// Component
const TravelPhotoScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>(searchQuery);
  const { translate } = useTranslations();
  const { userData } = useStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    uploadMutation,
    isFetching,
    internalLoading,
  } = usePhotos(debouncedQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Sorry, we need camera roll permissions to upload photos."
        );
      }
    })();
  }, []);

  const handleUploadImage = async (userId: string): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadMutation.mutateAsync({
          uri: result.assets[0].uri,
          userId: userId,
        });
      }
    } catch (error: any) {
      console.error("Error picking or uploading image:", error);
      Alert.alert("Error", `Failed to upload image: ${error.message}`);
    }
  };

  const handleShare = async (photo: Photo, caption?: string) => {
    try {
      const message = caption
        ? `${caption}\n\nCheck out this photo from my travels!`
        : `Check out this photo from my travels! ${photo.captions?.[0]}`;

      const shareContent =
        Platform.OS === "android"
          ? { message: `${message}\n${photo.url}` } // Combine message and URL for Android
          : { message: message, url: photo.url };

      await Share.share(shareContent);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderPhoto = ({ item }: { item: Photo }): React.ReactElement => (
    <View style={styles.photoCard}>
      <FastImage source={{ uri: item.url }} style={styles.photoImage} />
      <Text style={styles.photoDescription}>
        {convertMarkdownToPlainText(item.description)}
      </Text>
      {item.captions?.map((caption: string, index: number) => (
        <View key={index} style={styles.captionContainer}>
          <Text style={styles.photoCaption}>{caption}</Text>
          <TouchableOpacity
            onPress={() => handleShare(item, caption)}
            style={styles.shareCaptionButton}
          >
            <FontAwesome name="share-alt" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.photoTimestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={() => handleShare(item)}
        style={styles.shareButton}
      >
        <FontAwesome name="share-alt" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const allPhotos = data ? data.pages.flatMap((page) => page.photos) : [];

  if (!userData?.id) {
    return (
      <View style={styles.noPhotosContainer}>
        <Text style={styles.noPhotosText}>
          {translate("userDataNotAvailable")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>{translate("travelMemories")}</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadImage(userData.id)}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={24}
              color={colors.white}
            />
            <Text style={styles.uploadButtonText}>
              {translate("uploadPhoto")}
            </Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={translate("searchPhotos")}
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              onPress={() => setDebouncedQuery(searchQuery)}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {(isLoading ||
          uploadMutation.isLoading ||
          isFetching ||
          internalLoading) && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        )}

        {error && (
          <Text style={styles.errorText}>
            {error.message || translate("anErrorOccurred")}
          </Text>
        )}

        <FlatList
          data={allPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item: Photo) => item.id}
          contentContainerStyle={styles.photoList}
          ListEmptyComponent={
            <View style={styles.noPhotosContainer}>
              <Ionicons
                name="images-outline"
                size={50}
                color={colors.secondary}
              />
              <Text style={styles.noPhotosText}>
                {translate("noPhotosFound")}
              </Text>
            </View>
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} />
            ) : null
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.headerBackground,
    padding: 16,
    alignItems: "center",
  },
  headerText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "marcellus",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    fontFamily: "marcellus",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 25,
    marginLeft: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.dark,
    fontFamily: "marcellus",
  },
  searchButton: {
    padding: 8,
  },
  loader: {
    marginTop: 20,
  },
  photoList: {
    padding: 16,
  },
  photoCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoImage: {
    width: "100%",
    height: width * 0.6,
    resizeMode: "cover",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: "flex-end",
  },
  photoDescription: {
    fontSize: 18,
    color: colors.black,
    marginBottom: 8,
    fontFamily: "marcellus",
    padding: 16,
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  photoCaption: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "marcellus",
    flex: 1,
  },
  shareCaptionButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 6,
    marginLeft: 8,
  },
  photoTimestamp: {
    fontSize: 14,
    color: colors.light,
    marginTop: 8,
    fontFamily: "marcellus",
  },
  shareButton: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  noPhotosContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  noPhotosText: {
    color: colors.secondary,
    fontSize: 18,
    marginTop: 10,
    fontFamily: "marcellus",
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
    marginVertical: 10,
    fontFamily: "marcellus",
  },
});

export default TravelPhotoScreen;
