import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { t } from '@/assets/i18n/i18n';

type Props = {
    objective: string;
    setUp: string;
    howToPlay: string;
};
export default function Instructions({ objective, setUp, howToPlay }: Props) {
    const styles = useStyles();

    return (
        <View>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>{t('instructions.objective')}</Text> {objective}
            </Text>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>{t('instructions.setup')}</Text> {setUp}
            </Text>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>{t('instructions.howToPlay')}</Text> {howToPlay}
            </Text>
        </View>
    )
};

const localStyles = StyleSheet.create({
    contentText: {
        padding: 5,
        margin: 5,
    },
});