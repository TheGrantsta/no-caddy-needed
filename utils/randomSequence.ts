// Plain-English summary of the numbers a From / To / Increment setting can produce
const SHOWN_EXAMPLES = 3;

export const describeSequence = (from: string, to: string, increment: string): string | null => {
    const start = Number(from);
    const end = Number(to);
    const step = Number(increment);

    if (from.trim() === '' || to.trim() === '' || increment.trim() === '') return null;
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step)) return null;
    if (step <= 0 || start > end) return null;

    const values: number[] = [];
    for (let value = start; value <= end; value += step) {
        values.push(value);
    }

    const examples = values.slice(0, SHOWN_EXAMPLES).join(', ');
    const ellipsis = values.length > SHOWN_EXAMPLES ? '…' : '';
    return `Numbers from ${start} to ${end} inclusive, in steps of ${step}: ${examples}${ellipsis}`;
};
