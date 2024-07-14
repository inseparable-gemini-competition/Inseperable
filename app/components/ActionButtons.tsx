import Reac from "react";
import { View, Text, TouchableOpacity} from "react-native";
import styles from "@/app/screens/Identify/styles";
import { MaterialIcons } from "@expo/vector-icons";

const ActionButtons: React.FC<{ 
    translations: any; 
    executeCommand: (command: string) => void; 
    openLanguageSelectionModal: () => void 
  }> = ({ translations, executeCommand, openLanguageSelectionModal }) => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => executeCommand("identify")}
      >
        <MaterialIcons name="search" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.identify || "Identify"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => executeCommand("price")}
      >
        <MaterialIcons name="attach-money" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.price || "Find Fair Price"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => executeCommand("read")}
      >
        <MaterialIcons name="book" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.read || "Read"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={openLanguageSelectionModal}
      >
        <MaterialIcons name="translate" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.translate || "Translate"}</Text>
      </TouchableOpacity>
    </View>
  );
  export default ActionButtons;