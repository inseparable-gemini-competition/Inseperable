import {StyleSheet} from 'react-native';
export const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover",
    },
    container: {
      flex: 1,
      backgroundColor: "rgba(255, 255, 255, 0.75)",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    icon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 10,
      marginTop: 20,
    },
    fixedHeader: {
      paddingHorizontal: 16,
      paddingTop: 20,
      backgroundColor: "rgba(255, 255, 255, 0.75)", // Added to match the container background
      zIndex: 1, // Ensure it stays on top
    },
    headerContainer: {
      paddingHorizontal: 16,
      backgroundColor: "rgba(255, 255, 255, 0.75)", // Match container background
    },
    title: {
      fontSize: 48,
      fontFamily: "marcellus",
      marginTop: 16,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: "marcellus",
      marginVertical: 16,
    },
    seeMoreText: {
      fontSize: 16,
      color: "blue",
      textDecorationLine: "underline",
    },
    cardContainer: {
      justifyContent: "space-between",
      marginTop: 16,
      paddingHorizontal: 16, // Increase touchable area
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      width: "42%",
      alignItems: "center",
      padding: 16,
      marginBottom: 16,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
    },
    cardImage: {
      width: "100%",
      height: 70,
      borderRadius: 16,
    },
    cardText: {
      marginTop: 8,
      fontSize: 18,
      fontFamily: "marcellus",
    },
    countdownContainer: {
      position: "absolute",
      top: "40%",
      left: "40%",
      transform: [{ translateX: -50 }, { translateY: -50 }],
      alignItems: "center",
      zIndex: 1,
    },
    voicedownContainer: {
      position: "absolute",
      top: "40%",
      left: "50%",
      transform: [{ translateX: -50 }, { translateY: -50 }],
      alignItems: "center",
      zIndex: 1,
    },
    countdownText: {
      fontSize: 48,
      color: "white",
      fontFamily: "marcellus",
      textShadowColor: "rgba(0, 0, 0, 0.75)",
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    recognizing: {
      fontSize: 14,
      color: "white",
      fontFamily: "marcellus",
      fontWeight: "bold",
      textShadowColor: "rgba(0, 0, 0, 0.75)",
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    cancelButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: "#ffb33e",
      borderRadius: 15,
    },
    cancelText: {
      color: "white",
      fontFamily: "marcellus",
      fontSize: 18,
    },
    captureButton: {
      position: "absolute",
      bottom: 30,
      alignSelf: "center",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
      borderWidth: 2,
      borderColor: "#000",
    },
    bottomOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      padding: 20,
      alignItems: "center",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    loadingText: {
      color: "#ffffff",
      fontSize: 24,
      marginLeft: 10,
      fontFamily: "marcellus",
    },
    feedbackText: {
      color: "#ffffff",
      fontSize: 18,
      textAlign: "center",
      paddingHorizontal: 20,
      fontFamily: "marcellus",
    },
    permissionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    permissionText: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 16,
    },
    flatListContentContainer: {
      paddingBottom: 16,
      paddingHorizontal: 8, // Increase touchable area
    },
    resetButton: {
      position: "absolute",
      top: 28,
      right: 20,
      backgroundColor: "#f44336",
      padding: 10,
      borderRadius: 20,
      elevation: 5,
      zIndex: 1,
    },
    resetButtonText: {
      color: "white",
      fontSize: 18,
      fontFamily: "marcellus",
    },
  });
  
  export const modalStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      alignItems: "center",
    },
    modalCountdownText: {
      fontSize: 30,
      color: "black",
      marginBottom: 10,
      fontFamily: "marcellus",
    },
    modalRecognizing: {
      fontSize: 18,
      color: "grey",
      marginBottom: 10,
      fontFamily: "marcellus",
    },
    modalCommandText: {
      fontSize: 24,
      color: "black",
      marginBottom: 20,
      fontFamily: "marcellus",
    },
    modalCancelButton: {
      backgroundColor: "red",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    modalCancelText: {
      color: "white",
      fontSize: 18,
      fontFamily: "marcellus",
    },
    modalTitle: {
      fontSize: 34,
      marginBottom: 10,
      fontFamily: "marcellus",
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: "center",
      fontFamily: "marcellus",
    },
    modalButton: {
      backgroundColor: "#4CAF50",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    modalButtonText: {
      color: "white",
      fontSize: 18,
      fontFamily: "marcellus",
    },
    modalCloseButton: {
      backgroundColor: "#f44336",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    modalCloseButtonText: {
      color: "white",
      fontSize: 18,
      fontFamily: "marcellus",
    },
  });