import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Button, LoaderScreen, Image } from 'react-native-ui-lib';

const DonateScreen = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; description: string; image: string }> | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      // Simulate an API call to fetch organizations
      setTimeout(() => {
        setOrganizations([
          { id: '1', name: 'Local Food Bank', description: 'Providing food to those in need.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINHbq7LXGMIPBs8GXR58cwSrG2haniHVwNg&s' },
          { id: '2', name: 'Community Shelter', description: 'Offering shelter to the homeless.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINHbq7LXGMIPBs8GXR58cwSrG2haniHVwNg&s' },
          { id: '3', name: 'Education Fund', description: 'Supporting education initiatives.', image: 'https://www.tasteofhome.com/wp-content/uploads/2020/04/GettyImages-467506706.jpg?fit=700%2C800' },
        ]);
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching organizations.');
      setLoading(false);
    }
  };

  const donateToOrganization = (organization: { id: string; name: string; description: string }) => {
    Alert.alert('Donate', `You have donated to: ${organization.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Donate</Text>
      {loading && <LoaderScreen color="blue" message="Loading..." overlay />}
      {organizations && (
        <FlatList
          data={organizations}
          keyExtractor={(item) => item.id}
  
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Card style={styles.card}>
                <Card.Section
                  imageSource={{ uri: item.image }}
                  imageStyle={styles.itemImage}
                />
                <Card.Section
                  content={[{ text: item.name, text70: true, grey10: true }]}
                  contentStyle={styles.itemDetails}
                />
                <Card.Section
                  content={[{ text: item.description, text80: true, grey20: true }]}
                  contentStyle={styles.itemDetails}
                />
              </Card>
              <Button label="Donate" onPress={() => donateToOrganization(item)} style={styles.donateButton} />
            </View>
          )}
        />
      )}
      {!organizations && !loading && <Text style={styles.noDataText}>No organizations available</Text>}
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
  },
  itemImage: {
    width: '100%',
    height: 300,
  },
  itemDetails: {
    padding: 15,
    alignItems: 'center',
  },
  donateButton: {
    marginTop: 10,
    backgroundColor: '#007aff',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default DonateScreen;
