export const defaultQuestions = [
    {
      id: 1,
      question: "What transportation did you use today?",
      options: [
        { id: 1, option: "Airplane" },
        { id: 2, option: "Car" },
        { id: 3, option: "Train" },
        { id: 4, option: "Bicycle" },
        { id: 5, option: "Walking" },
        { id: 6, option: "Nothing" },
      ],
      isOpenEnded: false,
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
  };