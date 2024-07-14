import React from "react";
import { StyleSheet } from "react-native";
import { Text, TouchableOpacity, View } from "react-native-ui-lib";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { colors } from "@/app/theme";

type Props = {
  option: string;
  onChoose: (value: string) => void;
  isSelected: boolean;
};

const Option = ({ option, onChoose, isSelected }: Props) => {
  const moveAnimation = useSharedValue(0);
  moveAnimation.value = withRepeat(
    withSequence(
      withTiming(10, { duration: 80 }),
      withTiming(0, { duration: 80 })
    ),
    2
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: moveAnimation.value,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={[styles.optionWrapper, isSelected && styles.selectedOption]}>
        <TouchableOpacity style={styles.option} onPress={() => onChoose(option)}>
          <Text>{option}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    margin: 30,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 60,
    height: 120,
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedOption: {
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 60,
    padding: 0, 
  },
});

export default Option;
