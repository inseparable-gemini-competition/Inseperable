import React, { useState } from "react";
import { View, Button } from "react-native-ui-lib";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import Question from "@/app/components/Question/Question";
import { CustomText } from "@/app/components/CustomText";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { convertJSONToObject } from "@/app/helpers/environmentalQuestionnaireHelpers";
import { useGenerateContent } from "@/hooks/gemini/useGeminiStream";
import { useTranslations } from "@/hooks/ui/useTranslations";
import useStore from "@/app/store";
import { useUpdateUserScore } from "@/hooks/logic/useUserScore";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import { colors } from "@/app/theme";
import { useNavigation } from "expo-router";

type Props = {
  onFinish: (params?: { setLocalLoading: (loading: boolean) => void }) => void;
};

const EnvironmentalImpactQuestionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const { translate, isRTL } = useTranslations();

  const defaultQuestions = [
    {
      id: 1,
      question: translate("WhatTransportationDidYouUseToday?"),
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

  const [question, setQuestion] = useState(questions[0]);

  useNavigation;
  const { userData } = useStore();
  const navigation = useNavigation<any>();

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

  const fadeInUpStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.exp),
      }),
      transform: [
        {
          translateY: withTiming(0, {
            duration: 700,
            easing: Easing.out(Easing.exp),
          }),
        },
      ],
    };
  });

  if (isLoadingNextQuestion) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.header as any, fadeInUpStyle]}>
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
          <CustomText style={styles.title}>
            {translate("environmentalImpact")}
          </CustomText>
        </Animated.View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={{ fontFamily: "marcellus" }}>
            {translate("fetchingNextQuestion")}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  } else if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.header as any, fadeInUpStyle]}>
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
          <CustomText style={styles.title}>
            {translate("environmentalImpact")}
          </CustomText>
        </Animated.View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={{ fontFamily: "marcellus" }}>
            {translate("calculatingImpact")}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View style={[styles.header as any, fadeInUpStyle]}>
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
        <CustomText style={styles.title}>
          {translate("environmentalImpact")}
        </CustomText>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
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
            <Animated.View style={[styles.resultContainer, fadeInUpStyle]}>
              <View
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  borderWidth: 10,
                  borderColor:
                    (result?.impactScore || 0) > 5
                      ? colors.success
                      : colors.danger,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <CustomText
                  style={{
                    fontSize: 40,
                    color:
                      (result?.impactScore || 0) > 5
                        ? colors.success
                        : colors.danger,
                  }}
                >
                  {result?.impactScore}
                </CustomText>
                <CustomText
                  style={{
                    fontSize: 20,
                    color: colors.black,
                  }}
                >
                  /10
                </CustomText>
              </View>
              <CustomText style={styles.explanationText}>
                {convertMarkdownToPlainText(result?.scoreExplanation)}
              </CustomText>
              <CustomText style={styles.recommendationText}>
                {convertMarkdownToPlainText(result?.recommendations)}
              </CustomText>
              <Button
                style={styles.finishButton}
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
                  style={{ marginTop: 20 }}
                />
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: "center",
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 20,
  },
  resultContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 15,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    color: colors.black,
    fontWeight: '600',
    textAlign: "center",
    marginVertical: 10,
  },
  explanationText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '600',
    textAlign: "center",
    marginVertical: 10,
  },
  recommendationText: {
    fontSize: 15,
    color: colors.secondary,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  finishButton: {
    width: 300,
    alignSelf: "center",
  },
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
    color: colors.white,
  },
});

export default EnvironmentalImpactQuestionnaire;
