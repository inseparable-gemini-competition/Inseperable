export const defaultQuestions = [
    {
      id: 1,
      question: "What mode of transport do you plan to use?",
      options: [
        { id: 1, option: "Airplane" },
        { id: 2, option: "Car" },
        { id: 3, option: "Train" },
        { id: 4, option: "Bicycle" },
        { id: 5, option: "Walking" },
      ],
      isOpenEnded: false,
    },
    {
      id: 2,
      question: "How long is your planned stay?",
      options: [
        { id: 1, option: "Less than a week" },
        { id: 2, option: "1-2 weeks" },
        { id: 3, option: "2-4 weeks" },
        { id: 4, option: "More than a month" },
      ],
      isOpenEnded: false,
    },
    {
      id: 3,
      question: "What type of accommodation will you be staying in?",
      options: [
        { id: 1, option: "Hotel" },
        { id: 2, option: "Hostel" },
        { id: 3, option: "Vacation rental" },
        { id: 4, option: "Camping" },
        { id: 5, option: "Staying with friends/family" },
      ],
      isOpenEnded: false,
    },
    {
      id: 4,
      question: "What activities do you plan to do?",
      options: [
        { id: 1, option: "Sightseeing" },
        { id: 2, option: "Hiking" },
        { id: 3, option: "Shopping" },
        { id: 4, option: "Dining out" },
        { id: 5, option: "Beach activities" },
      ],
      isOpenEnded: false,
    },
    {
      id: 5,
      question: "Will you be using single-use plastics?",
      options: [
        { id: 1, option: "Yes" },
        { id: 2, option: "No" },
        { id: 3, option: "Try to minimize" },
      ],
      isOpenEnded: false,
    },
  ];
  
  export const generatePrompt = (
    answers: string[],
    questions: {
      id: number;
      question: string;
      options: any[];
      isOpenEnded?: boolean;
    }[]
  ) => `
  Based on the user's travel plans and the answers provided below, calculate their environmental impact score and recommend steps to minimize their negative impact.
  
  User's answers: ${JSON.stringify(answers)}
  Corresponding questions: ${JSON.stringify(questions)}
  
  Please provide the following information in your response:
  
  1. impactScore: Calculate the user's environmental impact score based on their answers.
  2. recommendations: Provide specific steps the user can take to reduce their environmental impact.
  
  `;
  
  export function convertJSONToObject(rawString: string) {
    try {
      // Remove the ```json and ``` markers
      const jsonString = rawString.replace(/```json\s*|```/g, "").trim();
  
      // Parse the JSON string into a JavaScript object
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error) {
      // Handle any errors that occur during parsing
      console.error("Error parsing JSON string:", error);
      return null;
    }
  }
  
  export const nextQuestionPrompt = `Generate a series of questions to help calculate the user's environmental impact for their travel plans. Each question should be based on previous answers and presented as a JSON object. Continue asking questions until explicitly told to stop.
  Rules:
  1. Use simple English.
  2. Focus on aspects of the trip that affect the environment.
  3. Ask multiple-choice questions more than open-ended questions.
  4. Include questions about transportation, accommodation, activities, waste, and energy use.
  5. just reply with the JSON, no more no less. It's of critical important to only repeat with JSON
  
  JSON Structure:
  {
    "id": number,
    "question": string,
    "options": [
      {
        "id": number,
        "option": string
      }
    ],
    "isOpenEnded": boolean
  }
  
  For multiple-choice questions, provide 3-5 options. For open-ended questions, set "options" to an empty array and "isOpenEnded" to true.
  
  Example questions:
  1. "What mode of transport do you plan to use?"
  2. "How long is your planned stay?"
  3. "What type of accommodation will you be staying in?"
  
  Tailor subsequent questions based on previous responses to build a comprehensive profile of the user's travel plans. Aim for a mix of specific and broad questions to gather diverse information for making an informed impact calculation.
  And again it's curcial to respond only with JSON
  `;
  