import { useEffect, useRef, useState } from 'react';
import PuttingEntry, { PuttingEntryValue } from './PuttingEntry';
import { PuttCount, greenInRegulation, isShortSecondPuttInvalid, puttCountFor, statsForPutts } from '../utils/puttingEntry';

type Props = {
    holePar: number;
    userScore?: number;
    // Whether the 3-putt deadly sin is marked; used to read a saved hole's putt count back
    threePuttSelected: boolean;
    // first putt, second putt, second putt finished long, green in regulation
    onStatsChange: (firstPuttDistance: number | undefined, secondPuttDistance: number | undefined, secondPuttIsLong: boolean, greenInRegulation: boolean) => void;
    // Called with the chosen putt count, so the 3-putt sin can follow 3+ putts
    onPuttCountChange?: (count: PuttCount) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong?: boolean;
    showFirstPuttError?: boolean;
    onSecondPuttErrorChange?: (hasError: boolean) => void;
};

// The putting section of a hole. Holds the putt count and distances, and reports the stored values.
const PuttingStatsInput = ({
    holePar,
    userScore,
    threePuttSelected,
    onStatsChange,
    onPuttCountChange,
    initialFirstPutt,
    initialSecondPutt,
    initialSecondIsLong = false,
    showFirstPuttError = false,
    onSecondPuttErrorChange,
}: Props) => {
    const [value, setValue] = useState<PuttingEntryValue | null>(() => {
        const putts = puttCountFor({ firstPutt: initialFirstPutt, secondPutt: initialSecondPutt, threePutts: threePuttSelected });
        if (putts === undefined) return null;
        return {
            putts,
            firstPutt: initialFirstPutt ?? 0,
            secondPutt: initialSecondPutt ?? 0,
            secondIsLong: initialSecondIsLong,
        };
    });
    const initialSecondInvalid = value !== null && isShortSecondPuttInvalid(value);
    const [secondPuttError, setSecondPuttError] = useState(initialSecondInvalid);

    useEffect(() => {
        onSecondPuttErrorChange?.(secondPuttError);
    }, [secondPuttError, onSecondPuttErrorChange]);

    // Reports the stored values for a putt entry. An invalid short second putt is not reported.
    const report = (next: PuttingEntryValue) => {
        const invalid = isShortSecondPuttInvalid(next);
        setSecondPuttError(invalid);
        if (invalid) return;
        const stats = statsForPutts(next);
        onStatsChange(stats.firstPutt, stats.secondPutt, stats.secondIsLong, greenInRegulation({ putts: next.putts, score: userScore, par: holePar }));
    };

    const handleChange = (next: PuttingEntryValue) => {
        setValue(next);
        if (next.putts !== value?.putts) onPuttCountChange?.(next.putts);
        report(next);
    };

    // When the score is entered after the putts, green in regulation is worked out again
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!value || isShortSecondPuttInvalid(value)) return;
        const stats = statsForPutts(value);
        onStatsChange(stats.firstPutt, stats.secondPutt, stats.secondIsLong, greenInRegulation({ putts: value.putts, score: userScore, par: holePar }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userScore, holePar]);

    return (
        <PuttingEntry
            putts={value?.putts}
            firstPutt={value?.firstPutt}
            secondPutt={value?.secondPutt}
            secondIsLong={value?.secondIsLong ?? false}
            onChange={handleChange}
            secondPuttError={secondPuttError}
            showRequiredError={showFirstPuttError}
        />
    );
};

export default PuttingStatsInput;
