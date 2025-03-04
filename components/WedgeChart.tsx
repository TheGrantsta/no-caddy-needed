import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getWedgeChartService, insertWedgeChartService } from '../service/DbService';
import Chrevons from './Chevrons';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';
import styles from '@/assets/stlyes';

type Props = {
    isShowButtons: boolean;
}

export default function WedgeChart({ isShowButtons }: Props) {
    const [isError, setIsError] = useState(false);
    const [isAddChart, setIsAddChart] = useState(false);
    const [isAddNewChart, setIsAddNewChart] = useState(false);
    const [isEditChart, setIsEditChart] = useState(false);
    const [wedgeChart, setWedgeChart] = useState<any[][]>([]);
    const [tempWedgeChart, setTempWedgeChart] = useState<any[][]>([]);

    const handleInputChange = (value: any, id: any) => {
        const ids = id.split('_');

        tempWedgeChart[Number(ids[0])][Number(ids[1])] = value;

        setTempWedgeChart(tempWedgeChart);
    };

    const validateInput = () => {
        let isError = false;

        for (let r = 1; r < 5; r++) {
            for (let c = 1; c < 4; c++) {
                const value = tempWedgeChart[r][c];

                if (value === '' || isNaN(Number(value))) {
                    isError = true;
                }
            }
        }

        setIsError(isError);

        if (!isError) {
            insertWedgeChartService(tempWedgeChart);

            setTimeout(() => {
                setIsAddChart(false);
                setIsAddNewChart(false);
                setIsEditChart(true);
                setWedgeChart(tempWedgeChart);
            }, 750);
        }
    };

    const onButtonAdd = () => {
        getTempWedgeChart();

        setTempWedgeChart(tempWedgeChart);
        setIsAddChart(false);
        setIsAddNewChart(true);
        setIsEditChart(false);
    };

    const onButtonEdit = () => {
        getTempWedgeChart();

        setIsAddChart(false);
        setIsAddNewChart(true);
        setIsEditChart(false);
    };

    const onCancelEdit = () => {
        setIsAddChart(wedgeChart.length === 0);
        setIsAddNewChart(false);
        setIsEditChart(wedgeChart.length > 0);
        setIsError(false);
    };

    useEffect(() => {
        fetchDataBeforeRender();
    }, []);

    const fetchDataBeforeRender = async () => {
        const data = getWedgeChartService();

        setWedgeChart(data);

        setIsAddChart(data.length === 0);
        setIsAddNewChart(false);
        setIsEditChart(data.length > 0);
    };

    const getTempWedgeChart = () => {
        if (tempWedgeChart.length === 0) {
            tempWedgeChart.push(['Swing/Wedge', '1/2', '3/4', 'Full']);
            tempWedgeChart.push(['PW', '', '', '']);
            tempWedgeChart.push(['GW', '', '', '']);
            tempWedgeChart.push(['SW', '', '', '']);
            tempWedgeChart.push(['LW', '', '', '']);
        }

        setTempWedgeChart(tempWedgeChart);
    };

    const points = ['Record your carry distances', 'Replicate your conditions', 'Visualize your data', 'Use a launch monitor'];

    return (
        <View style={styles.container}>

            {/* Heading */}
            <Text style={styles.subHeaderText}>
                Wedge chart
            </Text>

            <View>
                {/* Add wedge chart */}
                {isAddChart && (
                    <View>
                        <View style={styles.container}>
                            <Text style={styles.normalText}>
                                Wedge chart not set
                            </Text>
                        </View>

                        {isShowButtons && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity testID='add-button' style={styles.button} onPress={onButtonAdd}>
                                    <Text style={styles.buttonText}>
                                        Add
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Add new wedge chart */}
                {isAddNewChart && (
                    <View>
                        <View style={styles.table}>
                            {
                                tempWedgeChart.map((row, rowIndex) => (
                                    <View key={rowIndex} style={styles.row}>
                                        {row.map((cell, colIndex) => (
                                            rowIndex === 0 || colIndex === 0 ? (
                                                <Text key={colIndex}
                                                    style={[styles.cell, rowIndex === 0 ? localStyles.smallHeader :
                                                        colIndex === 0 ? styles.bold : '']}>
                                                    {cell}
                                                </Text>
                                            ) : <TextInput
                                                key={`${rowIndex}_${colIndex}`}
                                                onChangeText={(value) => { handleInputChange(value, `${rowIndex}_${colIndex}`); }}
                                                style={[styles.cell, localStyles.input]}
                                                keyboardType='number-pad'
                                            />
                                        ))}
                                    </View>
                                ))
                            }
                        </View>
                        {isError ? <Text style={styles.errorText}>Enter values for every cell. If N/A, use 0</Text> : null}

                        {isShowButtons && (
                            <View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity testID='cancel-button' style={styles.button} onPress={onCancelEdit}>
                                        <Text style={styles.buttonText}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity testID='save-button' style={styles.button} onPress={validateInput}>
                                        <Text style={styles.buttonText}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Chrevons heading='How to create a wedge chart' points={points} />
                            </View>
                        )}
                    </View>
                )}

                {/* Edit wedge chart */}
                {isEditChart && (
                    <View>
                        <View style={styles.table}>
                            {
                                wedgeChart.map((row, rowIndex) => (
                                    <View key={rowIndex} style={styles.row}>
                                        {row.map((cell, colIndex) => (
                                            <Text key={colIndex}
                                                style={[styles.cell, rowIndex === 0 ? localStyles.smallHeader :
                                                    colIndex === 0 ? styles.bold : '']}>
                                                {cell}
                                            </Text>
                                        ))}
                                    </View>
                                ))
                            }
                        </View>

                        {isShowButtons && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity testID='add-button' style={styles.button} onPress={onButtonEdit}>
                                    <Text style={styles.buttonText}>
                                        Edit
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View >
    )
};

const localStyles = StyleSheet.create({
    input: {
        backgroundColor: colours.backgroundAlternate,
        color: colours.black,
    },
    smallHeader: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
});
