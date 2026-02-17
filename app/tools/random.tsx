import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getRandomNumber } from '../../assets/random-number';
import Chevrons from '@/components/Chevrons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import fontSizes from '@/assets/font-sizes';
import { t } from '@/assets/i18n/i18n';

export default function Random() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [rangeText, setRangeText] = useState('30-100');
    const [rangeError, setRangeError] = useState('');
    const [incrementText, setIncrementText] = useState('10');
    const [incrementError, setIncrementError] = useState('');
    const [randomNumber, setRandomNumber] = useState(0);

    const handleGenerate = () => {
        if (rangeText.length < 1) {
            setRangeError(t('random.rangeEmpty'));
        }
        if (incrementText.length < 1) {
            setIncrementError(t('random.incrementEmpty'));
        }
        if (rangeText.length > 0 && incrementText.length > 0) {
            setRandomNumber(getRandomNumber(rangeText, incrementText, randomNumber));
        }
    };

    const handleRangeInput = (text: any) => {
        const formattedText = text.replace(/[^0-9-]/g, '');
        setRangeText(formattedText);
    }

    const handleIncrementInput = (text: any) => {
        const formattedText = text.replace(/[^0-9]/g, '');
        setIncrementText(formattedText);
    }

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRangeText('30-100');
            setIncrementText('10');
            setRangeError('');
            setIncrementError('');
            setRandomNumber(0);
            setRefreshing(false);
        }, 750);
    };

    const points = [t('random.purposePoint1'), t('random.purposePoint2'), t('random.purposePoint3')];

    const localStyles = useMemo(() => StyleSheet.create({
        randomNumberContainer: {
            backgroundColor: colours.background,
            borderColor: colours.yellow,
            borderWidth: 2,
            borderRadius: 12,
            margin: 15,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        },
        randomNumberText: {
            color: colours.yellow,
            fontSize: fontSizes.massive,
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'Arial',
        },
    }), [colours]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        {t('common.releaseToUpdate')}
                    </Text>
                </View>
            )}

            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.yellow} />
            }>
                <View>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            {t('random.title')}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.textLabel, { width: 80 }]}>
                            {t('random.rangeLabel')}
                        </Text>
                        <TextInput
                            style={[styles.textInput, rangeError ? styles.textInputError : null, { width: 150 }]}
                            value={rangeText}
                            placeholder={t('random.rangePlaceholder')}
                            onChangeText={(value) => {
                                handleRangeInput(value)
                                if (rangeError) setRangeError('');
                            }}
                            keyboardType='numbers-and-punctuation'
                        />
                    </View>
                    {rangeError ? <Text style={[styles.errorText, { marginLeft: 100 }]}>{rangeError}</Text> : null}

                    <View>
                        <Text style={styles.smallestText}>
                            {t('random.rangeDescription')}
                        </Text>
                    </View>

                    <View style={[{ flexDirection: 'row' }, styles.marginTop]}>
                        <Text style={[styles.textLabel, { width: 80 }]}>
                            {t('random.incrementLabel')}
                        </Text>
                        <TextInput
                            style={[styles.textInput, incrementError ? styles.textInputError : null, { width: 100 }]}
                            value={incrementText}
                            placeholder={t('random.incrementPlaceholder')}
                            onChangeText={(value) => {
                                handleIncrementInput(value)
                                if (incrementError) setIncrementError('');
                            }}
                            keyboardType='number-pad'
                        />
                    </View>
                    {incrementError ? <Text style={[styles.errorText, { marginLeft: 100 }]}>{incrementError}</Text> : null}

                    <View>
                        <Text style={styles.smallestText}>
                            {t('random.incrementDescription')}
                        </Text>
                    </View>

                    {/* {randomNumber > 0 && (
                        <View style={localStyles.randomNumberContainer}>
                            <Text style={localStyles.randomNumberText}>
                                {randomNumber}
                            </Text>
                        </View>
                    )} */}

                    <View style={styles.marginTop}>
                        <TouchableOpacity testID='save-button' style={styles.button} onPress={handleGenerate}>
                            <Text style={styles.buttonText}>
                                {t('common.run')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {randomNumber > 0 && (
                        <View style={localStyles.randomNumberContainer}>
                            <Text style={localStyles.randomNumberText}>
                                {randomNumber}
                            </Text>
                        </View>
                    )}

                    <Chevrons heading={t('random.purposeHeading')} points={points} />
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};