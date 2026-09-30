import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    onPrevious: () => void;
    onNext: () => void;
    previousDisabled: boolean;
    isLastStep: boolean;
    previousTestID?: string;
    nextTestID?: string;
};

export default function ChallengeNavButtons({
    onPrevious,
    onNext,
    previousDisabled,
    isLastStep,
    previousTestID = 'previous-button',
    nextTestID = 'next-button',
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View style={[styles.navRow, { justifyContent: 'space-between', marginTop: 32 }]}>
            <TouchableOpacity
                testID={previousTestID}
                onPress={onPrevious}
                disabled={previousDisabled}
                style={[
                    styles.buttonOutlined,
                    {
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        opacity: previousDisabled ? 0.5 : 1,
                    },
                ]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons
                        name="chevron-left"
                        size={24}
                        color={colours.primary}
                    />
                    <Text style={[styles.buttonText, { color: colours.primary }]}>Previous</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                testID={nextTestID}
                onPress={onNext}
                style={[
                    styles.buttonFilled,
                    {
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                    },
                ]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.buttonText, { color: colours.white }]}>
                        {isLastStep ? 'Finish' : 'Next'}
                    </Text>
                    <MaterialIcons
                        name={isLastStep ? 'check' : 'chevron-right'}
                        size={24}
                        color={colours.white}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}
