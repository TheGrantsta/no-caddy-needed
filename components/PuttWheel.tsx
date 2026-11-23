import { Picker } from '@react-native-picker/picker';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

type Props = {
    testID: string;
    value: number;
    max: number;
    onChange: (feet: number) => void;
};

// The native iOS wheel for choosing a putt distance from 1 ft up to the maximum
export default function PuttWheel({ testID, value, max, onChange }: Props) {
    const colours = useThemeColours();
    const feet = Array.from({ length: max }, (_, i) => i + 1);

    return (
        <Picker
            testID={testID}
            selectedValue={value}
            onValueChange={next => onChange(Number(next))}
            itemStyle={{ color: colours.black, fontSize: fontSizes.normal }}
        >
            {feet.map(n => (
                <Picker.Item key={n} label={`${n} ft`} value={n} />
            ))}
        </Picker>
    );
}
