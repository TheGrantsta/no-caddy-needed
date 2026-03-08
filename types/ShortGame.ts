import { MaterialIcons } from "@expo/vector-icons";

export type DrillData = {
    id?: number;
    label: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    target: string;
    objective: string;
    setup: string;
    howToPlay: string;
};

export type GameData = {
    id?: number;
    header: string;
    objective: string;
    setup: string;
    howToPlay: string;
};

export type ShortGameCategory = 'putting' | 'chipping' | 'pitching' | 'bunker';

export type ShortGameConfig = {
    category: ShortGameCategory;
    drillsFooter: string;
    gamesFooter: string;
};
