import React, { useRef } from 'react';
import { FlatList, View } from 'react-native';
import CtaButton from './CtaButton';
import { useStyles } from '@/hooks/useStyles';

interface TestItem {
    type: 'drill' | 'game';
    id?: number;
    data: any;
}

interface Props {
    tests: TestItem[];
    activeIndex: number;
    onScroll: (event: any) => void;
    onAddTest: () => void;
    renderItem: (props: { item: TestItem }) => React.ReactElement;
}

export default function TestPager({
    tests,
    activeIndex,
    onScroll,
    onAddTest,
    renderItem,
}: Props) {
    const styles = useStyles();
    const s = styles.deadlySinsTally;
    const flatListRef = useRef(null);

    return (
        <>
            <View style={styles.horizontalScrollContainer}>
                <FlatList
                    ref={flatListRef}
                    data={tests}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.type}-${item.id ?? index}`}
                />
            </View>

            <View style={styles.scrollIndicatorContainer}>
                {tests.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.scrollIndicatorDot,
                            activeIndex === index && styles.scrollActiveDot,
                        ]}
                    />
                ))}
            </View>

            <View style={s.container}>
                <CtaButton
                    testID="add-drill-button"
                    label="Add test"
                    icon="add"
                    onPress={onAddTest}
                />
            </View>
        </>
    );
}
