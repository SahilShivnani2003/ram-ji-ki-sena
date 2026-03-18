import { RootTabParamList } from "../navigation/TabNavigator";

export interface Itab {
    key: keyof RootTabParamList;
    icon: string;
    iconActive: string;
    component: React.ComponentType<any>;
}