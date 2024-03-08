import { StyleSheet, TextStyle } from "react-native";

const baseText: TextStyle = {
  color: "#F7F7F7",
  fontWeight: "500",
};

export const colors = {
  darkBackground: "#121212",
  accentColor: "#FFD369",
  lightText: "#F7F7F7",
  errorColor: "#FF4444",
  evenDayBackground: "#222831",
  oddDayBackground: "#1E1E1E",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  contentContainer: {
    flexGrow: 1,
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 30,
  },
  title: {
    ...baseText,
    textAlign: "center",
    fontSize: 26,
    marginBottom: 24,
  },
  input: {
    ...baseText,
    height: 50,
    width: "100%",
    backgroundColor: colors.evenDayBackground,
    borderColor: colors.accentColor,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
  },
  text: {
    ...baseText,
    fontSize: 18,
    marginVertical: 5,
  },
  headerTwo: {
    ...baseText,
    fontSize: 24,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: colors.accentColor,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    ...baseText,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.lightText,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  forecastHeading: {
    ...baseText,
    fontSize: 20,
    marginBottom: 10,
  },
  dayContainer: {
    backgroundColor: colors.evenDayBackground,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  error: {
    ...baseText,
    color: colors.errorColor,
  },
  weatherDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  weatherDetailsContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: colors.oddDayBackground,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accentColor,
    flexDirection: "column",
  },
  weatherDetail: {
    ...baseText,
    fontSize: 18,
    marginVertical: 6,
  },
  suggestionsContainer: {
    backgroundColor: colors.oddDayBackground,
    borderColor: colors.accentColor,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    width: "100%",
    marginBottom: 20,
  },
  suggestionItem: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.darkBackground,
  },
  suggestionText: {
    ...baseText,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  footer: {
    textAlign: "center",
    marginTop: 10,
  },
});
