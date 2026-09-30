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
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        opacity: previousDisabled ? 0.5 : 1,
                    },
                ]}
            >
                <MaterialIcons
                    name="skip-previous"
                    size={20}
                    color={colours.primary}
                />
                <Text style={[styles.normalText, { color: colours.primary, fontWeight: '600' }]}>
                    Previous
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                testID={nextTestID}
                onPress={onNext}
                style={[
                    styles.buttonFilled,
                    {
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 8,
                    },
                ]}
            >
                <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                    {isLastStep ? 'Finish' : 'Next'}
                </Text>
                <MaterialIcons
                    name={isLastStep ? 'check' : 'skip-next'}
                    size={20}
                    color={colours.white}
                />
            </TouchableOpacity>
        </View>
    );
}
