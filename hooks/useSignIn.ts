import { auth } from "@/app/helpers/firebaseConfig";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { useEffect, useState } from "react";
//add return type for hook
export const useSignIn = (): {
  userId: string | null;
  loading: boolean;
  setUserId: (userId: string | null) => void;
  setLoading: (loading: boolean) => void;
} => {
  //state fo user id
  const [userId, setUserId] = useState<string | null>(null);
  //state for loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            setUserId(userCredential.user.uid);
          } catch (error) {
            console.error("Error signing in anonymously:", error);
          }
        }
        setLoading(false);
      });
    };

    authenticateUser();
  }, []);

  return { userId, loading, setUserId, setLoading };
};
