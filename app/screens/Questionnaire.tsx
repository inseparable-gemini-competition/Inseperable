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
} from "@/app/helpers/questionnaireHelpers";
import { userDataType } from "../store";
import { useGenerateContent } from "@/hooks/useGeminiStream";

type Props = {
  onFinish: (userData: {
    userData: userDataType;
    setLocalLoading: (loading: boolean) => void;
  }) => void;
};

const Questionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const schema = generateSchema("recommendation for country or plan", {
    country: ["string", "recommended country"],
    flag: ["string", "flag"],
    description: ["string", "recommended country description", false, "string"],
    baseLanguage: ["string", "base country language code"],
    mostFamousLandmark: [
      "string",
      "most famous landmark for the recommended country",
    ],
  });
  const { generate, isLoading, result } = useJsonControlledGeneration(schema);
  const [localLoading, setLocalLoading] = useState(false);

  const [questions, setQuestions] = useState(defaultQuestions);
  const { sendMessage: sendAnswer, isLoading: isLoadingNextQuestion } =
    useGenerateContent(
      `write a question for me based on my answers and don't ask me about my base country again, it's curcial that you don't stop asking questions until i tell you, the ultimate goal is to recommend a country to visit other than my base country, the question should be in form of json in this structure   {id: number;
    question: string;
    options: {
      id: number;
      option: string;
    }[];
    isOpenEnded?: boolean;
  };
    please stick to this schema and only send it in this form.
    the questions should be based on the answers to the previous questions, and should be diverse, creative and changing. dont't use cliche questions and use simple english
    `,
      (question: any) => {
        const updatedQuestions = [...questions, convertJSONToObject(question)];
        setQuestions((questions) => [
          ...questions,
          convertJSONToObject(question),
        ]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestion(updatedQuestions[currentQuestionIndex + 1]);
      }
    );

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
        <Text style={{ fontFamily: "marcellus" }}>Recommending..</Text>
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

export default Questionnaire;
