import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { getAllDeadlySinsRoundsService } from '../../service/DbService';
import { sortDeadlySinsByFrequency } from '../../service/deadlySinCategories';
import { useStyles } from '../../hooks/useStyles';
import DeadlySinTrendPage from '@/components/DeadlySinTrendPage';
import DeadlySinTrendIndicators from '@/components/DeadlySinTrendIndicators';

const MAX_ROUNDS = 20;

export default function DeadlySinTrendScreen() {
    const { sinKey, filter } = useLocalSearchParams<{ sinKey: string; label: string; filter?: string }>();
    const styles = useStyles();
    const width = Dimensions.get('window').width;

    const allRounds = getAllDeadlySinsRoundsService();
    const limit = filter === '1' ? 1 : filter === '10' ? 10 : MAX_ROUNDS;
    const rounds = allRounds.slice().reverse().slice(-limit);

    // Pages follow the same frequency order shown in the Deadly Sins bar chart.
    const categories = sortDeadlySinsByFrequency(rounds);
    const initialIndex = Math.max(0, categories.findIndex(c => c.key === sinKey));
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const listRef = useRef<FlatList<typeof categories[number]>>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index !== activeIndex) setActiveIndex(index);
    };

    return (
        <GestureHandlerRootView style={styles.scrollContainer}>
            <FlatList
                testID="deadly-sin-trend-pager"
                ref={listRef}
                data={categories}
                keyExtractor={(c) => c.key as string}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item }) => (
                    <DeadlySinTrendPage category={item} rounds={rounds} width={width} />
                )}
            />
            <DeadlySinTrendIndicators categories={categories} activeIndex={activeIndex} />
        </GestureHandlerRootView>
    );
}
