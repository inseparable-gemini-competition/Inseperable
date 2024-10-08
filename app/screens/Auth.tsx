// AuthScreen.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput as TextField,
  ActivityIndicator,
} from "react-native";
import { View } from "react-native-ui-lib";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/logic/useAuth";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";
import Toast from "react-native-toast-message";

const LoadingAnimation = ({ text }: { text: string }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.black} size={"large"} />
      <CustomText style={styles.loadingText}>{text}</CustomText>
    </View>
  );
};

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const {
    signIn,
    signUp,
    biometricLogin,
    saveBiometricCredentials,
    isLoading,
    isTranslating,
    setIsLoading,
  } = useAuth();
  const { translate } = useTranslations();

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
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
      Toast.show({
        type: "error",
        text1: translate("authFailed") + error.message,
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await biometricLogin();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert(translate("didYouSignInBefore") + "?");
    }
  };

  if (isTranslating) {
    return <LoadingAnimation text={translate("translatingApp")} />;
  }

  if (isLoading) {
    return <LoadingAnimation text={translate("loggingIn")} />;
  }

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <CustomText style={styles.title}>
          {isLogin ? translate("login") : translate("signUp")}
        </CustomText>
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
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={isLoading}
        >
          <CustomText style={styles.buttonText}>
            {isLogin ? translate("login") : translate("signUp")}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={isLoading}
        >
          <Ionicons
            name="finger-print-outline"
            size={24}
            color={colors.white}
          />
          <CustomText style={styles.biometricButtonText}>
            {translate("biometricLogin")}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <CustomText style={styles.switchText}>
            {isLogin ? translate("needAccount") : translate("haveAccount")}
          </CustomText>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: "transparent",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: colors.primary,
  },
  title: {
    fontSize: 32,
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
    marginLeft: 10,
  },
  switchText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
