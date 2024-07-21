import { auth } from "@/app/helpers/firebaseConfig";
import { onAuthStateChanged, signInAnonymously, User, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

// Add return type for hook
export const useSignIn = (): {
  userId: string | null;
  loading: boolean;
  setUserId: (userId: string | null) => void;
  setLoading: (loading: boolean) => void;
  authenticateUser: () => Promise<string | null>;
} => {
  // State for user ID
  const [userId, setUserId] = useState<string | null>(null);
  // State for loading
  const [loading, setLoading] = useState(true);

  const authenticateUser = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          const userCredential = await signInAnonymously(auth);
          setUserId(userCredential.user.uid);
          setLoading(false);
          resolve(userCredential.user.uid);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            setUserId(userCredential.user.uid);
            setLoading(false);
            resolve(userCredential.user.uid);
          } catch (error) {
            console.error("Error signing in anonymously:", error);
            setLoading(false);
            reject(null);
          }
        }
      });
    });
  };

  return { userId, loading, setUserId, setLoading, authenticateUser };
};
