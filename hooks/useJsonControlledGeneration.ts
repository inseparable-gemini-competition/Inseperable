import { useMutation } from "react-query";
import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
} from "@google/generative-ai";

interface SchemaItem {
  type: FunctionDeclarationSchemaType;
  description?: string;
  nullable?: boolean;
}

interface Schema {
  description: string;
  type: FunctionDeclarationSchemaType;
  items: {
    type: FunctionDeclarationSchemaType;
    properties: Record<string, SchemaItem>;
    required: string[];
  };
}

export const useJsonControlledGeneration = (schema: Schema) => {
  const genAI = new GoogleGenerativeAI("AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q");
  if(__DEV__) console.log('schema ',  JSON.stringify(schema));

  const fetchJsonControlledGeneration = async (prompt: string) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = await model.generateContent(prompt) as any;
    const jsonResult = JSON.parse(result?.response.candidates[0].content.parts[0].text)?.[0];
    if(__DEV__) console.log('jsonResult ', jsonResult);
    return  jsonResult;
  };

  const { mutate, data, isLoading, isError } = useMutation(
    fetchJsonControlledGeneration
  );

  return {
    generate: mutate,
    result: data,
    isLoading,
    isError,
  };
};
