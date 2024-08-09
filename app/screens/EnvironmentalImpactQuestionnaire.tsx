import React, { useState } from "react";
import { View, Text, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/app/components/Question/Question";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { convertJSONToObject } from "@/app/helpers/environmentalQuestionnaireHelpers";
import { useGenerateContent } from "@/hooks/gemini/useGeminiStream";
import { useTranslations } from "@/hooks/ui/useTranslations";
import useStore from "@/app/store";
import { useUpdateUserScore } from "@/hooks/logic/useUserScore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Props = {
  onFinish: (params?: { setLocalLoading: (loading: boolean) => void }) => void;
};

const EnvironmentalImpactQuestionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const { translate, isRTL } = useTranslations();
  const navigation = useNavigation();
  const defaultQuestions = [
    {
      id: 1,
      question: translate("Whattransportationdidyouusetoday"),
      options: [
        { id: 1, option: translate("airplane") },
        { id: 2, option: translate("car") },
        { id: 4, option: translate("bicycle") },
        { id: 5, option: translate("walking") },
        { id: 6, option: translate("nothing") },
      ],
      isOpenEnded: false,
    },
  ];

  const [questions, setQuestions] = useState(defaultQuestions);
  const { mutateAsync: updateUserScore } = useUpdateUserScore();

  const {
    generate: generateEnvironmentalImpact,
    isLoading,
    result,
  } = useJsonControlledGeneration({
    promptType: "environmentalImpact",
    onSuccess: (data) => {
      updateUserScore({
        environmental: data?.impactScore,
      });
    },
  });
  const [localLoading, setLocalLoading] = useState(false);

  const { userData } = useStore();

  const { sendMessage: sendAnswer, isLoading: isLoadingNextQuestion } =
    useGenerateContent({
      promptType: "nextQuestionEnvironment",
      inputData: { questions, answers, country: userData?.country },
      onSuccess: (result) => {
        const updatedQuestions = [...questions, convertJSONToObject(result)];
        setQuestions(updatedQuestions);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestion(updatedQuestions[currentQuestionIndex + 1]);
      },
    });

  const [question, setQuestion] = useState(questions[0]);

  const handleAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = async (option: string) => {
    if (option.length === 0) return;
    handleAnswer(option);

    if (currentQuestionIndex < 7) {
      sendAnswer(option);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      generateEnvironmentalImpact({ questions, answers });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestion(questions[currentQuestionIndex - 1]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const fadeInDownStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      }),
      transform: [
        {
          translateY: withTiming(0, {
            duration: 500,
            easing: Easing.out(Easing.exp),
          }),
        },
      ],
    };
  });

  if (isLoadingNextQuestion) {
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
          {translate("fetchingNextQuestion")}
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
          {translate("calculatingImpact")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View style={[styles.header, fadeInDownStyle]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{translate("environmentalImpact")}</Text>
      </Animated.View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1,
          alignItems: "center",
          backgroundColor: colors.background,
          paddingVertical: 20,
        }}
        keyboardShouldPersistTaps={"handled"}
      >
        <View>
          {!result?.impactScore && question ? (
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
              <Text
                style={{
                  fontSize: 20,
                  color: colors.black,
                  textAlign: "center",
                  padding: 10,
                  fontFamily: "marcellus",
                }}
              >
                {translate("yourEnvironmentalImactScore")} {result?.impactScore}
                /10
              </Text>
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
                {result?.scoreExplanation}
                {"\n"}
                {result?.recommendations}
              </Text>

              <Button
                style={{ width: 300, alignSelf: "center" }}
                label={translate("finish")}
                labelStyle={{ fontFamily: "marcellus" }}
                backgroundColor={colors.primary}
                onPress={() =>
                  onFinish({
                    setLocalLoading,
                  })
                }
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
    </SafeAreaView>
  );
};

const styles = {
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.headerBackground,
    width: "100%",
  },
  backButton: {
    marginEnd: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
};

export default EnvironmentalImpactQuestionnaire;
