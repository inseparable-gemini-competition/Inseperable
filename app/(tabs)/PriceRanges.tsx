import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PriceRanges = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [prices, setPrices] = useState<Array<{ item: string; price: string }> | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const pickImage = async () => {
    if (hasPermission === null) {
      Alert.alert('Permission required', 'We need permission to access your camera roll.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!(result as any).cancelled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setPrices(null); // Clear previous data
        simulatePriceFetching(result.assets[0].uri); // Simulate fetching price ranges
      } else {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while picking the image.');
      setLoading(false);
    }
  };

  const simulatePriceFetching = (imageUri: string) => {
    setLoading(true);
    setTimeout(() => {
      // Simulate fetching price ranges based on the image
      setPrices([
        { item: 'Coffee', price: '$2 - $5' },
      ]);
      setLoading(false);
    }, 2000); // Simulate a delay for fetching price ranges
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Ranges</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && !loading && <Image source={{ uri: image }} style={styles.image} />}
      {prices && !loading && (
        <FlatList
          data={prices}
          keyExtractor={(item) => item.item}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.item}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          )}
        />
      )}
      {!image && !loading && !prices && <Text style={styles.noDataText}>No image selected</Text>}
      {image && !loading && !prices && <Text style={styles.noDataText}>No price data available</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
  priceText: {
    fontSize: 18,
    color: '#333',
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default PriceRanges;
