import React from 'react';
import { View } from 'react-native';
import { DeadlySinCategory } from '@/service/deadlySinCategories';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    categories: DeadlySinCategory[];
    activeIndex: number;
}

export default function DeadlySinTrendIndicators({ categories, activeIndex }: Props) {
    const styles = useStyles();

    return (
        <View testID="deadly-sin-trend-indicators" style={styles.pagerDotRow}>
            {categories.map((c, i) => (
                <View
                    key={c.key as string}
                    testID={`deadly-sin-trend-indicator-${i}`}
                    style={[styles.pagerDot, i === activeIndex && styles.pagerDotActive]}
                />
            ))}
        </View>
    );
}
