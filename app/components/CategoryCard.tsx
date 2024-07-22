// components/CategoryCard.tsx
import { colors } from '@/app/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-ui-lib';

interface CategoryCardProps {
  title: string;
  imageUrl: any;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imageUrl, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={imageUrl} style={styles.cardImage} />
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '42%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 70,
    borderRadius: 16,
  },
  cardText: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: 'marcellus',
  },
});

export default CategoryCard;