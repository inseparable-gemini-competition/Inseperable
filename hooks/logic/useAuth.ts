import { useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  getAuth,
} from "firebase/auth";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStore from "@/app/store";
import { auth, db } from "@/app/helpers/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useJsonControlledGeneration } from "@/hooks/gemini";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export function useAuth({ fromLayout = false }: { fromLayout?: boolean } = {}) {
  const [user, setUser] = useState<User | null>(null);
  const { setUserData, userData } = useStore();

  const { currentLanguage, translations, setTranslations, setCurrentLanguage } =
    useTranslations();

  const onTranslationSuccess = useCallback(
    (data: any) => {
      setTranslations({
        en: translations.en,
        [data.baseLanguage]: data.translations,
        isRTL: data.isRTl,
      });
      setCurrentLanguage(data.baseLanguage);
    },
    [translations]
  );
  const { generate: generateTranslations } = useJsonControlledGeneration({
    promptType: "translateApp",
    onSuccess: onTranslationSuccess,
  });

  useEffect(() => {
    if (fromLayout) {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (fromLayout) return;
      setUser(user);
      if (user) {
        let updatedUserData = {
          id: user.uid,
          email: user.email,
        };

        // Check if userData is empty (has no fields)
        if (!userData || Object.keys(userData).length === 0) {
          try {
            const userDocSnap = await getDoc(doc(db, "users", user.uid));

            if (userDocSnap.exists()) {
              if (!currentLanguage) {
                const result = (await generateTranslations({
                  baseLanguage: userDocSnap.data().baseLanguage,
                })) as any;
                setTranslations({
                  en: translations.en,
                  [result.baseLanguage]: result.translations,
                  isRTL: result.isRTl,
                });
                setCurrentLanguage(result.baseLanguage);
              }
              updatedUserData = {
                ...updatedUserData,
                ...userDocSnap.data(),
              };
            }
          } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
          }
        } else {
          updatedUserData = {
            ...userData,
            ...updatedUserData,
          };
        }

        I18nManager.forceRTL(true);
        setUserData(updatedUserData);
        Updates.reloadAsync();
      }
    });
    return unsubscribe;
  }, [setUserData]);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  };

  const biometricLogin = async () => {
    const savedEmail = await AsyncStorage.getItem("userEmail");
    const savedPassword = await AsyncStorage.getItem("userPassword");

    if (savedEmail && savedPassword) {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        return signIn(savedEmail, savedPassword);
      }
    }
    throw new Error("Biometric login failed");
  };

  const saveBiometricCredentials = async (email: string, password: string) => {
    await AsyncStorage.setItem("userEmail", email);
    await AsyncStorage.setItem("userPassword", password);
  };

  return {
    user,
    signUp,
    signIn,
    biometricLogin,
    saveBiometricCredentials,
  };
}
