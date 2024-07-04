import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Image, Button, LoaderScreen } from 'react-native-ui-lib';

const BuyScreen = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<Array<{ id: string; name: string; price: string; image: string; carbonPrint: string }> | null>(null);

  useEffect(() => {
    fetchHandmadeItems();
  }, []);

  const fetchHandmadeItems = async () => {
    setLoading(true);
    try {
      // Simulate an API call to fetch handmade items
      setTimeout(() => {
        setItems([
          { id: '1', name: 'Handmade Vase', price: '$25', image: 'https://market99.com/cdn/shop/products/blue-ceramic-curvy-vase-engraved-floral-pattern-flower-holder-vases-1-29122137587882.jpg?v=1697016195', carbonPrint: '2 kg CO2' },
          { id: '2', name: 'Woven Basket', price: '$30', image: 'https://m.media-amazon.com/images/I/71n+LLRWA5L.jpg', carbonPrint: '3 kg CO2' },
          { id: '3', name: 'Knitted Scarf', price: '$15', image: 'https://www.wowthankyou.co.uk/wp-content/uploads/2021/01/Reasons-to-buy-handmade.jpg', carbonPrint: '1 kg CO2' },
        ]);
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching handmade items.');
      setLoading(false);
    }
  };

  const purchaseItem = (item: { id: string; name: string; price: string }) => {
    Alert.alert('Purchase Item', `You have purchased: ${item.name} for ${item.price}`);
  };

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Handmade Items</Text>
      {loading && <LoaderScreen color="blue" message="Loading..." overlay />}
      {items && items.map(item => (
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
      {!items && !loading && <Text style={styles.noDataText}>No handmade items available</Text>}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  },
  itemImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 15,
    alignItems: 'center',
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: '#007aff',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default BuyScreen;
