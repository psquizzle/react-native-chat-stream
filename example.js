import React from "react";
import { View, Text, Button } from "react-native";
import { ReText } from "react-native-redash";
import { useSharedValue } from "react-native-reanimated";
import { chat } from "react-native-chat-stream";

export default function Example({}) {
  const streamMessage = useSharedValue("");
  const [error, setError] = React.useState("");

  return (
    <View>
      <Button
        onPress={async () => {
          setError(null);
          chat({
            organization: accessCredentials?.organization,
            apiKey: accessCredentials?.apiKey,
            messages: [
              {
                role: "user",
                content: "This is a test. Tell the user if it worked.",
              },
            ],
            streamMessage,
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

      <ReText style={{}} text={streamMessage}></ReText>
    </View>
  );
}
