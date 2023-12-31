import React from "react";
import { View, Text, Button } from "react-native";
import { ReText } from "react-native-redash";
import { useSharedValue } from "react-native-reanimated";
import { chat } from "react-native-chat-stream";

export default function Example({ route }) {
  const { organization, apiKey } = route.params; /// Add in your credentials
  const streamMessage = useSharedValue("");
  const [error, setError] = React.useState("");

  return (
    <View>
      <Button
        onPress={async () => {
          setError(null);
          chat({
            organization: organization,
            apiKey: apiKey,
            messages: [
              {
                role: "user",
                content: "What should I do today?",
              },
            ],
            streamMessage:(stream)=>{
              streamMessage.value = stream
            },
            final: (text) => {
              console.log("final", text);
            },
            ecb: (e) => setError(e.content),
          });
        }}
        title="Test and Save Credentials"
      ></Button>
      <Text style={{ color: "red", fontSize: 16, fontWeight: "700" }}>
        {error}
      </Text>

      <ReText multiline={true} style={{}} text={streamMessage}></ReText>
    </View>
  );
}
