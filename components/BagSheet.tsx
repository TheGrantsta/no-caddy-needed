import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import type { WedgeChartData } from '../service/DbService';
import { yardsToDisplayUnit, DistanceUnit } from '../service/UnitsService';

type ClubDistance = { Id: number; Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number };

type Props = {
    visible: boolean;
    onClose: () => void;
    clubDistances: ClubDistance[];
    wedgeChart: WedgeChartData;
    units: DistanceUnit;
};

type Tab = 'distances' | 'wedges';

// In-round yardages: carry distances for each club, plus the wedge chart
const BagSheet = ({ visible, onClose, clubDistances, wedgeChart, units }: Props) => {
    const styles = useStyles();
    const s = styles.bagSheet;
    const [tab, setTab] = useState<Tab>('distances');
    const unitLabel = units === 'metres' ? 'm' : 'yd';
    const formatYards = (yards: number) => `${yardsToDisplayUnit(yards, units)} ${unitLabel}`;

    if (!visible) return null;

    return (
        <Modal transparent visible animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={s.backdrop} />
            <View style={s.sheet}>
                <View style={s.handle} />
                <View style={s.header}>
                    <Text style={s.title}>Yardages</Text>
                    <TouchableOpacity testID="bag-sheet-close-button" accessibilityRole="button" onPress={onClose} style={s.cancelPill}>
                        <Text style={s.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.segment}>
                    <TouchableOpacity
                        testID="bag-sheet-tab-distances"
                        onPress={() => setTab('distances')}
                        style={[s.segmentOption, tab === 'distances' && s.segmentOptionActive]}
                    >
                        <Text style={[s.segmentText, tab === 'distances' && s.segmentTextActive]}>Distances</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="bag-sheet-tab-wedges"
                        onPress={() => setTab('wedges')}
                        style={[s.segmentOption, tab === 'wedges' && s.segmentOptionActive]}
                    >
                        <Text style={[s.segmentText, tab === 'wedges' && s.segmentTextActive]}>Wedges</Text>
                    </TouchableOpacity>
                </View>

                {tab === 'distances' ? (
                    <ScrollView testID="bag-sheet-distances" style={s.list}>
                        <View style={s.card}>
                            {clubDistances.map((club, index) => (
                                <View key={club.Id} style={[s.row, index > 0 && s.rowDivider]}>
                                    <Text style={s.clubText}>{club.Club}</Text>
                                    <Text style={s.valueText}>{formatYards(club.CarryDistance)}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView testID="bag-sheet-wedges" style={s.list}>
                        <View style={s.card}>
                            {wedgeChart.clubs.map((wedge, index) => (
                                <View key={`${wedge.club}-${index}`} style={[s.row, index > 0 && s.rowDivider]}>
                                    <Text style={s.clubText}>{wedge.club}</Text>
                                    <View style={s.wedgeCells}>
                                        {wedge.distances.map(d => (
                                            <View key={d.name} testID={`wedge-cell-${wedge.club}-${d.name}`} style={s.wedgeCell}>
                                                <Text style={s.wedgeLabel}>{d.name}</Text>
                                                <Text testID={`wedge-value-${wedge.club}-${d.name}`} style={s.valueText}>
                                                    {yardsToDisplayUnit(d.distance, units)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}

                <Text style={s.footnote}>{`Carry, ${units === 'metres' ? 'metres' : 'yards'}.`}</Text>
            </View>
        </Modal>
    );
};

export default BagSheet;
