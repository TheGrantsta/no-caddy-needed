import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import fontSizes from '@/assets/font-sizes';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    type: 'drill' | 'game';
    onUndo: () => void;
}

export default function UndoDeleteNotification({ type, onUndo }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { bottom: bottomInset } = useSafeAreaInsets();

    return (
        <TouchableOpacity
            testID={type === 'drill' ? 'undo-drill-delete' : 'undo-game-delete'}
            style={[{
                backgroundColor: colours.primary,
                position: 'absolute',
                bottom: bottomInset,
                zIndex: 10,
                padding: 12,
                borderColor: colours.red,
                borderLeftWidth: 10,
                width: '90%',
                alignSelf: 'center'
            }]}
            onPress={onUndo}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.updateText, { color: colours.background, fontSize: fontSizes.normal, fontWeight: 'bold' }]}>
                    Undo delete
                </Text>
                <MaterialIcons name="undo" size={20} color={colours.background} />
            </View>
        </TouchableOpacity>
    );
}
