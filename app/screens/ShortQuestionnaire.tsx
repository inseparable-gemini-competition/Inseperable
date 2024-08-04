import { useState } from "react";
import { View, Text, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/app/components/Question/Question";
import { ActivityIndicator, ScrollView } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useTranslations } from "@/hooks/ui/useTranslations";

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
      question: translate("whereAreYouNow"),
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
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ fontFamily: "marcellus" }}>
          {translate("recommending")}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps={"handled"}
      contentContainerStyle={{
        justifyContent: "center",
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: colors.background,
        paddingVertical: 20,
      }}
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
              <Text
                style={{
                  fontSize: 70,
                  color: colors.black,
                  textAlign: "center",
                  padding: 10,
                  fontFamily: "marcellus",
                }}
              >
                {countryDataResult?.country} {countryDataResult?.flag}
              </Text>
            )}
            <Text
              style={{
                fontSize: 15,
                color: colors.black,
                textAlign: "center",
                fontFamily: "marcellus",
                padding: 10,
                paddingHorizontal: 30,
              }}
            >
              {countryDataResult?.description !== "null"
                ? countryDataResult?.description
                : ""}
            </Text>

            <Button
              style={{ width: 300, alignSelf: "center" }}
              label={translate("finish")}
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
