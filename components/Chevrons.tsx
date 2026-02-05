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
                            <Text style={styles.normalText}>
                                {point}
                            </Text>
                        </View>
                    ))
                }
            </View>
        </View>
    );
}

export default Chevrons;
