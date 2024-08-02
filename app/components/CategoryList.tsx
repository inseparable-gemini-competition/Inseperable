// CategoryList.tsx
import React, { useState, memo } from "react";
import { FlatList, View, Text, TouchableOpacity } from "react-native";
import { Category } from "@/app/helpers/categories";
import CategoryCard from "@/app/components/CategoryCard";
import { styles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";

interface CategoryListProps {
  categories: (translate: Function) => Category[];
  onCategoryPress: (category: string) => void;
  description: string;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategoryPress,
  description,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { translate } = useTranslations();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.subtitle}>
        {showFullDescription ? description : description.slice(0, 160) + "..."}
      </Text>
      <TouchableOpacity
        onPress={() => setShowFullDescription(!showFullDescription)}
      >
        <Text style={styles.seeMoreText}>
          {showFullDescription ? translate("seeLess") : translate("seeMore")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryCard
      title={translate(item.title)}
      imageUrl={item.imageUrl}
      onPress={() => onCategoryPress(item.command)}
    />
  );

  const MemoizedCategoryItem = memo(renderCategoryItem);

  return (
    <FlatList
      data={categories(translate)}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => <MemoizedCategoryItem item={item} />}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.cardContainer}
      contentContainerStyle={styles.flatListContentContainer}
      style={{ flex: 1 }}
    />
  );
};

export default CategoryList;
