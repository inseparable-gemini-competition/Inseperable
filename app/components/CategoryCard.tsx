// components/CategoryCard.tsx
import { CustomText } from '@/app/components/CustomText';
import { colors } from '@/app/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';


interface CategoryCardProps {
  title: string;
  imageUrl: any;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imageUrl, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={imageUrl} style={styles.cardImage} />
    <CustomText style={styles.cardText}>{title}</CustomText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 17,
    width: '45%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 70,
    borderRadius: 16,
  },
  cardText: {
    marginTop: 8,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default CategoryCard;