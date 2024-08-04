import { useCallback, useEffect, useState } from "react";
import { View, Text, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/app/components/Question/Question";
import { ActivityIndicator, ScrollView } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { convertJSONToObject } from "@/app/helpers/questionnaireHelpers";
import { useGenerateContent } from "@/hooks/gemini/useGeminiStream";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useNavigation } from "expo-router";

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
  const { translate, setTranslations, setCurrentLanguage, translations } =
    useTranslations();
  const [localLoading, setLocalLoading] = useState(false);

  const { navigate } = useNavigation();

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: translate("whereAreYouBased"),
      options: [],
      isOpenEnded: true,
    },
    {
      id: 2,
      question: translate("areYouCurrentlyTraveling"),
      options: [
        { id: 1, option: translate("yes") },
        { id: 2, option: translate("no") },
      ],
    },
  ]);

  const {
    generate: generateCountryRecommendation,
    isLoading,
    result,
  } = useJsonControlledGeneration({
    promptType: "countryRecommendation",
  });
  const { sendMessage: sendAnswer, isLoading: isLoadingNextQuestion } =
    useGenerateContent({
      promptType: "nextQuestionCountry",
      inputData: { questions, answers },
      onSuccess: (nextQuestion) => {
        const updatedQuestions = [
          ...questions,
          convertJSONToObject(nextQuestion),
        ];
        updatedQuestions[0] = {
          id: 1,
          question: translate("whereAreYouBased"),
          options: [],
          isOpenEnded: true,
        };
        updatedQuestions[1] = {
          id: 2,
          question: translate("areYouCurrentlyTraveling"),
          options: [
            { id: 1, option: translate("yes") },
            { id: 2, option: translate("no") },
          ],
        };

        setQuestions(updatedQuestions as any);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestion(updatedQuestions[currentQuestionIndex + 1]);
      },
    });

  const onTranslationSuccess = useCallback(
    (data: any) => {
      setTranslations({
        en: translations.en,
        [data.baseLanguage]: data.translations,
        isRTL: data.isRTl,
      });
      setCurrentLanguage(data.baseLanguage);
    },
    [answers, translations]
  );

  const onPriorityTranslationSuccess = useCallback(
    (data: any) => {
      onTranslationSuccess(data);
      setAnswers((currentAnswers) => {
        if (currentAnswers.length > 0) {
          sendAnswer(currentAnswers[0]);
        }
        return currentAnswers;
      });
      setUserCountry((latestUserCountry) => {
        generateTranslations({
          country: latestUserCountry,
        });
        return latestUserCountry; // Return the current value to not change the state
      });
    },
    [answers, translations]
  );

  const { generate: generateTranslations } = useJsonControlledGeneration({
    promptType: "translateApp",
    onSuccess: onTranslationSuccess,
  });

  const {
    generate: generatePriorityTranslations,
    isLoading: isLoadingPriorityTranslation,
  } = useJsonControlledGeneration({
    promptType: "translatePriority",
    onSuccess: onPriorityTranslationSuccess,
  });

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

    if (currentQuestionIndex === 0) {
      generatePriorityTranslations({
        country: option,
      });
    } else if (currentQuestionIndex === 1 && option === translate("yes")) {
      navigate("ShortQuestionnaire");
    } else if (currentQuestionIndex < 7) {
      sendAnswer(option);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      generateCountryRecommendation({
        questions,
        answers: updatedAnswers,
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestion(questions[currentQuestionIndex - 1]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoadingNextQuestion || isLoadingPriorityTranslation) {
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
          {isLoadingPriorityTranslation
            ? translate("DetectingYourNativeLanguage")
            : translate("fetchingNextQuestion")}
        </Text>
      </View>
    );
  } else if (isLoading) {
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
        {!result?.country && !result?.plan && question ? (
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
            {result?.country !== "null" && (
              <Text
                style={{
                  fontSize: 70,
                  color: colors.black,
                  textAlign: "center",
                  padding: 10,
                  fontFamily: "marcellus",
                }}
              >
                {result?.country} {result?.flag}
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
              {result?.description !== "null" ? result?.description : ""}
            </Text>

            <Button
              style={{ width: 300, alignSelf: "center" }}
              label={translate("finish")}
              backgroundColor={colors.primary}
              onPress={() => {
                onFinish({
                  result,
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
