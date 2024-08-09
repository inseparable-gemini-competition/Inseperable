import { useFont } from "@/app/context/fontContext";
import React from "react";
import {
  Text,
  TextProps,
  TextStyle,
  StyleProp,
} from "react-native";


function extractFontSize(style: StyleProp<TextStyle>): number | undefined {
  if (!style) return undefined;

  if (Array.isArray(style)) {
    for (const item of style) {
      if (typeof item === "object" && item !== null && "fontSize" in item) {
        return item.fontSize as number;
      }
    }
  } else if (
    typeof style === "object" &&
    style !== null &&
    "fontSize" in style
  ) {
    return style.fontSize as number;
  }

  return undefined;
}

export function withFont<P extends TextProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return (props: P) => {
    const { selectedFont, fontSize, fontSizeRatio } = useFont();
    const styleFontSize = extractFontSize(props.style);

    const baseStyle: TextStyle = {
      fontFamily: selectedFont,
      fontSize: (styleFontSize || fontSize) * fontSizeRatio,
    };

    return <WrappedComponent {...props} style={[props.style, {...baseStyle}]} />;
  };
}

export const CustomText = withFont(Text);
