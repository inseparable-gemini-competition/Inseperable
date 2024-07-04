import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const Identify = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [identificationResult, setIdentificationResult] = useState<string | null>(null);

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

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setIdentificationResult(null); // Clear previous result
        simulateIdentification(result.assets[0].uri); // Simulate identification
      } else {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while picking the image.');
      setLoading(false);
    }
  };

  const simulateIdentification = (imageUri: string) => {
    setLoading(true);
    setTimeout(() => {
      // Simulate a fake identification result
      setIdentificationResult('This is a famous statue of Liberty located in New York City, USA.');
      setLoading(false);
    }, 2000); // Simulate a delay for the identification process
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identify Statues</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && !loading && <Image source={{ uri: image }} style={styles.image} />}
      {identificationResult && (
        <Text style={styles.resultText}>{identificationResult}</Text>
      )}
      {!image && !loading && !identificationResult && <Text style={styles.noImageText}>No image selected</Text>}
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
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noImageText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default Identify;
