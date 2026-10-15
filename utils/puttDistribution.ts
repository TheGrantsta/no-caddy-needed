export type PuttCategory = 'short' | 'medium' | 'long';

/**
 * Classify a distance into a putt category.
 * - short: ≤ 6 ft
 * - medium: 8-18 ft
 * - long: ≥ 21 ft
 */
export const getPuttCategory = (distance: number): PuttCategory => {
  if (distance <= 6) return 'short';
  if (distance <= 18) return 'medium';
  return 'long';
};

/**
 * Shuffle distances ensuring no two adjacent putts belong to the same category.
 *
 * Algorithm:
 * 1. Bucket distances by category and shuffle each bucket with rng.
 * 2. Build the output sequence one position at a time:
 *    - Candidate categories: non-empty, differ from previous, and leave feasible remainder.
 *    - Feasible: max remaining count ≤ ceil(remaining/2), and ≤ floor(remaining/2) if
 *      that max equals the category just placed.
 *    - Select a random candidate and pop one distance from its bucket.
 * 3. If input is unarrangeable (e.g., all same category), fall back to plain shuffle.
 *
 * Guarantees:
 * - No two adjacent putts have the same category.
 * - Deterministic for the same rng sequence.
 * - Terminates for any rng (no retries).
 */
export const shuffleWithoutAdjacentCategories = (
  distances: number[],
  rng: () => number = Math.random
): number[] => {
  if (distances.length === 0) return [];
  if (distances.length === 1) return [...distances];

  // Bucket distances by category and shuffle each bucket
  const buckets: Record<PuttCategory, number[]> = { short: [], medium: [], long: [] };
  for (const d of distances) {
    buckets[getPuttCategory(d)].push(d);
  }

  // Shuffle each bucket with the provided rng using Fisher-Yates
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };
  shuffle(buckets.short);
  shuffle(buckets.medium);
  shuffle(buckets.long);

  const result: number[] = [];
  let prevCategory: PuttCategory | null = null;

  // Try to build the sequence constructively
  while (result.length < distances.length) {
    const remaining = distances.length - result.length;
    const counts = {
      short: buckets.short.length,
      medium: buckets.medium.length,
      long: buckets.long.length,
    };

    // Find candidates: non-empty, different from prev, and feasible.
    // Feasible: after taking one, the max remaining count must allow interleaving.
    // If we place cat, remaining count of cat becomes counts[cat] - 1.
    // The new max of all three must be <= ceil((remaining - 1) / 2).
    const candidates: PuttCategory[] = [];
    for (const cat of ['short', 'medium', 'long'] as const) {
      if (counts[cat] === 0) continue; // Empty bucket
      if (cat === prevCategory) continue; // Same as previous

      // After placing cat, the new counts would be:
      const newCounts = { ...counts, [cat]: counts[cat] - 1 };
      const newMax = Math.max(newCounts.short, newCounts.medium, newCounts.long);
      const newRemaining = remaining - 1;

      // The new max must fit within ceil(newRemaining / 2) interleaving slots
      if (newMax <= Math.ceil(newRemaining / 2)) {
        candidates.push(cat);
      }
    }

    // If no candidates, we have an unarrangeable input (e.g., all same category).
    // Fall back to plain shuffle: dump remaining and shuffle with rng.
    if (candidates.length === 0) {
      const remaining: number[] = [];
      for (const cat of ['short', 'medium', 'long'] as const) {
        remaining.push(...buckets[cat]);
      }
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      result.push(...remaining);
      break;
    }

    // Pick a random candidate and pop from its bucket
    const selectedIdx = Math.floor(rng() * candidates.length);
    const selectedCat = candidates[selectedIdx];
    result.push(buckets[selectedCat].pop()!);
    prevCategory = selectedCat;
  }

  return result;
};
