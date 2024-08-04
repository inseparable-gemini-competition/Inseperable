// src/hooks/useUserScores.ts
import { functions } from "@/app/helpers/firebaseConfig";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { httpsCallable } from "firebase/functions";
import Toast from "react-native-toast-message";
import useStore from "@/app/store";

interface UserScore {
  cultural?: number;
  social?: number;
  environmental?: number;
}

interface UserScoreResult {
  overallScore: number;
  culturalScore: number;
  socialScore: number;
  environmentalScore: number;
  lastUpdated: string;
}

const updateUserScoreFunction = httpsCallable<UserScore, void>(
  functions,
  "updateUserScore"
);

const getUserScoreFunction = httpsCallable<{ userId: string }, UserScoreResult>(
  functions,
  "getUserScore"
);

export const useGetUserScore = () => {
  const { userData } = useStore();

  return useQuery<UserScoreResult, Error>(
    ["userScore", userData?.id],
    () => getUserScoreFunction({ userId: userData?.id }).then((result) => result.data),
    {
      enabled: !!userData?.id,
      retry: 2,
      cacheTime: 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to fetch user score",
          text2: error.message,
        });
      },
    }
  );
};

export const useUpdateUserScore = () => {
  const queryClient = useQueryClient();
  const { userData } = useStore();

  return useMutation<void, Error, UserScore>(
    (data) => updateUserScoreFunction(data).then(() => {}),
    {
      onSuccess: (_, variables) => {
        Toast.show({
          type: "success",
          text1: "User score updated",
        });
        queryClient.invalidateQueries(["userScore", userData?.id]);
        queryClient.refetchQueries(["userScore", userData?.id]);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to update user score",
          text2: error.message,
        });
      },
    }
  );
};


export const useUserScores = () => {
  const updateUserScore = useUpdateUserScore();
  const getUserScore = useGetUserScore();

  return {
    updateUserScore,
    getUserScore,
  };
};