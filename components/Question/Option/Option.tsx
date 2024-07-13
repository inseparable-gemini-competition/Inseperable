import { StyleSheet } from "react-native";
import { Text, TouchableOpacity } from "react-native-ui-lib";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

type Props = {
  option: string;
  onChoose: (value: string) => void;
};

const styles = StyleSheet.create({
  option: {
    backgroundColor: "white",
    borderRadius: 60,
    height: 120,
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    margin: 30,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ translateY: -10 }],
  },
});

const Option = ({ option, onChoose }: Props) => {
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
      <TouchableOpacity style={styles.option} onPress={() => onChoose(option)}>
        <Text>{option}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Option;
