// CategoryList.tsx
import React, { useState, memo } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Category } from "@/app/helpers/categories";
import CategoryCard from "@/app/components/CategoryCard";
import { styles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGetUserScore } from "@/hooks/logic/useUserScore";
import { CustomText } from "@/app/components/CustomText";
import { colors } from "@/app/theme";

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
  const { data, isRefetching, isLoading } = useGetUserScore();
  const scoreColor =
    (data?.overallScore || 0) > 5 ? colors.success : colors.danger;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.environmentalScoreContainer}>
        <CustomText style={styles.environmentalScoreLabel}>
          {translate("impactScore")}:
        </CustomText>
        {!isRefetching || isLoading ? (
          <CustomText
            style={[
              styles.environmentalScoreValue,
              {
                color: scoreColor,
              },
            ]}
          >
            {data?.overallScore?.toFixed(2) || 0}/10
          </CustomText>
        ) : (
          <ActivityIndicator />
        )}
        {isLoading && <ActivityIndicator />}
      </View>
      <CustomText style={styles.subtitle}>
        {showFullDescription ? description : description.slice(0, 160) + "..."}
      </CustomText>
      <TouchableOpacity
        onPress={() => setShowFullDescription(!showFullDescription)}
      >
        <CustomText style={styles.seeMoreText}>
          {showFullDescription ? translate("seeLess") : translate("seeMore")}
        </CustomText>
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
