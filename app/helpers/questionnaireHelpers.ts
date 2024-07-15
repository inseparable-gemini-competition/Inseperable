export const defaultQuestions = [
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

export const questionsOptionA = [
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
    ],
  },
];

export const questionsOptionB = [
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
  `, please do the following:
1. Determine if I am currently traveling.
2. If I am not traveling:
  a. Recommend the best country for me to visit outside of my base country.
  b. Provide the recommendation in the language of my base country, including the country's name and a brief description and an emoji that represents the country's flag.
3. If I am currently traveling:
  a. Suggest the best plan for me in the country I am currently in.
  b. Provide the suggestion in the language of my base country, including the plan name and a brief description.
4. Ensure that the response for the plan and description always has logical values, even if no country recommendation is made.
`;
