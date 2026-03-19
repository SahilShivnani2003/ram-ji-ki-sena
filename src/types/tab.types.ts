
export interface Itab<t> {
    key: keyof t;
    icon: string;
    iconActive: string;
    component: React.ComponentType<any>;
}