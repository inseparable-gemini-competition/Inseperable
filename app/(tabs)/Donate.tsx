import React, { useState } from 'react';
import { StyleSheet, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Card, Button, LoaderScreen, Image } from 'react-native-ui-lib';
import { useQuery } from '@tanstack/react-query';

interface Organization {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface FetchResponse {
  organizations: Organization[];
  hasMore: boolean;
}

const mockData: { [key: number]: Organization[] } = {
  1: [
    { id: '1', name: 'Local Food Bank', description: 'Providing food to those in need.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINHbq7LXGMIPBs8GXR58cwSrG2haniHVwNg&s' },
    { id: '2', name: 'Community Shelter', description: 'Offering shelter to the homeless.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINHbq7LXGMIPBs8GXR58cwSrG2haniHVwNg&s' },
  ],
  2: [
    { id: '3', name: 'Education Fund', description: 'Supporting education initiatives.', image: 'https://www.tasteofhome.com/wp-content/uploads/2020/04/GettyImages-467506706.jpg?fit=700%2C800' },
    { id: '4', name: 'Health Organization', description: 'Providing medical supplies and services.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINHbq7LXGMIPBs8GXR58cwSrG2haniHVwNg&s' },
  ],
};

const fetchOrganizations = async ({ queryKey }: any): Promise<FetchResponse> => {
  const [_key, page] = queryKey;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        organizations: mockData[page],
        hasMore: page < 2,
      });
    }, 1000);
  });
};

const Donate = () => {
  const [page, setPage] = useState(1);

  const { data, error, isLoading, isFetching } = useQuery<FetchResponse>({
    queryKey: ['organizations', page],
    queryFn: fetchOrganizations,
    staleTime: 1000, 
    });

  const donateToOrganization = (organization: Organization) => {
    Alert.alert('Donate', `You have donated to: ${organization.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Donate</Text>
      {isLoading && <LoaderScreen color="blue" message="Loading..." overlay />}
      {error && <Text style={styles.errorText}>Something went wrong while fetching organizations.</Text>}
      {data && (
        <FlatList
          data={(data as any).organizations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Card style={styles.card}>
                <Card.Section imageSource={{ uri: item.image }} imageStyle={styles.itemImage} />
                <Card.Section content={[{ text: item.name, text70: true, grey10: true }]} contentStyle={styles.itemDetails} />
                <Card.Section content={[{ text: item.description, text80: true, grey20: true }]} contentStyle={styles.itemDetails} />
              </Card>
              <Button label="Donate" onPress={() => donateToOrganization(item)} style={styles.donateButton} />
            </View>
          )}
          ListFooterComponent={
            <View style={styles.pagination}>
              <Button
                label="Previous"
                disabled={page === 1 || isFetching}
                onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              />
              <Button label="Next" disabled={!data.hasMore || isFetching} onPress={() => setPage((prev) => prev + 1)} />
            </View>
          }
        />
      )}
      {!data && !isLoading && <Text style={styles.noDataText}>No organizations available</Text>}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
});

export default Donate;
