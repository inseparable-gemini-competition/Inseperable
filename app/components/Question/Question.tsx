import React, { useState } from "react";
import { View, TextField, Button } from "react-native-ui-lib";
import Option from "./Option/Option";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { CustomText } from "@/app/components/CustomText";
import { useFont } from "@/app/context/fontContext";


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
  const { translate } = useTranslations();

  //seleted font
 const {selectedFont} = useFont();

  const handleOptionSelect = (option: string) => {
    onNext(option);
  };
  const [currentText, setCurrentText] = useState("");

  return (
    <View key={question?.id}>
      <CustomText
        style={{
          fontSize: 35,
          margin: 15,
          color: colors.black,
          textAlign: 'left'
        }}
      >
        {question?.question}
      </CustomText>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: question?.options?.length
            ? "space-between"
            : "center",
          alignItems: "center",
        }}
      >
        {question?.options?.map((option) => (
          <Option
            key={option.id}
            option={option.option}
            onChoose={handleOptionSelect}
            isSelected={currentAnswer === option.option}
          />
        ))}
        {question?.isOpenEnded && !question?.options?.length && (
          <TextField
            placeholder={translate("enterYourAnswerHere")}
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
              fontFamily: "marcellus",
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
              fontFamily: "marcellus",
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
        {showPrevious && (
          <Button
          label={translate("previous")}
            backgroundColor={colors.primary}
            onPress={onPrevious}
            labelStyle={{fontFamily: selectedFont}}
          />
        )}
        {showNext && (
          <Button
            label={translate("next")}
            labelStyle={{fontFamily: selectedFont}}
            backgroundColor={colors.primary}
            onPress={() => {
              onNext(currentText);
              setCurrentText("");
            }}
          />
        )}
      </View>
    </View>
  );
};

export default Question;
