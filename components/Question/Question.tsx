import React, { useState } from "react";
import { View, Text, TextField, Button } from "react-native-ui-lib";
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
    isOpenEnded?: boolean;
  };
  onAnswer: (answer: string) => void;
  onNext: (option: string) => void;
  onPrevious: () => void;
  showPrevious: boolean;
  showNext: boolean;
  currentAnswer: string;
};

const Question = ({
  question,
  onNext,
  onPrevious,
  showPrevious,
  showNext,
  currentAnswer,
}: Props) => {
  const handleOptionSelect = (option: string) => {
    onNext(option);
  };
  const [currentText, setCurrentText] = useState('');

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
          justifyContent: question.options.length ? "space-between" : "center",
          alignItems: "center",
        }}
      >
        {question.options.map((option) => (
          <Option
            key={option.id}
            option={option.option}
            onChoose={handleOptionSelect}
            isSelected={currentAnswer === option.option}
          />
        ))}
        {question.isOpenEnded && (
          <TextField
            placeholder={"Enter your answer here..."}
            floatingPlaceholder
            onChangeText={setCurrentText}
            enableErrors
            validate={["required", (value: string) => value.length > 4]}
            validationMessage={["Field is required"]}
            showCharCounter
            maxLength={30}
            value={currentText}
            style={{
              borderWidth: 1,
              borderColor: colors.primary,
              borderRadius: 10,
              padding: 15,
              marginTop: 20,
              backgroundColor: colors.background,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              width: 350,
              height: 60,
            }}
            placeholderTextColor={colors.placeholder}
            floatingPlaceholderColor={{
              focus: colors.primary,
              default: colors.secondary,
            }}
            text80
            floatingPlaceholderStyle={{
              fontSize: 16,
              fontWeight: "bold",
            }}
          />
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: showPrevious ? "space-between" : "flex-end",
          marginTop: 20,
          marginHorizontal: 20,
        }}
      >
        {showPrevious && <Button label="Previous" onPress={onPrevious} />}
        {showNext && <Button label="Next" onPress={()=>{
            onNext(currentText);
            setCurrentText('');
        }} />}
      </View>
    </View>
  );
};

export default Question;
