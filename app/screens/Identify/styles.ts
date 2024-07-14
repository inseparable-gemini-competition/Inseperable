import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#f8f9fa" },
  camera: { height: height / 2, justifyContent: "flex-end" },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  flipButton: {
    backgroundColor: "#007aff",
    borderRadius: 50,
    padding: 10,
    position: "absolute",
    bottom: 35,
  },
  captureButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15 },
  buttonText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackText: {
    marginVertical: 20,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  voiceCommandContainer: { marginTop: 20, alignItems: "center" },
  microphoneButton: {
    backgroundColor: "#007aff",
    borderRadius: 50,
    padding: 15,
  },
  goBackButton: {
    backgroundColor: "#007aff",
    borderRadius: 50,
    padding: 10,
    position: "absolute",
    bottom: 35,
    paddingHorizontal: 30,
    left: "17%",
    transform: [{ translateX: -50 }],
  },
  permissionButton: {
    backgroundColor: "#007aff",
    borderRadius: 50,
    padding: 15,
    marginTop: 20,
    margin: 40,
  },
  permissionText: { fontSize: 16, color: "#fff", textAlign: "center" },
  optionButton: {
    backgroundColor: "#007aff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  optionText: { fontSize: 18, color: "#fff" },
  capturingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  capturingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 18,
    textAlign: "center",
  },
  handle: {
    height: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  handleText: {
    color: "#000",
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  iconButton: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconButtonText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  languageInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#007aff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;
