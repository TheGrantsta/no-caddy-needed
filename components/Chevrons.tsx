import React from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    heading: string;
    points: string[];
}

function Chevrons({ heading, points }: Props): React.JSX.Element {
    const styles = useStyles();
    const colours = useThemeColours();

    const renderPoint = (point: string, index: number) => {
        const colonIndex = point.indexOf(':');

        if (colonIndex === -1) {
            return (
                <Text style={styles.normalText}>
                    {point}
                </Text>
            );
        }

        const label = point.substring(0, colonIndex + 1);
        const description = point.substring(colonIndex + 1);

        return (
            <Text style={styles.normalText}>
                <Text testID={`point-label-${index}`} style={{ color: colours.yellow }}>{label}</Text>
                <Text testID={`point-description-${index}`}>{description}</Text>
            </Text>
        );
    };

    return (
        <View>
            <Text style={styles.subHeaderText}>
                {heading}
            </Text>
            <View>
                {
                    points.map((point, index) => (
                        <View key={index} style={styles.principlesContainer}>
                            <MaterialIcons name="chevron-right" color={colours.yellow} size={24} />
                            {renderPoint(point, index)}
                        </View>
                    ))
                }
            </View>
        </View>
    );
}

export default Chevrons;
