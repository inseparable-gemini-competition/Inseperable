import React, { useState } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Button, LoaderScreen } from 'react-native-ui-lib';
import { useQuery } from '@tanstack/react-query';

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
    { id: '3', name: 'Woven Basket', price: '$30', image: 'https://m.media-amazon.com/images/I/71n+LLRWA5L.jpg', carbonPrint: '3 kg CO2' },
    { id: '4', name: 'Handmade Vase', price: '$25', image: 'https://market99.com/cdn/shop/products/blue-ceramic-curvy-vase-engraved-floral-pattern-flower-holder-vases-1-29122137587882.jpg?v=1697016195', carbonPrint: '2 kg CO2' },
  ],
};

const fetchHandmadeItems = async ({ queryKey }: any): Promise<FetchResponse> => {
  const [_key, page] = queryKey;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: mockData[page],
        hasMore: page < 2,
      });
    }, 1000);
  });
};

const HandMade = () => {
  const [page, setPage] = useState(1);

  const { data, error, isLoading, isFetching } = useQuery<FetchResponse>({
    queryKey: ['handmadeItems', page],
    queryFn: fetchHandmadeItems,
    staleTime: 1000, // This keeps the data fresh for 1 second
  });

  const purchaseItem = (item: HandmadeItem) => {
    Alert.alert('Purchase Item', `You have purchased: ${item.name} for ${item.price}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Handmade Items</Text>
        {isLoading && <LoaderScreen color="blue" message="Loading..." overlay />}
        {error && <Text style={styles.errorText}>Something went wrong while fetching handmade items.</Text>}
        {data && data.items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
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
        ))}
        {!data && !isLoading && <Text style={styles.noDataText}>No handmade items available</Text>}
        {data && (
          <View style={styles.pagination}>
            <Button
              label="Previous"
              disabled={page === 1 || isFetching}
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
            />
            <Button label="Next" disabled={!data.hasMore || isFetching} onPress={() => setPage((prev) => prev + 1)} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    alignItems: 'center',
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    width: '100%',
  },
});

export default HandMade;
