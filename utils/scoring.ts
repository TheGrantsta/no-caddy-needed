// A hole is a bad hole once the score is three or more over par (a triple bogey or worse)
export const isTripleBogeyOrWorse = (score: number | undefined, par: number): boolean =>
    score !== undefined && score >= par + 3;
