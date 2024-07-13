import Question from "@/components/Question/Question";
import { useState } from "react";
import { View } from "react-native-ui-lib";
import { colors } from "../theme";

type Props = {
  onFinish: () => void;
};

const Questionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = [
    {
      id: 1,
      question: "Where are you based?",
      options: [
        { id: 1, option: "Paris" },
        { id: 2, option: "London" },
        { id: 3, option: "Berlin" },
        { id: 4, option: "Madrid" },
      ],
    },
    {
      id: 2,
      question: "Where would you like to go?",
      options: [
        { id: 1, option: "Norway" },
        { id: 2, option: "Sweden" },
        { id: 3, option: "Finland" },
        { id: 4, option: "Denmark" },
      ],
    },
    {
      id: 3,
      question: "What is your favorite color?",
      options: [
        { id: 1, option: "Red" },
        { id: 2, option: "Blue" },
        { id: 3, option: "Green" },
        { id: 4, option: "Yellow" },
      ],
    },
    {
      id: 4,
      question: "What is your favorite food?",
      options: [
        { id: 1, option: "Pizza" },
        { id: 2, option: "Pasta" },
        { id: 3, option: "Burger" },
        {
          id: 4,
          option: "Salad",
        },
      ],
    },
  ];

  const question = questions[currentQuestionIndex];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <View>
        <Question
          key={question.id}
          question={question}
          onAnswer={() => {
            if (currentQuestionIndex === questions.length - 1) {
              onFinish();
            } else {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
          }}
        />
      </View>
    </View>
  );
};

export default Questionnaire;
