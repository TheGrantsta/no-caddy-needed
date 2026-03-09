import { View, Pressable, Text } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    testId: string;
    label: string;
    selected: boolean;
    onPress?: () => void;
};

export default function SmallButton({ testId, label, selected, onPress }: Props) {
    const styles = useStyles();

    return (
        <View style={styles.smallButton.buttonContainer}>
            <Pressable
                testID={testId}
                style={[styles.smallButton.button, selected ? styles.smallButton.selected : '']}
                onPress={onPress}>
                <Text style={[styles.smallButton.buttonLabel, selected ? styles.smallButton.selected : '']}>
                    {label}
                </Text>
            </Pressable>
        </View>
    );
}
