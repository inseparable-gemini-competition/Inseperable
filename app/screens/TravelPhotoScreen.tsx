import React, { useState, useEffect, useCallback } from "react";
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
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useMutation } from "react-query";
import { db, auth, storage, functions } from "@/app/helpers/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { colors } from "@/app/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import { useTranslations } from "@/hooks/ui/useTranslations";
import useStore from "@/app/store";
import { debounce } from "@/app/helpers/debounce";
import { httpsCallable } from "firebase/functions";

// Types
interface Photo {
  id: string;
  url: string;
  captions: string[];
  description: string;
  timestamp: number;
}

const uploadAndAnalyzePhoto = async ({
  uri,
  userId,
  setProgress,
}: {
  uri: string;
  userId: string;
  setProgress: (progress: number) => void;
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
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          if (progress === 100) {
            resolve("Generating your beautiful captions...");
          }
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

const TravelPhotoScreen: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [originalPhotos, setOriginalPhotos] = useState<Photo[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { translate } = useTranslations();
  const { userData } = useStore();

  useEffect(() => {
    if (!userData?.id) return;

    setLoading(true);

    const q = query(
      collection(db, "photos"),
      where("userId", "==", userData.id),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newPhotos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];
        setPhotos(newPhotos);
        setOriginalPhotos(newPhotos);
        setLastVisible(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
        setLoading(false);
        setUploading(false);
      },
      (error) => {
        console.error("Error fetching photos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.id]);

  const uploadMutation = useMutation(
    (data: { uri: string; userId: string }) =>
      uploadAndAnalyzePhoto({ ...data, setProgress }),
    {
      onError: (error: any) => {
        setUploading(false);
        Alert.alert("Error", `Failed to upload image: ${error.message}`);
      },
    }
  );

  let statusMessage = "";
  if (loading) {
    statusMessage = "Loading your beautiful memories...";
  } else if (uploading) {
    statusMessage = progress === 100 ? "Generating your beautiful captions..." : `Uploading your beautiful memories... ${progress.toFixed(2)}%`;
  } else if (uploadMutation.isLoading) {
    statusMessage = "Processing your upload...";
  }

  const handleUploadImage = async (userId: string): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploading(true);
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
          ? { message: `${message}\n${photo.url}` }
          : { message: message, url: photo.url };

      await Share.share(shareContent);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const searchPhotos = useCallback(
    async (query: string) => {
      if (!userData?.id) return;
      setLoading(true);

      try {
        const searchPhotosCallable = httpsCallable(functions, "searchPhotos");
        const response = await searchPhotosCallable({
          query,
          userId: userData.id,
        });

        const data = response.data as {
          photos: Photo[];
          lastVisible: string | null;
        };

        setPhotos(data.photos);
        setLoading(false);
      } catch (error: any) {
        console.error("Error searching photos:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to search photos");
      }
    },
    [userData?.id]
  );

  const debouncedSearch = useCallback(debounce(searchPhotos, 500), [searchPhotos]);

  useEffect(() => {
    if (searchQuery.length > 3) {
      debouncedSearch(searchQuery);
    } else {
      setPhotos(originalPhotos);
    }
  }, [searchQuery, debouncedSearch, originalPhotos]);

  const loadMorePhotos = async () => {
    if (loading || searchQuery.length > 3 || !lastVisible) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, "photos"),
        where("userId", "==", userData.id),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const newPhotos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Photo[];

      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
      setOriginalPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
      setLastVisible(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
      setLoading(false);
    } catch (error) {
      console.error("Error loading more photos:", error);
      setLoading(false);
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
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {(loading || uploading || uploadMutation.isLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
            <Text style={styles.loadingText}>
              {statusMessage}
            </Text>
          </View>
        )}

        {photos.length === 0 && !loading && (
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
        )}

        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item: Photo) => item.id}
          contentContainerStyle={styles.photoList}
          onEndReached={loadMorePhotos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator color={colors.primary} /> : null
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
  loadingContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.primary,
    marginTop: 10,
    fontFamily: "marcellus",
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
