import { colors } from "@/app/theme";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    color: "#333",
    marginBottom: 10,
  },
  flipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 10,
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
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 48,
    marginTop: 16,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 16,
    textAlign: "left",
  },
  seeMoreText: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
  environmentalScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6f7ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  environmentalScoreLabel: {
    fontSize: 16,
    marginRight: 5,
  },
  environmentalScoreValue: {
    fontSize: 18,
  },
  cardContainer: {
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 16, // Increase touchable area
  },
  card: {
    backgroundColor: colors.white,
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
  },
  countdownContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  voicedownContainer: {
    position: "absolute",
    top: "40%",
    end: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    zIndex: 1,
  },
  countdownText: {
    fontSize: 48,
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  recognizing: {
    fontSize: 14,
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.warning,
    borderRadius: 15,
  },
  cancelText: {
    color: "white",
    fontSize: 18,
  },
  captureButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.black,
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
    alignSelf: "center",
  },
  loadingText: {
    color: colors.white,
    fontSize: 24,
    marginStart: 10,
  },
  feedbackText: {
    color: colors.white,
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
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
    backgroundColor: colors.danger,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    zIndex: 1,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  resetButton2: {
    backgroundColor: colors.danger,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    zIndex: 1,
    alignSelf: "flex-start",
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    textAlign: "left",
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
  },
  modalRecognizing: {
    fontSize: 18,
    color: "grey",
    marginBottom: 10,
  },
  modalCommandText: {
    fontSize: 24,
    color: "black",
    marginBottom: 20,
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
  },
  modalTitle: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
  },
  modalCloseButton: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: colors.white,
    fontSize: 18,
  },
  textInput: {
    width: 340,
    alignSelf: "center",
    height: 100,
    borderColor: colors.info,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top", // Ensures text starts at the top of the input
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    color: "#333",
    marginBottom: 20,
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    width: "100%",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  dialogContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  dialogContent: {
    padding: 20,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
