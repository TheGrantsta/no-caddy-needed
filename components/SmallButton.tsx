import { StyleSheet, View, Pressable, Text } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    testId: string;
    label: string;
    selected: boolean;
    onPress?: () => void;
};

export default function SmallButton({ testId, label, selected, onPress }: Props) {
    return (
        <View style={styles.buttonContainer}>
            <Pressable
                testID={testId}
                style={[styles.button, selected ? styles.selected : '']}
                onPress={onPress}>
                <Text style={[styles.buttonLabel, selected ? styles.selected : '']}>
                    {label}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 175,
        height: 38,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderRadius: 10,
        borderColor: colours.yellow,
        borderWidth: 1,
        backgroundColor: colours.mutedYellow,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: colours.text,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
    selected: {
        color: colours.background,
        backgroundColor: colours.yellow,
    },
});
