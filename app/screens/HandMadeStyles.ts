import { colors } from "@/app/theme";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.backgroundGradientStart,
    },
    title: {
      fontSize: 24,
      fontFamily: "marcellus",
      color: colors.white,
      marginBottom: 20,
      top: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      backgroundColor: colors.headerBackground,
      padding: 10,
      borderRadius: 10,
    },
    backButton: {
      marginEnd: 10,
    },
    itemContainer: {
      marginBottom: 20,
      width: "100%",
      alignItems: "center",
    },
    card: {
      width: "100%",
      borderRadius: 20,
      elevation: 3,
      backgroundColor: colors.white,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    itemImage: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    cardContent: {
      padding: 15,
      backgroundColor: colors.backgroundGradientEnd,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    itemName: {
      fontSize: 20,
      fontFamily: "marcellus",
      color: colors.black,
      marginBottom: 5,
    },
    itemRow: {
      flexDirection: "row",
      marginBottom: 5,
    },
    icon: {
      marginRight: 5,
    },
    itemPrice: {
      fontSize: 18,
      color: colors.primary,
    },
    itemCarbonFootprint: {
      fontSize: 16,
      color: colors.secondary,
      fontFamily: 'bold'
    },
    itemCarbonFootprintValue: {
      fontSize: 16,
      color: colors.secondary,
      marginTop: 5,
    },
    buyButton: {
      marginTop: 10,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignSelf: "stretch",
    },
    noDataText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: "center",
    },
    errorText: {
      color: colors.danger,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: colors.primary,
      marginTop: 10,
    },
  });
  export default styles;