import { useState } from "react";
import { View, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/app/components/Question/Question";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { CustomText } from "@/app/components/CustomText";

type Props = {
  onFinish: (params?: {
    setLocalLoading: (loading: boolean) => void;
    result: object;
  }) => void;
};

const Questionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [_, setUserCountry] = useState("");
  const { translate, translations } = useTranslations();
  const {
    generate: generateCountryData,
    isLoading: isLoadingCountryData,
    result: countryDataResult,
  } = useJsonControlledGeneration({
    promptType: "countryData",
  });
  const [localLoading, setLocalLoading] = useState(false);

  const [questions] = useState([
    {
      id: 1,
      question: translate("whereAreYouTravelling"),
      options: [],
      isOpenEnded: true,
    },
  ]);

  const [question, setQuestion] = useState(questions[0]);

  const handleAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = async (option: string) => {
    setUserCountry(option);
    if (option.length === 0) return;
    const updatedAnswers = [...answers, option];
    setAnswers(updatedAnswers);

    generateCountryData({
      country: option,
      currentLanguage: translations.currentLanguage,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestion(questions[currentQuestionIndex - 1]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoadingCountryData) {
    return (
      <View
        style={styles.container}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <CustomText>{translate("recommending")}</CustomText>
      </View>
    );
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps={"handled"}
      contentContainerStyle={styles.container}
    >
      <View>
        {!countryDataResult?.country && question ? (
          <Question
            key={question?.id}
            question={question}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={currentQuestionIndex > 0}
            showNext={question?.isOpenEnded || false}
            currentAnswer={answers[currentQuestionIndex] || ""}
          />
        ) : (
          <>
            {countryDataResult?.country !== "null" && (
              <CustomText style={styles.largeText}>
                {countryDataResult?.country} {countryDataResult?.flag}
              </CustomText>
            )}
            <CustomText style={styles.text}>
              {countryDataResult?.description !== "null"
                ? countryDataResult?.description
                : ""}
            </CustomText>

            <Button
              style={styles.button}
              label={translate("finish")}
              labelStyle={{ fontFamily: "marcellus" }}
              backgroundColor={colors.primary}
              onPress={() => {
                onFinish({
                  result: countryDataResult,
                  setLocalLoading,
                });
              }}
            />
            {localLoading && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginBottom: 20 }}
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Questionnaire;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 15,
    color: colors.black,
    textAlign: "center",
    padding: 10,
    paddingHorizontal: 30,
  },
  button: {
    width: 300,
    alignSelf: "center",
  },
  largeText :{
    fontSize: 70,
    color: colors.black,
    textAlign: "center",
    padding: 10,
  }
});
