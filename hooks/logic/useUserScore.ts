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

interface UpdateUserScoreData extends UserScore {
  userId: string;
}

interface UserScoreResult {
  overallScore: number;
  culturalScore: number;
  socialScore: number;
  environmentalScore: number;
  lastUpdated: string;
}

const updateUserScoreFunction = httpsCallable<UpdateUserScoreData, void>(
  functions,
  "updateUserScore"
);
const getUserScoreFunction = httpsCallable<{ userId: string }, UserScoreResult>(
  functions,
  "getUserScore"
);

export const useUpdateUserScore = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateUserScoreData>(
    (data) => updateUserScoreFunction(data).then(() => {}),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "User score updated",
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: "userScore",
        });
      },
    }
  );
};

export const useGetUserScore = () => {
  const {userData} = useStore();
  return useQuery<UserScoreResult, Error>(
    "userScore",
    () => getUserScoreFunction({ userId: userData?.id }).then((result) => result.data),
    {
      enabled: !!userData?.id,
    }
  );
};
