import colours from '@/assets/colours';

export type ScoreMarkerCategory = 'eagle' | 'birdie' | 'par' | 'bogey' | 'doubleBogey';

export type ScoreMarker = {
    category: ScoreMarkerCategory;
    background: string;
    text: string;
};

// Circle colours for each category, taken from the colour tokens
export const SCORE_MARKER_COLOURS = {
    eagle: colours.scoreEagle,
    birdie: colours.errorText,
    par: colours.scorePar,
    bogey: colours.black,
    doubleBogey: colours.scoreDoubleBogey,
};

// Every score sits in a coloured circle, chosen by how far it is from par
export const getScoreMarker = (diff: number): ScoreMarker => {
    if (diff <= -2) return { category: 'eagle', background: SCORE_MARKER_COLOURS.eagle, text: colours.white };
    if (diff === -1) return { category: 'birdie', background: SCORE_MARKER_COLOURS.birdie, text: colours.white };
    if (diff === 0) return { category: 'par', background: SCORE_MARKER_COLOURS.par, text: colours.white };
    if (diff === 1) return { category: 'bogey', background: SCORE_MARKER_COLOURS.bogey, text: colours.white };
    return { category: 'doubleBogey', background: SCORE_MARKER_COLOURS.doubleBogey, text: colours.white };
};
