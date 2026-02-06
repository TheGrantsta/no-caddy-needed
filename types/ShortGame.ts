import { MaterialIcons } from "@expo/vector-icons";

export type DrillData = {
    label: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    target: string;
    objective: string;
    setup: string;
    howToPlay: string;
};

export type GameData = {
    header: string;
    objective: string;
    setup: string;
    howToPlay: string;
};

export type ShortGameCategory = 'putting' | 'chipping' | 'pitching' | 'bunker';

export type ShortGameConfig = {
    category: ShortGameCategory;
    drills: DrillData[];
    games: GameData[];
    drillsFooter: string;
    gamesFooter: string;
};
