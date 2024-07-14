import { useState } from "react";
import { View } from "react-native-ui-lib";
import { colors } from "../theme";
import Question from "@/components/Question/Question";

type Props = {
  onFinish: () => void;
};

const Questionnaire = ({ onFinish }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const defaultQuestions = [ 
    {
      id: 1,
      question: "Where are you based?",
      options: [],
      isOpenEnded: true,
    },
    {
      id: 2,
      question: "Are you currently traveling outside of your country?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
  ];
  const [questions, setQuestions] = useState(defaultQuestions);

  const [question, setQuestion] = useState(questions[0]);


  const questionsOptionA = [
    {
      id: 3,
      question: "Which country are you currently in?",
      options: [],
      isOpenEnded: true,
    },
    {
      id: 4,
      question: "How long have you been traveling?",
      options: [
        { id: 1, option: "Less than a week" },
        { id: 2, option: "1-2 weeks" },
        { id: 3, option: "More than 2 weeks" },
      ],
    },
    {
      id: 5,
      question: "Are you traveling for business or leisure?",
      options: [
        { id: 1, option: "Business" },
        { id: 2, option: "Leisure" },
        { id: 3, option: "Both" },
      ],
    },
    {
      id: 6,
      question: "What mode of transportation did you use to travel?",
      options: [
        { id: 1, option: "Airplane" },
        { id: 2, option: "Train" },
        { id: 3, option: "Car" },
        { id: 4, option: "Bus" },
        { id: 5, option: "Other" },
      ],
    },
    {
      id: 7,
      question: "Are you staying in a hotel, Airbnb, or with friends/family?",
      options: [
        { id: 1, option: "Hotel" },
        { id: 2, option: "Airbnb" },
        { id: 3, option: "Friends/Family" },
        { id: 4, option: "Other" },
      ],
    },
    {
      id: 8,
      question: "Have you visited this country before?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 9,
      question: "Do you plan to visit any specific attractions or landmarks?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 10,
      question: "Are you planning to meet any local residents?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 11,
      question: "Have you encountered any language barriers?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 12,
      question: "Are you planning to try any local cuisines?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ] 
    },    
  ];

  const questionsOptionB = [
    {
      id: 3,
      question: "What is your preferred climate for a vacation?",
      options: [
        { id: 1, option: "Tropical" },
        { id: 2, option: "Temperate" },
        { id: 3, option: "Cold" },
        { id: 4, option: "Dry/Desert" },
      ],
    },
    {
      id: 4,
      question: "What type of activities do you enjoy on vacation?",
      options: [
        { id: 1, option: "Adventure sports" },
        { id: 2, option: "Cultural experiences" },
        { id: 3, option: "Relaxing on the beach" },
        { id: 4, option: "Wildlife and nature" },
      ],
    },
    {
      id: 5,
      question: "Do you prefer exploring cities or nature?",
      options: [
        { id: 1, option: "Cities" },
        { id: 2, option: "Nature" },
        { id: 3, option: "Both" },
      ],
    },
    {
      id: 6,
      question: "Are you interested in historical landmarks?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 7,
      question: "Do you enjoy trying new cuisines?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    },
    {
      id: 8,
      question: "What is your budget for a vacation?",
      options: [
        { id: 1, option: "Low" },
        { id: 2, option: "Medium" },
        { id: 3, option: "High" },
      ],
    },
    {
      id: 9,
      question: "How long do you prefer your vacations to be?",
      options: [
        { id: 1, option: "Less than a week" },
        { id: 2, option: "1-2 weeks" },
        { id: 3, option: "More than 2 weeks" },
      ],
    },
    {
      id: 10,
      question: "Do you prefer solo travel or group travel?",
      options: [
        { id: 1, option: "Solo" },
        { id: 2, option: "Group" },
        { id: 3, option: "Both" },
      ],
    },
    {
      id: 11,
      question: "Are you interested in luxury or budget accommodations?",
      options: [
        { id: 1, option: "Luxury" },
        { id: 2, option: "Budget" },
        { id: 3, option: "Both" },
      ],
    },
    {
      id: 12,
      question: "Would you like to visit a place with a rich cultural heritage?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
      ],
    }
  ];


  const handleAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = (option: string) => { 
    if(option.length === 0) return;
    handleAnswer(option);
    let updatedQuestions = [...defaultQuestions];
    if(currentQuestionIndex == 1){
      if(option == "Yes"){
        updatedQuestions = [...defaultQuestions, ...questionsOptionA];
       setQuestions(updatedQuestions);
      } else {
        updatedQuestions = [...defaultQuestions, ...questionsOptionB];
       setQuestions(updatedQuestions);
      }
      setQuestion(updatedQuestions[currentQuestionIndex + 1])
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return 
    }
    if (currentQuestionIndex < updatedQuestions.length - 1) {
      setQuestion(updatedQuestions[currentQuestionIndex + 1]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestion(questions[currentQuestionIndex - 1]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          showPrevious={currentQuestionIndex > 0}
          showNext={
            question.isOpenEnded || false
          }
          currentAnswer={answers[currentQuestionIndex] || ""}
        />
      </View>
    </View>
  );
};

export default Questionnaire;
