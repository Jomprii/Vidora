import { StatusBar, Text, View, StyleSheet, Pressable } from "react-native";
import { Icon, ThreeDotsIcon } from "@/components/ui/icon";

export default function Vidora() {
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.container}>
        <Text style={styles.texts}>Test</Text>
        <Pressable />
        <Icon as={ThreeDotsIcon} />
        <Text>Tried the branching</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B2A3A",
  },
  texts: {
    color: "#EAE0CF",
  },
});
