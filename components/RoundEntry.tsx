import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CtaButton from './CtaButton';
import PageHeader from './PageHeader';
import PlayerSetup from './PlayerSetup';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    incompleteRound: { Id: number; CourseName?: string } | null;
    onContinueRound: () => Promise<void>;
    onEndIncompleteRound: () => Promise<void>;
    recentCourseNames: string[];
    onStartRound: (playerNames: string[], courseName: string) => Promise<void>;
    onRemoveCourse: (name: string) => void;
    onShowOnboarding: () => void;
}

export default function RoundEntry({
    incompleteRound,
    onContinueRound,
    onEndIncompleteRound,
    recentCourseNames,
    onStartRound,
    onRemoveCourse,
    onShowOnboarding,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const localStyles = styles.playScreen;

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.container}>
                <PageHeader
                    title="Play"
                    rightAction={
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help"
                            testID="play-onboarding-info-button"
                            onPress={onShowOnboarding}
                            style={styles.practiceHeader.circleButton}
                        >
                            <MaterialIcons name="info-outline" size={22} color={colours.text} />
                        </TouchableOpacity>
                    }
                />

                {incompleteRound ? (
                    <>
                        <Text style={[styles.normalText, styles.marginBottom]}>
                            Continue or end previously started round that was not completed
                        </Text>
                        <CtaButton
                            testID="continue-round-button"
                            label="Continue round"
                            icon="play-circle-outline"
                            onPress={onContinueRound}
                            style={styles.marginTop}
                        />
                        <TouchableOpacity
                            testID="end-incomplete-round-link"
                            onPress={onEndIncompleteRound}
                            style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}
                        >
                            <Text style={localStyles.endRoundLink}>End round</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <PlayerSetup
                        onStartRound={onStartRound}
                        recentCourseNames={recentCourseNames}
                        onRemoveCourse={onRemoveCourse}
                    />
                )}
            </View>
        </ScrollView>
    );
}
