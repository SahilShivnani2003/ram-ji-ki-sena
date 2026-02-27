import { Text, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Colors, SacredSymbols } from "../theme/colors";
import { useEffect } from "react";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type splashProps = NativeStackScreenProps<RootStackParamList, 'splash'>

export const SplashScreen = ({ navigation }: splashProps) => {
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('Login')
        }, (5000));
    }, [])
    return (
        <LinearGradient
            colors={['#7F0000', '#B71C1C', '#E65100']}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
            <Text style={{ fontSize: 72, color: Colors.gold }}>{SacredSymbols.om}</Text>
            <Text
                style={{ fontSize: 28, fontWeight: '900', color: Colors.white }}
            >
                सनातन सेवा
            </Text>
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 16 }} />
        </LinearGradient>
    )

};