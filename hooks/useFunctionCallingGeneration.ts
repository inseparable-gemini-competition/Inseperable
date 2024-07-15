import { useMutation } from 'react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FunctionDeclaration {
  name: string;
  parameters: {
    type: string;
    description: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export const useFunctionCalling = (
  modelType: string,
  functionDeclaration: FunctionDeclaration,
  executableFunction: (args: Record<string, any>) => Promise<any>
) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);

  const fetchFunctionCalling = async (prompt: string) => {
    const model = genAI.getGenerativeModel({
      model: modelType,
      tools: { functionDeclarations: [functionDeclaration] },
    });
    const chat = model.startChat();

    const result = await chat.sendMessage(prompt);
    const call = result.response.functionCalls()[0];

    if (call) {
      const apiResponse = await executableFunction(call.args);
      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: functionDeclaration.name,
            response: apiResponse,
          },
        },
      ]);
      return result2.response.text();
    }
    return null;
  };

  const { mutate, data, isLoading, isError } = useMutation(fetchFunctionCalling);

  return {
    callFunction: mutate,
    result: data,
    isLoading,
    isError,
  };
};
