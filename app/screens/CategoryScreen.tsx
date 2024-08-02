import React from 'react';
import Animated from 'react-native-reanimated';
import { CategoryScreenProps } from '../types';
import { styles } from '@/app/screens/MainStyles';
import CategoryList from '@/app/components/CategoryList';
import HeaderDescription from '@/app/components/HeaderDescription';

const CategoryScreen: React.FC<CategoryScreenProps> = ({
  categories,
  onCategoryPress,
  country,
  description,
  animatedStyle
}) => (
  <>
    <HeaderDescription country={country} description={description} />
    <Animated.View style={[styles.content, animatedStyle]}>
      <CategoryList
        categories={categories}
        onCategoryPress={onCategoryPress}
        description={description}
      />
    </Animated.View>
  </>
);

export default CategoryScreen;