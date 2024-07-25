import React, { useMemo, useRef, ReactNode } from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

interface GenericBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  backdropComponent?: React.FC<any> | null;
  enableScroll?: boolean;
  contentContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  inputStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const defaultRenderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
  />
);

export const GenericBottomSheetTextInput = BottomSheetTextInput;

const GenericBottomSheet: React.FC<GenericBottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = ["50%", "75%", "90%"],
  initialIndex = 0,
  backdropComponent = defaultRenderBackdrop,
  enableScroll = true,
  contentContainerStyle,
  inputStyle,
  textStyle,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const ContentComponent = enableScroll ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? initialIndex : -1}
      snapPoints={memoizedSnapPoints}
      onChange={(index) => {
        if (index === -1) {
          onClose();
        }
      }}
      backdropComponent={backdropComponent}
      animateOnMount
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
    >
      <ContentComponent 
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardShouldPersistTaps={'handled'}
      >
        {React.Children.map(children, child => 
          React.isValidElement(child)
            ? React.cloneElement(child, {
                style: {
                  ...styles.text,
                  ...textStyle,
                  ...(child.props.style || {}),
                  ...(child.type === GenericBottomSheetTextInput ? {...styles.input, ...inputStyle} : {}),
                }
              })
            : child
        )}
      </ContentComponent>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    minHeight: '100%',
  },
  text: {
    fontFamily: "marcellus",
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 100,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    color: "#333",
    marginBottom: 16,
    textAlignVertical: "top",
  },
  button: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default GenericBottomSheet;