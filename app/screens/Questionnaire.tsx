import { useState } from "react";
import { View, Text, Button } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/components/Question/Question";
import { ActivityIndicator, ScrollView } from "react-native";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { generateSchema } from "@/hooks/utils/generateSchema";
import { defaultQuestions, generatePrompt, questionsOptionA, questionsOptionB } from "@/app/helpers/questionnaireHelpers";

type Props = {
  onFinish: () => void;
};

const Questionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const schema = generateSchema("recommendation for country or plan", {
    country: ["string", "recommended country"],
    plan: ["string", "recommended plan"],
    description: ["string", "brief description"],
  });
  const { generate, isLoading, result } = useJsonControlledGeneration(schema);



  const [questions, setQuestions] = useState(defaultQuestions);
  const [question, setQuestion] = useState(questions[0]);

  const handleAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = async (option: string) => {
    if (option.length === 0) return;
    handleAnswer(option);

    let updatedQuestions = [...questions];
    if (currentQuestionIndex === 1) {
      if (option === "Yes") {
        updatedQuestions = [...defaultQuestions, ...questionsOptionA];
      } else {
        updatedQuestions = [...defaultQuestions, ...questionsOptionB];
      }
      setQuestions(updatedQuestions);
    }

    if (currentQuestionIndex < updatedQuestions.length - 1) {
      setQuestion(updatedQuestions[currentQuestionIndex + 1]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
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

  if (isLoading) {
    // Show loading spinner
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
        {!result?.country && !result?.plan ? (
          <Question
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={currentQuestionIndex > 0}
            showNext={question.isOpenEnded || false}
            currentAnswer={answers[currentQuestionIndex] || ""}
          />
        ) : (
          <>
            {result?.country !=="null" && <Text
              style={{
                fontSize: 70,
                fontWeight: "bold",
                color: colors.black,
                textAlign: "center",
                padding: 10,
              }}
            >
              {result?.country}
            </Text>}
            <Text
              style={{
                fontSize: 15,
                color: colors.black,
                textAlign: "center",
                padding: 10,
                paddingHorizontal: 30,
              }}
            >
              {result?.description !=="null" ? result?.description: ""}
              {"\n \n"} {result?.plan}
            </Text>
            <Button style={{width: 300, alignSelf: 'center'}} label="Finish" onPress={onFinish} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Questionnaire;
