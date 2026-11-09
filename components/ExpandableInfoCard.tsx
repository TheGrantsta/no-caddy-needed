import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    icon: string;
    title: string;
    points: string[];
    // Prefix for test IDs: `${testIDPrefix}-card`, `-row`, `-points`
    testIDPrefix: string;
};

// Collapsible card: an icon tile and title that open to a list of chevron-marked points
const ExpandableInfoCard = ({ icon, title, points, testIDPrefix }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.practiceCards;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View testID={`${testIDPrefix}-card`} style={s.learnCard}>
            <TouchableOpacity
                testID={`${testIDPrefix}-row`}
                accessibilityRole="button"
                onPress={() => setIsOpen(!isOpen)}
                style={s.learnRow}
            >
                <View style={s.learnIcon}>
                    <MaterialIcons name={icon as any} size={22} color={colours.white} />
                </View>
                <Text style={s.learnText}>{title}</Text>
                <MaterialIcons name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color={colours.tertiary} />
            </TouchableOpacity>
            {isOpen && (
                <View testID={`${testIDPrefix}-points`} style={s.points}>
                    {points.map(point => (
                        <View key={point} style={s.pointRow}>
                            <MaterialIcons name="chevron-right" size={18} color={colours.primary} />
                            <Text style={s.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default ExpandableInfoCard;
