export const defaultQuestions = [
  {
    id: 1,
    question: "Where are you based?",
    options: [],
    isOpenEnded: true,
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
Based on the user's preferences and answers provided below, recommend a suitable country for their next travel destination. Exclude their base country (indicated in the answer to question 1) from your recommendation.

User's answers: ${JSON.stringify(answers)}
Corresponding questions: ${JSON.stringify(questions)}

Please provide the following information in your response:

1. country: Name of the country
2. flag: Provide the country's flag as a text emoji
3. description: A concise overview of the country (50-75 words)
4. mostFamousLandmark: Name of the most iconic landmark
6. baseLanguage: Based on the user's base country (from question 1), provide his base language.

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

export const nextQuestionPrompt = `Generate a series of diverse, creative questions to help recommend a country for the user to visit, excluding their base country. Each question should be based on previous answers and presented as a JSON object. Continue asking questions until explicitly told to stop.
Rules:
1. Never ask about the user's base country again.
2. Use simple English.
3. Avoid cliché or overly common travel-related questions.
4. ask questions about  preferences, interests, travel style, budget, climate preferences.
5. ask multiple-choice more than open-ended questions.
6- you must ask about budget
7. just reply with the JSON, no more no less. It's of critical important to only repeat with JSON

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
1. "What's your ideal vacation pace: relaxed, balanced, or action-packed?"
2. "Which cuisine excites you the most: Mediterranean, Asian, Latin American, or something else?"
3. "Describe your perfect travel day in a few words."

Tailor subsequent questions based on previous responses to build a comprehensive traveler profile. Aim for a mix of specific and broad questions to gather diverse information for making an informed country recommendation.
And again it's curcial to respond only with JSON
`;
