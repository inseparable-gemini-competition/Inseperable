import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { View } from "react-native-ui-lib";
import styles from "./styles";

interface VoiceCommandModuleProps {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const VoiceCommandModule: React.FC<VoiceCommandModuleProps> = ({
  isListening,
  startListening,
  stopListening,
}) => {
  return (
    <View style={styles.voiceCommandContainer}>
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        style={styles.microphoneButton}
      >
        <Ionicons name={"mic-off"} size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default VoiceCommandModule;
