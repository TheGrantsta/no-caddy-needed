import { DeadlySinsValues } from '../service/DbService';

// Sins that carry a follow-up detail (club, penalty type or double chip reason).
// Three-putts, double bogeys and bogeys on par 5s have none.
export const hasSinDetails = (sins: DeadlySinsValues): boolean =>
    sins.troubleOffTee || sins.penalties || sins.bogeysInside9Iron || sins.doubleChips;
