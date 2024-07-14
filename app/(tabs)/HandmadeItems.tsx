// src/components/HandMade.tsx
import React from 'react';
import { StyleSheet, Alert, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Button, LoaderScreen } from 'react-native-ui-lib';
import { useInfiniteQuery, InfiniteQueryObserverResult, InfiniteData } from '@tanstack/react-query';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { db } from '@/app/helpers/firebaseConfig';

interface HandmadeItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  carbonPrint: string;
  ownerId: string; // Added ownerId field
}

interface FetchResponse {
  items: HandmadeItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

const fetchHandmadeItems = async ({ pageParam = undefined }): Promise<FetchResponse> => {
  console.log('Fetching items with pageParam:', pageParam);
  const itemsQuery = query(
    collection(db, 'products'),
    orderBy('createdAt'),
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
      console.error('Document missing createdAt:', doc.id);
    }
  });

  if (!querySnapshot.empty) {
    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  }

  console.log('Fetched items:', items);
  return {
    items,
    lastVisible,
  };
};

const HandMade: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const {
    data,
    error,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<FetchResponse>({
    queryKey: ['handmadeItems'],
    queryFn: fetchHandmadeItems,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000, // This keeps the data fresh for 1 second
  });

  const purchaseItem = (item: HandmadeItem) => {
    Alert.alert(
      'Purchase Item',
      `You want to ask about: ${item.name} with price ${item.price}`,
      [
        { text: 'Contact seller', onPress: () => navigation.navigate('Chat', { recipientId: item.ownerId }) }
      ]
    );
  };

  const renderItem: ListRenderItem<HandmadeItem> = ({ item }) => (
    <View style={styles.itemContainer}>
      <Card style={styles.card}>
        <Card.Section
          imageSource={{ uri: item.imageUrl }}
          imageStyle={styles.itemImage}
        />
        <Card.Section
          content={[
            { text: item.name, text70: true, grey10: true },
            { text: item.price, text80: true, grey20: true },
            { text: `Carbon Footprint: ${item.carbonPrint}`, text90: true, grey30: true },
          ]}
          contentStyle={styles.itemDetails}
        />
      </Card>
      <Button label="Contact Seller" onPress={() => purchaseItem(item)} style={styles.buyButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Handmade Items</Text>
      {isLoading && <LoaderScreen color="blue" message="Loading..." overlay />}
      {error && <Text style={styles.errorText}>Something went wrong while fetching handmade items.</Text>}
      {data && (
        <FlatList
          data={data.pages.flatMap((page) => page.items)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasNextPage && !isFetching) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetching ? <LoaderScreen color="blue" message="Loading more..." overlay /> : null}
        />
      )}
      {!data && !isLoading && <Text style={styles.noDataText}>No handmade items available</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    elevation: 3,
    paddingBottom: 10,
  },
  itemImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  itemDetails: {
    padding: 15,
    alignItems: 'center',
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: '#007aff',
    alignSelf: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default HandMade;
