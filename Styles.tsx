import { StyleSheet, TextStyle } from "react-native";

const baseText: TextStyle = {
  color: "#F7F7F7",
  fontWeight: "bold",
};

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#303841",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    flexGrow: 1,
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...baseText,
    fontSize: 25,
    marginBottom: 20,
  },
  input: {
    ...baseText,
    width: "100%",
    height: 40,
    borderColor: "#F7F7F7",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  text: {
    color: "#F7F7F7",
    fontSize: 18,
    marginVertical: 2,
  },
  headerTwo: {
    ...baseText,
    fontSize: 23,
    marginTop: 20,
    marginBottom: 5,
  },
  headerThree: {
    ...baseText,
    fontSize: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#F6C90E",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    ...baseText,
    fontSize: 18,
  },
  forecastHeading: {
    ...baseText,
    color: "#F7F7F7",
    fontWeight: "bold",
    fontSize: 18,
  },
  dayContainer: {
    marginBottom: 5,
    padding: 10,
  },
  evenDayBackground: {
    backgroundColor: "#395B64",
  },
  oddDayBackground: {
    backgroundColor: "#2C3E50",
  },
  error: {
    ...baseText,
    color: "red",
  },
  weatherDetailsContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#2C3E50",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F7F7F7",
  },
  weatherDetail: {
    color: "#F7F7F7",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 4,
  },
});
