import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/app/theme";


interface PaginationProps {
  dotsLength: number;
  activeDotIndex: number;
}


const Pagination: React.FC<PaginationProps> = ({ dotsLength, activeDotIndex }) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: dotsLength }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            activeDotIndex === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.info,
  },
  inactiveDot: {
    backgroundColor: colors.primary,
  },
});

export default Pagination;
