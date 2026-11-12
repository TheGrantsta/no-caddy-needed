// The order a round is played in. A round covers all 18 holes, starting on any hole (a shotgun start):
// starting on hole 10 plays 10, 11 … 18, 1 … 9, and the round ends back at the starting hole.

export const HOLES_PER_ROUND = 18;

// The hole played after `hole`, wrapping from 18 to 1
export const nextHoleInRound = (hole: number, _startHole: number): number =>
    hole >= HOLES_PER_ROUND ? 1 : hole + 1;

// The hole played before `hole`, wrapping from 1 to 18
export const previousHoleInRound = (hole: number, _startHole: number): number =>
    hole <= 1 ? HOLES_PER_ROUND : hole - 1;

export const isFirstHoleOfRound = (hole: number, startHole: number): boolean => hole === startHole;

// The last hole is the one just before the starting hole
export const isLastHoleOfRound = (hole: number, startHole: number): boolean =>
    nextHoleInRound(hole, startHole) === startHole;

// The hole at a play position (0 to 17) for a round starting on `startHole`
export const holeAtPlayPosition = (startHole: number, position: number): number =>
    ((startHole - 1 + position) % HOLES_PER_ROUND) + 1;

// Any saved or passed starting hole that isn't 1 to 18 starts on hole 1
export const sanitiseStartHole = (value: number | null | undefined): number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= HOLES_PER_ROUND ? value : 1;
