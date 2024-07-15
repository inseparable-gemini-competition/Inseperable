export const convertStringToObject = (inputString: string) => {
    const jsonString = inputString.replace(/```json/g, "").replace(/```/g, "").trim();
  
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Invalid JSON string provided:", error);
      return null;
    }
  };
  