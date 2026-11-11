export type ThemeColours = {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    backgroundAlternate: string;
    text: string;
    red: string;
    white: string;
    black: string;
    errorText: string;
    backgroundLight: string;
    border: string;
    borderError: string;
    green: string;
    tabInactive: string;
    // Neutral fills for pills, circle buttons and segmented tracks
    neutralFill: string;
    // Row and section dividers
    divider: string;
    // Muted surface behind value boxes and step buttons
    mutedSurface: string;
    // Icon tile backgrounds on the Stats and Practice cards
    iconTileGreen: string;
    iconTileBlue: string;
    // Ticks and target markers on the putting and tempo tools
    tickGrey: string;
    // Amber accent used for the recent subtitle
    amber: string;
    // Inactive beat dot in the tempo tool
    inactiveDot: string;
    // Table header row and dial and tile surfaces
    tableHeaderFill: string;
    dialFill: string;
    tileFill: string;
    nextButtonFill: string;
    // Inactive track of the tempo slider
    trackInactive: string;
    // Wedge chart tile and the sin dot that marks a wedge-related sin
    wedgeTile: string;
    // Background of the reassurance acknowledgement overlay
    reassuranceFill: string;
};

export const darkGreen: ThemeColours = {
    primary: '#2D5A3D',
    secondary: '#FFFFFF26',
    tertiary: '#557266',
    background: '#f5f5f0',
    backgroundAlternate: '#FFFFFF26',
    text: '#1A1A2EA6',
    white: '#fff',
    red: '#fd0303',
    black: '#000',
    errorText: '#fd0303',
    backgroundLight: '#fff',
    border: '#fff',
    borderError: '#fd0303',
    green: '#13b955',
    // Muted grey-green for unselected tab icons: readable on the light tab bar, clearly lighter than primary
    tabInactive: '#7E8A82',
    neutralFill: '#E9E9EB',
    divider: '#E0E0E0',
    mutedSurface: '#EFEFEF',
    iconTileGreen: '#E6EEE9',
    iconTileBlue: '#1F6FB2',
    tickGrey: '#C9C9CE',
    amber: '#E0A526',
    inactiveDot: '#D9D9D9',
    tableHeaderFill: '#F7F7F9',
    dialFill: '#F6F6F8',
    tileFill: '#F3F3F5',
    nextButtonFill: '#E4E6E8',
    trackInactive: '#E3E3E3',
    wedgeTile: '#B5651D',
    reassuranceFill: '#f5f5f5',
};

// Challenge tiers, from the strongest to the most relaxed handicap
export const challengeTierColours = {
    pro: '#00C851',
    d1: '#2D5A3D',
    scratch: '#4A7C59',
    handicap5: '#6B9B7F',
    handicap10: '#8CBBA4',
    handicap15: '#ADCFC9',
};

export default darkGreen;
