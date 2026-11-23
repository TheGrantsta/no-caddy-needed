// Putting entry logic shared by the hole screen and the scorecard edit sheet.
// The putt count (0, 1, 2 or 3+) is stored as: 0 = chip-in (first and second putt 0),
// 1 = one putt (second putt 0), 2 = two putts, 3+ = two putts with the 3-putt deadly sin.

export const DEFAULT_FIRST_PUTT_FEET = 10;
export const DEFAULT_SECOND_PUTT_FEET = 3;

export type PuttCount = 0 | 1 | 2 | 3;

// Green in regulation: the ball reached the green in (par - 2) strokes or fewer.
// Strokes to the green are the total score less the putts. A chip-in never reached the green.
export const greenInRegulation = ({ putts, score, par }: { putts: number | undefined; score: number | undefined; par: number }): boolean => {
    if (putts === undefined || putts === 0 || score === undefined) return false;
    return score - putts <= par - 2;
};

// Works out the putt count from what was saved for a hole
export const puttCountFor = ({ firstPutt, secondPutt, threePutts }: { firstPutt: number | undefined; secondPutt: number | undefined; threePutts: boolean }): PuttCount | undefined => {
    if (firstPutt === undefined) return undefined;
    if (firstPutt === 0) return 0;
    if (secondPutt === undefined || secondPutt === 0) return 1;
    return threePutts ? 3 : 2;
};

// The values stored for a hole, given the chosen putt count
export const statsForPutts = ({ putts, firstPutt, secondPutt, secondIsLong }: {
    putts: PuttCount | undefined;
    firstPutt: number | undefined;
    secondPutt: number | undefined;
    secondIsLong: boolean;
}): { firstPutt: number | undefined; secondPutt: number | undefined; secondIsLong: boolean } => {
    if (putts === undefined) return { firstPutt: undefined, secondPutt: undefined, secondIsLong: false };
    if (putts === 0) return { firstPutt: 0, secondPutt: 0, secondIsLong: false };
    if (putts === 1) return { firstPutt, secondPutt: 0, secondIsLong: false };
    return { firstPutt, secondPutt, secondIsLong };
};

// A short second putt has to finish short of the first putt
export const isShortSecondPuttInvalid = ({ putts, firstPutt, secondPutt, secondIsLong }: {
    putts: PuttCount | undefined;
    firstPutt: number | undefined;
    secondPutt: number | undefined;
    secondIsLong: boolean;
}): boolean => {
    if (putts === undefined || putts < 2 || secondIsLong) return false;
    if (firstPutt === undefined || secondPutt === undefined) return false;
    return secondPutt >= firstPutt;
};
