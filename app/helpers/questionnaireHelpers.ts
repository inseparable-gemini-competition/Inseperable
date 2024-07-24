export const defaultQuestions = [
  {
    id: 1,
    question: "Where are you based?",
    options: [],
    isOpenEnded: true,
  },
];

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
