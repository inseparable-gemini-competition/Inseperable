// FontSettingsContent.tsx

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { CustomText } from "@/app/components/CustomText";
import { colors } from "@/app/theme";
import GenericBottomSheet from "./GenericBottomSheet";
import { useFont } from "@/app/context/fontContext";

interface FontSettingsContentProps {
  isVisible: boolean;
  onClose: () => void;
}

const FontSettingsContent: React.FC<FontSettingsContentProps> = ({
  isVisible,
  onClose,
}) => {
  const { selectedFont, fontSize, fontSizeRatio, setSelectedFont, setFontSize, setFontSizeRatio } = useFont();

  const fontOptions = ["marcellus", "SpaceMono", "OpenDyslexic"];

  const content = (
    <View style={styles.container}>
      <CustomText style={styles.title}>Font and Theme Settings</CustomText>

      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Font Family</CustomText>
        {fontOptions.map((font) => (
          <TouchableOpacity
            key={font}
            style={[
              styles.optionButton,
              selectedFont === font && styles.selectedOption,
            ]}
            onPress={() => setSelectedFont(font)}
          >
            <CustomText
              style={[
                styles.optionText,
                { fontFamily: font },
                selectedFont === font && styles.selectedOptionText,
              ]}
            >
              {font}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>
          Font Size: {fontSize}
        </CustomText>
        <View style={styles.fontSizeControls}>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSize(Math.max(10, fontSize - 2))}
          >
            <CustomText style={styles.fontSizeButtonText}>-</CustomText>
          </TouchableOpacity>
          <CustomText style={{ fontSize, textAlign: 'center' }}>Experiment</CustomText>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSize(Math.min(30, fontSize + 2))}
          >
            <CustomText style={styles.fontSizeButtonText}>+</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>
          Font Size Ratio: {fontSizeRatio.toFixed(2)}
        </CustomText>
        <View style={styles.fontSizeControls}>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSizeRatio(Math.max(0.5, fontSizeRatio - 0.1))}
          >
            <CustomText style={styles.fontSizeButtonText}>-</CustomText>
          </TouchableOpacity>
          <CustomText style={{ fontSize, textAlign: 'center' }}>Adjust Ratio</CustomText>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSizeRatio(Math.min(2, fontSizeRatio + 0.1))}
          >
            <CustomText style={styles.fontSizeButtonText}>+</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <GenericBottomSheet
      visible={isVisible}
      onClose={onClose}
      snapPoints={["70%", "75%"]}
      initialIndex={0}
    >
      {content}
    </GenericBottomSheet>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: colors.secondary,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.light,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.dark,
  },
  selectedOptionText: {
    color: colors.white,
  },
  fontSizeControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fontSizeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    width: 50,
    alignItems: "center",
  },
  fontSizeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FontSettingsContent;