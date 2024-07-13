import { View, Text, RadioGroup, RadioButton } from "react-native-ui-lib";
import Option from "./Option/Option";
import { colors } from "@/app/theme";

type Props = {
  question: {
    id: number;
    question: string;
    options: {
      id: number;
      option: string;
    }[];
  };
  onAnswer: (value: string) => void;
};

const Question = ({ question, onAnswer }: Props) => {
  return (
    <View key={question.id}>
      <Text
        style={{
          fontSize: 35,
          margin: 20,
          color: colors.black,
        }}
      >
        {question.question}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {question.options.map((option) => (
          <Option key={option.id} option={option.option} onChoose={onAnswer} />
        ))}
      </View>
    </View>
  );
};

export default Question;
