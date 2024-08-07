import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput as TextField,
} from "react-native";
import { View, Text } from "react-native-ui-lib";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import useStore from "@/app/store";
import { useAuth } from "@/hooks/logic/useAuth";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { useJsonControlledGeneration } from "@/hooks";

type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, "Auth">;


export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, biometricLogin, saveBiometricCredentials } =
    useAuth();
  const { translate, setTranslations, translations, setCurrentLanguage } =
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

  const handleAuth = async () => {
    try {
      let user;
      if (isLogin) {
        user = await signIn(email, password);
      } else {
        user = await signUp(email, password);
      }

      if (user) {
        await saveBiometricCredentials(email, password);
      }
    } catch (error) {
      console.error(error);
      alert(translate("authFailed"));
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await biometricLogin();
    } catch (error) {
      console.error(error);
      alert(translate("biometricFailed"));
    }
  };

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {isLogin ? translate("login") : translate("signUp")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={24}
            color={colors.primary}
            style={styles.icon}
          />
          <TextField
            placeholder={translate("email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color={colors.primary}
            style={styles.icon}
          />
          <TextField
            placeholder={translate("password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isLogin ? translate("login") : translate("signUp")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Ionicons
            name="finger-print-outline"
            size={24}
            color={colors.white}
          />
          <Text style={styles.biometricButtonText}>
            {translate("biometricLogin")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? translate("needAccount") : translate("haveAccount")}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.dark,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  biometricButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  switchText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
