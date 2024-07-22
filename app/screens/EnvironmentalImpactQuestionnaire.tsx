import { useState } from "react";
import { View, Text, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/components/Question/Question";
import { ActivityIndicator, ScrollView } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { generateSchema } from "@/hooks/utils/generateSchema";
import {
  convertJSONToObject,
  defaultQuestions,
  generatePrompt,
  nextQuestionPrompt,
} from "@/app/helpers/environmentalQuestionnaireHelpers";
import { userDataType } from "../store";
import { useGenerateContent } from "@/hooks/useGeminiStream";

type Props = {
  onFinish: (userData: {
    userData: userDataType;
    setLocalLoading: (loading: boolean) => void;
  }) => void;
};

const EnvironmentalImpactQuestionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const schema = generateSchema("calculate environmental impact", {
    impactScore: ["number", "environmental impact score"],
    recommendations: ["string", "steps to avoid bad impact"],
  });
  const { generate, isLoading, result } = useJsonControlledGeneration(schema);
  const [localLoading, setLocalLoading] = useState(false);

  const [questions, setQuestions] = useState(defaultQuestions);
  const { sendMessage: sendAnswer, isLoading: isLoadingNextQuestion } =
    useGenerateContent(nextQuestionPrompt, (question: any) => {
      const updatedQuestions = [...questions, convertJSONToObject(question)];
      setQuestions((questions) => [
        ...questions,
        convertJSONToObject(question),
      ]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestion(updatedQuestions[currentQuestionIndex + 1]);
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
      const prompt = generatePrompt(answers, questions);
      generate(prompt);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestion(questions[currentQuestionIndex - 1]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
          Fetching next question..
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
        <Text style={{ fontFamily: "marcellus" }}>Calculating impact..</Text>
      </View>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={{
        justifyContent: "center",
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: colors.background,
        paddingVertical: 20,
      }}
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
              Your Environmental Impact Score: {result?.impactScore}
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
              Recommendations to reduce your impact:{" "}
              {result?.recommendations}
            </Text>

            <Button
              style={{ width: 300, alignSelf: "center" }}
              label="Finish"
              backgroundColor={colors.primary}
              onPress={() =>
                onFinish({
                  userData: result,
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
  );
};

export default EnvironmentalImpactQuestionnaire;