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
) =>
  `Based on the following answers: ` +
  JSON.stringify(answers) +
  ` to these questions: ` +
  JSON.stringify(questions) +
  `recommend a country for me and suggest a detailed plan, send the recommended country's flag as text and a brief description of the country.
  you shouldn't suggest my base country (check question 1 answer) as the recommended country.
  the base language should be determined based on question 1 answer
  and also most famous landmark for the recommended country.
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
