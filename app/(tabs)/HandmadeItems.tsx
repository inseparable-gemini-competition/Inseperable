import React from 'react';
import { StyleSheet, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Button, LoaderScreen } from 'react-native-ui-lib';
import { useInfiniteQuery } from '@tanstack/react-query';

interface HandmadeItem {
  id: string;
  name: string;
  price: string;
  image: string;
  carbonPrint: string;
}

interface FetchResponse {
  items: HandmadeItem[];
  hasMore: boolean;
}

const mockData: { [key: number]: HandmadeItem[] } = {
  1: [
    { id: '1', name: 'Handmade Vase', price: '$25', image: 'https://market99.com/cdn/shop/products/blue-ceramic-curvy-vase-engraved-floral-pattern-flower-holder-vases-1-29122137587882.jpg?v=1697016195', carbonPrint: '2 kg CO2' },
    { id: '2', name: 'Woven Basket', price: '$30', image: 'https://m.media-amazon.com/images/I/71n+LLRWA5L.jpg', carbonPrint: '3 kg CO2' },
  ],
  2: [
    { id: '3', name: 'Knitted Scarf', price: '$15', image: 'https://www.wowthankyou.co.uk/wp-content/uploads/2021/01/Reasons-to-buy-handmade.jpg', carbonPrint: '1 kg CO2' },
    { id: '4', name: 'Handmade Jewelry', price: '$45', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQysEwhvM0UTlM4kZpeD3Y1P2rUM5ijljSYhA&s', carbonPrint: '1.5 kg CO2' },
  ],
};

const fetchHandmadeItems = async ({ pageParam = 1 }): Promise<FetchResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: mockData[pageParam],
        hasMore: pageParam < 2,
      });
    }, 1000);
  });
};

const HandMade = () => {
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
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    staleTime: 1000, // This keeps the data fresh for 1 second
  });

  const purchaseItem = (item: HandmadeItem) => {
    Alert.alert('Purchase Item', `You have purchased: ${item.name} for ${item.price}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Handmade Items</Text>
      {isLoading && <LoaderScreen color="blue" message="Loading..." overlay />}
      {error && <Text style={styles.errorText}>Something went wrong while fetching handmade items.</Text>}
      {data && (
        <FlatList
          data={data.pages.flatMap((page: any) => page.items)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Card style={styles.card}>
                <Card.Section
                  imageSource={{ uri: item.image }}
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
              <Button label="Buy" onPress={() => purchaseItem(item)} style={styles.buyButton} />
            </View>
          )}
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
