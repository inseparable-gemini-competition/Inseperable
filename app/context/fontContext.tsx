// themeContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
} from "react";

interface FontContextType {
  selectedFont: string;
  fontSize: number;
  fontSizeRatio: number;
  setSelectedFont: (font: string) => void;
  setFontSize: (size: number) => void;
  setFontSizeRatio: (ratio: number) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [selectedFont, setSelectedFont] = useState<string>("marcellus");
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(1);

  return (
    <FontContext.Provider
      value={{
        selectedFont,
        fontSize,
        fontSizeRatio,
        setSelectedFont,
        setFontSize,
        setFontSizeRatio,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = (): FontContextType => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
