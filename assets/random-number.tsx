export const getRandomNumber = (range: any, increment: any, previousNumber: any) => {
    const parts = getRangeParts(range);
    let min = Math.min(Number(parts[0]), Math.abs(Number(parts[1])));
    const max = Math.max(Number(parts[0]), Math.abs(Number(parts[1])));

    type KeyValuePair = {
        key: number;
        value: number;
    }

    let numbers: KeyValuePair[] = [];

    do {
        if (min !== previousNumber) {
            numbers.push({ key: Math.floor(Math.random() * 100), value: min });
        }
        min += Number(increment);
    } while (min <= max);

    const sortByKey = [...numbers].sort((a, b) => a.key - b.key);

    return numbers.length === 0 ? 0 : sortByKey[0].value;
};

function getRangeParts(input: string): string[] {
    let range = input;

    if (input.startsWith('-')) {
        range = input.slice(1);
    }

    return range.replace(/-{2,}/g, '-').split('-');
}