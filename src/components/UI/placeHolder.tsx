import { View, Text } from "react-native";
import { Colors } from "../../theme/colors";

export const PlaceholderScreen: React.FC<{ emoji: string; title: string }> = ({
    emoji,
    title,
}) => (
    <View
        style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.cream,
            gap: 12,
        }}
    >
        <Text style={{ fontSize: 52 }}>{emoji}</Text>
        <Text
            style={{
                fontSize: 24,
                fontWeight: '900',
                color: Colors.darkText,
            }}
        >
            {title}
        </Text>
        <Text style={{ color: Colors.brownLight }}>Coming Soon...</Text>
    </View>
);