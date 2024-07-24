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