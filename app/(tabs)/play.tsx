import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Animated, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import HoleScoreInput from '../../components/HoleScoreInput';
import HoleNoteInput from '../../components/HoleNoteInput';
import DeadlySinsTally from '../../components/DeadlySinsTally';
import PuttingStatsInput from '../../components/PuttingStatsInput';
import SinDetailsInput from '../../components/SinDetailsInput';
import WindDisplay from '../../components/WindDisplay';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import WedgeChartScreen from '../play/wedge-chart';
import PlayerSetup from '../../components/PlayerSetup';
import Scorecard from '../../components/Scorecard';
import CtaButton from '../../components/CtaButton';
import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertHoleDeadlySinsService,
    getHoleDeadlySinsService,
    getHoleScoresService,
    getHolesWithSinsForRoundService,
    insertPuttingStatsService,
    getPuttingStatsService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    hideCourseFromRecentsService,
    hidePlayerFromRecentsService,
    getHolesPlayedForRoundService,
    getCourseHoleParsService,
    loadCourseNotesService,
    saveHoleNoteService,
    getSettingsService,
    saveSettingsService,
    getParAveragesService,
    getClubDistancesService,
    insertHoleSinDetailsService,
    getHoleSinDetailsService,
    deleteHoleSinDetailsService,
    Round,
    RoundPlayer,
    DeadlySinsRound,
    DeadlySinsValues,
    MultiplayerRoundScorecard,
    ParAverages,
    PuttingStats,
    ClubDistance,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder, cancelAllRoundReminders } from '../../service/NotificationService';
import { logEvent } from '../../service/FirebaseService';
import { maybeRequestRoundReviewService } from '../../service/ReviewService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useWind } from '../../hooks/useWind';
import { useFakeRefresh } from '../../hooks/useFakeRefresh';
import { useSectionTransition } from '../../hooks/useSectionTransition';
import { useToggle } from '../../hooks/useToggle';
import { useHoleLifecycle } from '../../hooks/useHoleLifecycle';
import PhaseScore from '../../components/PhaseScore';
import PhaseStats from '../../components/PhaseStats';
import PhaseSinDetails from '../../components/PhaseSinDetails';
import PhasePutting from '../../components/PhasePutting';
import RoundEntry from '../../components/RoundEntry';
import HoleNavigationControls from '../../components/HoleNavigationControls';
import AcknowledgeOverlay from '../../components/AcknowledgeOverlay';
import fontSizes from '../../assets/font-sizes';
import DistancesScreen from '../play/distances';

const ONBOARDING_STEPS = [
    { text: 'Start a round to track your scores hole by hole and see your running total.' },
    { text: 'Add playing partners, set the par for each hole, and record everyone\'s scores.' },
    { text: 'After your round, review your scorecard and track your 7 Deadly Sins stats over time.' },
];

const BAD_HOLE_MESSAGES = [
    'A triple bogey isn\'t the end of the round — plenty of golf left.',
    'Shake it off — reset and go get the next one.',
    'Even the pros have blow-up holes. Onward!',
    'One bad hole doesn\'t define your round. Keep grinding.',
    'Just a bump in the road. You\'ve got this!',
];

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

export default function Play() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);

    // Use lifecycle hook for hole state management
    const lifecycle = useHoleLifecycle();

    const INITIAL_SINS: DeadlySinsValues = { threePutts: false, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false };

    // Create aliases for backward compatibility with existing code
    const currentHole = lifecycle.currentHole;
    const setCurrentHole = lifecycle.setCurrentHoleValue;
    const holePhase = lifecycle.holePhase;
    const setHolePhase = lifecycle.setHolePhase;
    const skipStatsFlow = lifecycle.skipStatsFlow;
    const setSkipStatsFlow = lifecycle.setSkipStatsFlow;
    const deadlySinsValues = lifecycle.deadlySinsValues;
    const setDeadlySinsValues = lifecycle.setDeadlySinsValues;
    const puttingStats = lifecycle.puttingStats;
    const setPuttingStats = lifecycle.setPuttingStats;
    const puttingFirstPuttError = lifecycle.puttingFirstPuttError;
    const setPuttingFirstPuttError = lifecycle.setPuttingFirstPuttError;
    const puttingSecondPuttError = lifecycle.puttingSecondPuttError;
    const setPuttingSecondPuttError = lifecycle.setPuttingSecondPuttError;
    const puttingSecondPuttRequiredError = lifecycle.puttingSecondPuttRequiredError;
    const setPuttingSecondPuttRequiredError = lifecycle.setPuttingSecondPuttRequiredError;

    const [clubDistances, setClubDistances] = useState<ClubDistance[]>([]);
    const selectedOffTeeClub = lifecycle.selectedOffTeeClub;
    const setSelectedOffTeeClub = lifecycle.setSelectedOffTeeClub;
    const sinDetailsClubError = lifecycle.sinDetailsClubError;
    const setSinDetailsClubError = lifecycle.setSinDetailsClubError;
    const selectedPenaltyType = lifecycle.selectedPenaltyType;
    const setSelectedPenaltyType = lifecycle.setSelectedPenaltyType;
    const sinDetailsPenaltyError = lifecycle.sinDetailsPenaltyError;
    const setSinDetailsPenaltyError = lifecycle.setSinDetailsPenaltyError;
    const selectedBogeysClub = lifecycle.selectedBogeysClub;
    const setSelectedBogeysClub = lifecycle.setSelectedBogeysClub;
    const sinDetailsBogeysClubError = lifecycle.sinDetailsBogeysClubError;
    const setSinDetailsBogeysClubError = lifecycle.setSinDetailsBogeysClubError;
    const selectedDoubleChipReason = lifecycle.selectedDoubleChipReason;
    const setSelectedDoubleChipReason = lifecycle.setSelectedDoubleChipReason;
    const sinDetailsDoubleChipReasonError = lifecycle.sinDetailsDoubleChipReasonError;
    const setSinDetailsDoubleChipReasonError = lifecycle.setSinDetailsDoubleChipReasonError;

    const [roundHistory, setRoundHistory] = useState<Round[]>([]);
    const [showPuttingInfo, , setShowPuttingInfo] = useToggle(false);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [showPlayerSetup, , setShowPlayerSetup] = useToggle(false);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, , setShowEndRoundConfirm] = useToggle(false);
    const [scorecardData, setScorecardData] = useState<MultiplayerRoundScorecard | null>(null);
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const [recentPlayerNames, setRecentPlayerNames] = useState<string[]>([]);
    const { showError, showResult } = useAppToast();
    const { wind, heading, refreshWind } = useWind();

    const SECTION_ORDER = ['play-score', 'play-distances', 'play-wedge-chart'];
    const {
        section,
        displaySection,
        handleSubMenu,
        fadeAnim: sectionFadeAnim,
        slideAnim: sectionSlideAnim
    } = useSectionTransition(SECTION_ORDER);

    const { refreshing, onRefresh } = useFakeRefresh(
        () => setRoundHistory(getAllRoundHistoryService())
    );

    const router = useRouter();
    const [settings, setSettings] = useState(getSettingsService());
    const [showOnboarding, , setShowOnboarding] = useToggle(false);
    const [historyFilter, setHistoryFilter] = useState<1 | 10 | 'all'>('all');
    const [incompleteRound, setIncompleteRound] = useState<Round | null>(null);
    const [courseHolePars, setCourseHolePars] = useState<Record<number, number>>({});
    const [activeCourseName, setActiveCourseName] = useState<string | null>(null);
    const [scorecardSinHoles, setScorecardSinHoles] = useState<Set<number>>(new Set());
    const [selectedScorecardScore, setSelectedScorecardScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [scorecardDisplaySins, setScorecardDisplaySins] = useState<DeadlySinsValues | null>(null);
    const [courseNotes, setCourseNotes] = useState<Record<number, string>>({});
    const [currentNoteText, setCurrentNoteText] = useState('');
    const showBadHoleReassurance = lifecycle.showBadHoleReassurance;
    const setShowBadHoleReassurance = lifecycle.setShowBadHoleReassurance;
    const reassuranceMessage = lifecycle.reassuranceMessage;
    const setReassuranceMessage = lifecycle.setReassuranceMessage;
    const scrollRef = useRef<ScrollView>(null);
    const contentFadeAnim = useRef(new Animated.Value(0)).current;
    const contentSlideAnim = useRef(new Animated.Value(0)).current;
    const navDirectionRef = useRef<'next' | 'previous'>('next');
    const localStyles = styles.playScreen;
    const isLastHole = currentHole >= 18;

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            setIncompleteRound(activeRound);
            const roundPlayers = getRoundPlayersService(activeRound.Id);
            if (roundPlayers.length > 0) {
                setPlayers(roundPlayers);
            }
        }
        const history = getAllRoundHistoryService();
        setRoundHistory(history);
        setRecentCourseNames(getRecentCourseNamesService());
        setRecentPlayerNames(getRecentPlayerNamesService());
        setClubDistances(getClubDistancesService());

        const currentSettings = getSettingsService();
        setSettings(currentSettings);
        if (!currentSettings.playOnboardingSeen && history.length === 0 && !activeRound) {
            setShowOnboarding(true);
        }
    }, []);


    // Re-read the history list whenever the screen regains focus (e.g. after a
    // round is deleted on the scorecard screen and we navigate back here).
    const refreshHistoryData = useCallback(() => {
        setRoundHistory(getAllRoundHistoryService());
        setSettings(getSettingsService());
    }, []);

    useFocusEffect(refreshHistoryData);

    // Refresh wind whenever a hole loads during an active round.
    useEffect(() => {
        if (activeRoundId !== null) {
            refreshWind();
        }
    }, [currentHole, activeRoundId, refreshWind]);

    useEffect(() => {
        const offset = navDirectionRef.current === 'next' ? 40 : -40;
        contentFadeAnim.setValue(0);
        contentSlideAnim.setValue(offset);
        Animated.parallel([
            Animated.timing(contentFadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(contentSlideAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHole, holePhase]);


    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const updatedSettings = { ...settings, playOnboardingSeen: true };
        setSettings(updatedSettings);
        await saveSettingsService(updatedSettings);
    };

    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

    const handleShowPlayerSetup = () => {
        setShowPlayerSetup(true);
    };

    const handleContinueRound = async () => {
        if (!incompleteRound) return;
        logEvent('continue_round');
        if (notificationId) {
            await cancelRoundReminder(notificationId);
        } else {
            await cancelAllRoundReminders();
        }
        setSkipStatsFlow(incompleteRound.IsScoreOnly === 1);
        const holesPlayed = getHolesPlayedForRoundService(incompleteRound.Id);
        const resumeHole = holesPlayed > 0 ? holesPlayed + 1 : 1;
        setCurrentHole(resumeHole);
        setHolePhase('score');
        setActiveRoundId(incompleteRound.Id);
        const courseName = incompleteRound.CourseName ?? '';
        setActiveCourseName(courseName);
        const notes = loadCourseNotesService(courseName);
        setCourseNotes(notes);
        setCurrentNoteText(notes[resumeHole] ?? '');
        const holeData = loadHoleForScore(resumeHole);
        setCurrentHoleData(holeData);
        setIncompleteRound(null);
    };

    const handleEndIncompleteRound = async () => {
        if (!incompleteRound) return;
        await endRoundService(incompleteRound.Id);
        if (notificationId) {
            await cancelRoundReminder(notificationId);
        } else {
            await cancelAllRoundReminders();
        }
        setIncompleteRound(null);
        setPlayers([]);
        const history = getAllRoundHistoryService();
        setRoundHistory(history);
    };

    const handleStartRound = async (playerNames: string[], courseName: string) => {
        const roundId = await startRoundService(courseName, settings.skipStatsFlowEnabled);

        if (roundId) {
            logEvent('start_round');
            setSkipStatsFlow(settings.skipStatsFlowEnabled);
            const playerIds = await addRoundPlayersService(roundId, playerNames);
            const roundPlayers = playerIds.map((id, index) => ({
                Id: id,
                RoundId: roundId,
                PlayerName: index === 0 ? 'You' : playerNames[index - 1],
                IsUser: index === 0 ? 1 : 0,
                SortOrder: index,
            }));

            setActiveRoundId(roundId);
            setPlayers(roundPlayers);
            setCurrentHole(1);
            setHolePhase('score');
            const holePars = getCourseHoleParsService(courseName);
            setCourseHolePars(holePars);
            setActiveCourseName(courseName);
            const notes = loadCourseNotesService(courseName);
            setCourseNotes(notes);
            setCurrentNoteText(notes[1] ?? '');
            const par = holePars[1] ?? 4;
            const holeData = {
                holeNumber: 1,
                holePar: par,
                scores: roundPlayers.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: par })),
            };
            setCurrentHoleData(holeData);
            setShowPlayerSetup(false);
            const nId = await scheduleRoundReminder();
            setNotificationId(nId);
        } else {
            showError('Failed to start round');
        }
    };

    const handleScoresChange = (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => {
        setCurrentHoleData({ holeNumber, holePar, scores });
    };

    const buildDefaultHoleData = () => {
        const par = courseHolePars[currentHole] ?? 4;
        return {
            holeNumber: currentHole,
            holePar: par,
            scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: par })),
        };
    };

    const loadHoleForScore = (holeNumber: number) => {
        if (!activeRoundId) return buildDefaultHoleData();
        const saved = getHoleScoresService(activeRoundId, holeNumber);
        if (!saved) {
            const par = courseHolePars[holeNumber] ?? 4;
            return {
                holeNumber,
                holePar: par,
                scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: p.Id in (saved?.scores ?? {}) ? saved!.scores[p.Id] : par })),
            };
        }
        return {
            holeNumber,
            holePar: saved.holePar,
            scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: saved.scores[p.Id] ?? saved.holePar })),
        };
    };

    const loadHoleSins = (holeNumber: number): DeadlySinsValues => {
        if (!activeRoundId) return INITIAL_SINS;
        const saved = getHoleDeadlySinsService(activeRoundId, holeNumber);
        return saved ?? INITIAL_SINS;
    };

    const enterPuttingPhase = (holeNumber: number) => {
        setHolePhase('putting');
        setPuttingFirstPuttError(false);
        setPuttingSecondPuttError(false);
        setPuttingSecondPuttRequiredError(false);
        const saved = getPuttingStatsService(activeRoundId!, holeNumber);
        setPuttingStats(saved ? {
            firstPutt: saved.FirstPuttDistance,
            secondPutt: saved.SecondPuttDistance,
            secondIsLong: saved.SecondPuttIsLong === 1,
        } : null);
    };

    const isTripleBogeyOrWorse = (holeData: typeof currentHoleData): boolean => {
        if (!holeData) return false;
        const userScore = holeData.scores.find(s => {
            const player = players.find(p => p.Id === s.playerId);
            return player && player.IsUser === 1;
        })?.score;
        return userScore !== undefined && userScore >= holeData.holePar + 3;
    };

    const advanceHoleOrEndRound = () => {
        if (currentHole >= 18) {
            setShowEndRoundConfirm(true);
        } else {
            const nextHole = currentHole + 1;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentNoteText(courseNotes[nextHole] ?? '');
            setCurrentHole(nextHole);
            setHolePhase('score');
            const holeData = loadHoleForScore(nextHole);
            setCurrentHoleData(holeData);
            setPuttingStats(null);
            setSelectedOffTeeClub(undefined);
            setSinDetailsClubError(false);
            setSelectedPenaltyType(undefined);
            setSinDetailsPenaltyError(false);
            setSelectedBogeysClub(undefined);
            setSinDetailsBogeysClubError(false);
        }
    };

    const handleDismissBadHoleReassurance = () => {
        setShowBadHoleReassurance(false);
        advanceHoleOrEndRound();
    };

    const handlePreviousHole = async () => {
        navDirectionRef.current = 'previous';
        if (holePhase === 'score') {
            if (currentHole <= 1) return;
            const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
            await addMultiplayerHoleScoresService(activeRoundId!, holeNumber, holePar, scores);
            const prevHole = currentHole - 1;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentNoteText(courseNotes[prevHole] ?? '');
            setCurrentHole(prevHole);
            const holeData = loadHoleForScore(prevHole);
            setCurrentHoleData(holeData);
        } else if (holePhase === 'stats') {
            await insertHoleDeadlySinsService(activeRoundId!, currentHole, deadlySinsValues);
            if (activeCourseName !== null) {
                await saveHoleNoteService(activeCourseName, currentHole, currentNoteText);
                setCourseNotes(prev => ({ ...prev, [currentHole]: currentNoteText.trim() }));
            }
            setHolePhase('score');
            const holeData = loadHoleForScore(currentHole);
            setCurrentHoleData(holeData);
            setSelectedOffTeeClub(undefined);
            setSinDetailsClubError(false);
            setSelectedPenaltyType(undefined);
            setSinDetailsPenaltyError(false);
            setSelectedDoubleChipReason(undefined);
            setSinDetailsDoubleChipReasonError(false);
        } else if (holePhase === 'sinDetails') {
            setHolePhase('stats');
        } else if (holePhase === 'putting') {
            const shouldShowSinDetails = deadlySinsValues.troubleOffTee || deadlySinsValues.penalties || deadlySinsValues.bogeysInside9Iron || deadlySinsValues.doubleChips;
            if (shouldShowSinDetails) {
                setHolePhase('sinDetails');
            } else {
                setHolePhase('stats');
            }
        }
    };

    const handleNextHole = async () => {
        navDirectionRef.current = 'next';
        if (!activeRoundId) return;

        if (holePhase === 'score') {
            const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
            const success = await addMultiplayerHoleScoresService(activeRoundId, holeNumber, holePar, scores);
            if (success) {
                if (activeCourseName !== null) {
                    await saveHoleNoteService(activeCourseName, currentHole, currentNoteText);
                    setCourseNotes(prev => ({ ...prev, [currentHole]: currentNoteText.trim() }));
                }
                if (skipStatsFlow) {
                    // Skip stats flow: advance directly to next hole or end round
                    if (isTripleBogeyOrWorse(currentHoleData) && settings.badHoleReassuranceEnabled) {
                        setReassuranceMessage(BAD_HOLE_MESSAGES[Math.floor(Math.random() * BAD_HOLE_MESSAGES.length)]);
                        setShowBadHoleReassurance(true);
                    } else {
                        advanceHoleOrEndRound();
                    }
                } else {
                    // Normal flow: proceed to stats
                    const sins = loadHoleSins(holeNumber);
                    setDeadlySinsValues(sins);
                    setHolePhase('stats');
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
            }
        } else if (holePhase === 'stats') {
            await insertHoleDeadlySinsService(activeRoundId, currentHole, deadlySinsValues);
            const freshClubDistances = getClubDistancesService();
            setClubDistances(freshClubDistances);

            const shouldShowSinDetails = deadlySinsValues.troubleOffTee || deadlySinsValues.penalties || deadlySinsValues.bogeysInside9Iron || deadlySinsValues.doubleChips;
            if (shouldShowSinDetails) {
                const saved = getHoleSinDetailsService(activeRoundId, currentHole);
                setSelectedOffTeeClub(saved?.TroubleOffTeeClub);
                setSelectedPenaltyType(saved?.PenaltyType);
                setSelectedBogeysClub(saved?.BogeysInside9IronClub);
                setSelectedDoubleChipReason(saved?.DoubleChipsReason);
                setSinDetailsClubError(false);
                setSinDetailsPenaltyError(false);
                setSinDetailsBogeysClubError(false);
                setSinDetailsDoubleChipReasonError(false);
                setHolePhase('sinDetails');
            } else {
                await deleteHoleSinDetailsService(activeRoundId, currentHole);
                enterPuttingPhase(currentHole);
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        } else if (holePhase === 'sinDetails') {
            const needsClub = deadlySinsValues.troubleOffTee && clubDistances.length > 0;
            const needsPenalty = deadlySinsValues.penalties;
            const needsBogeysClub = deadlySinsValues.bogeysInside9Iron && clubDistances.length > 0;
            const needsDoubleChipReason = deadlySinsValues.doubleChips;
            let blocked = false;

            if (needsClub && !selectedOffTeeClub) {
                setSinDetailsClubError(true);
                blocked = true;
            } else {
                setSinDetailsClubError(false);
            }

            if (needsPenalty && !selectedPenaltyType) {
                setSinDetailsPenaltyError(true);
                blocked = true;
            } else {
                setSinDetailsPenaltyError(false);
            }

            if (needsBogeysClub && !selectedBogeysClub) {
                setSinDetailsBogeysClubError(true);
                blocked = true;
            } else {
                setSinDetailsBogeysClubError(false);
            }

            if (needsDoubleChipReason && !selectedDoubleChipReason) {
                setSinDetailsDoubleChipReasonError(true);
                blocked = true;
            } else {
                setSinDetailsDoubleChipReasonError(false);
            }

            if (blocked) return;

            await insertHoleSinDetailsService(activeRoundId, currentHole, { troubleOffTeeClub: selectedOffTeeClub, penaltyType: selectedPenaltyType, bogeysInside9IronClub: selectedBogeysClub, doubleChipsReason: selectedDoubleChipReason });
            enterPuttingPhase(currentHole);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        } else if (holePhase === 'putting') {
            if (!puttingStats || puttingStats.firstPutt === undefined) {
                setPuttingFirstPuttError(true);
                return;
            }
            if (deadlySinsValues.threePutts && puttingStats.secondPutt === undefined) {
                setPuttingSecondPuttRequiredError(true);
                return;
            }
            if (puttingSecondPuttError) {
                return;
            }
            await insertPuttingStatsService(activeRoundId, currentHole, puttingStats.firstPutt, puttingStats.secondPutt ?? 0, puttingStats.secondIsLong);
            if (isTripleBogeyOrWorse(currentHoleData) && settings.badHoleReassuranceEnabled) {
                setReassuranceMessage(BAD_HOLE_MESSAGES[Math.floor(Math.random() * BAD_HOLE_MESSAGES.length)]);
                setShowBadHoleReassurance(true);
            } else {
                advanceHoleOrEndRound();
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
    };


    const handledeadlySinsValuesChange = (values: DeadlySinsValues) => {
        setDeadlySinsValues(values);
    };

    const handleEndRoundPress = () => {
        setShowEndRoundConfirm(true);
    };

    const handleCancelEndRound = () => {
        setShowEndRoundConfirm(false);
    };

    const resetToIdle = () => {
        setActiveRoundId(null);
        setCurrentHole(1);
        setHolePhase('score');
        setDeadlySinsValues(INITIAL_SINS);
        setPuttingStats(null);
        setPuttingFirstPuttError(false);
        setPuttingSecondPuttError(false);
        setSelectedOffTeeClub(undefined);
        setSinDetailsClubError(false);
        setSelectedPenaltyType(undefined);
        setSinDetailsPenaltyError(false);
        setSelectedBogeysClub(undefined);
        setSinDetailsBogeysClubError(false);
        setPlayers([]);
        setShowPlayerSetup(false);
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setScorecardData(null);
        setScorecardSinHoles(new Set());
        setSelectedScorecardScore(null);
        setScorecardDisplaySins(null);
        setCourseHolePars({});
        setActiveCourseName(null);
        setCourseNotes({});
        setCurrentNoteText('');
        setRoundHistory(getAllRoundHistoryService());
        setRecentCourseNames(getRecentCourseNamesService());
        setRecentPlayerNames(getRecentPlayerNamesService());
    };

    const handleConfirmEndRound = async () => {
        if (!activeRoundId) return;

        logEvent('end_round');
        await cancelRoundReminder(notificationId);
        setNotificationId(null);

        if (activeCourseName !== null) {
            await saveHoleNoteService(activeCourseName, currentHole, currentNoteText);
        }

        const success = await endRoundService(activeRoundId);

        showResult(success, 'Round saved', 'Round not saved');

        const scorecard = getMultiplayerScorecardService(activeRoundId);
        if (scorecard) {
            setScorecardData(scorecard);
            setScorecardSinHoles(getHolesWithSinsForRoundService(activeRoundId));
            setShowEndRoundConfirm(false);
        } else {
            resetToIdle();
        }
    };

    const handleScorecardScoreSelect = (holeNumber: number, playerId: number) => {
        setSelectedScorecardScore({ holeNumber, playerId });
        const isUserPlayer = scorecardData?.players.find(p => p.Id === playerId)?.IsUser === 1;
        if (isUserPlayer && activeRoundId !== null) {
            const existing = getHoleDeadlySinsService(activeRoundId, holeNumber);
            setScorecardDisplaySins(existing ?? INITIAL_SINS);
        } else {
            setScorecardDisplaySins(null);
        }
    };

    const handleScorecardDone = async () => {
        resetToIdle();
        // Ask for a review after the 1st completed round, then every 6th (1, 7, 13, …).
        const roundCount = getAllRoundHistoryService().length;
        const prompted = await maybeRequestRoundReviewService(roundCount);
        if (prompted) {
            logEvent('review_requested', { roundNumber: roundCount });
        }
    };

    const isRoundActive = activeRoundId !== null;

    const filteredRoundHistory = useMemo(
        () => historyFilter === 'all' ? roundHistory : roundHistory.slice(0, historyFilter),
        [roundHistory, historyFilter]
    );
    const parAverages = useMemo(
        () => getParAveragesService(filteredRoundHistory),
        [filteredRoundHistory]
    );
    const filteredRoundIds = useMemo(
        () => new Set(filteredRoundHistory.map(r => r.Id)),
        [filteredRoundHistory]
    );
    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>Release to update</Text>
                </View>
            )}

            <ScrollView
                ref={scrollRef}
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colours.primary}
                    />
                }
            >

                <SubMenu showSubMenu="play" selectedItem={section} handleSubMenu={handleSubMenu} />

                {!isRoundActive && !scorecardData && displaySection('play-score') && (
                    <RoundEntry
                        roundHistory={roundHistory}
                        historyFilter={historyFilter}
                        onHistoryFilterChange={setHistoryFilter}
                        incompleteRound={incompleteRound}
                        notificationId={notificationId}
                        showPlayerSetup={showPlayerSetup}
                        onShowPlayerSetup={handleShowPlayerSetup}
                        onCancelPlayerSetup={() => setShowPlayerSetup(false)}
                        onContinueRound={handleContinueRound}
                        onEndIncompleteRound={handleEndIncompleteRound}
                        recentCourseNames={recentCourseNames}
                        recentPlayerNames={recentPlayerNames}
                        onStartRound={handleStartRound}
                        onRemoveCourse={(name) => {
                            hideCourseFromRecentsService(name);
                            setRecentCourseNames(getRecentCourseNamesService());
                        }}
                        onRemovePlayer={(name) => {
                            hidePlayerFromRecentsService(name);
                            setRecentPlayerNames(getRecentPlayerNamesService());
                        }}
                        parAverages={parAverages}
                        onShowOnboarding={handleShowOnboarding}
                        showOnboarding={showOnboarding}
                    />
                )}

                {isRoundActive && !scorecardData && displaySection('play-score') && (
                    <Animated.View style={[styles.container, { opacity: sectionFadeAnim, transform: [{ translateX: sectionSlideAnim }] }]}>
                        <View>
                            <Animated.View style={{ opacity: contentFadeAnim, transform: [{ translateX: contentSlideAnim }] }}>
                                {holePhase === 'score' && (
                                    <>
                                        <HoleScoreInput
                                            key={`score-${currentHole}`}
                                            holeNumber={currentHole}
                                            initialPar={courseHolePars[currentHole] ?? 4}
                                            initialScores={currentHoleData?.scores.reduce((acc, s) => ({ ...acc, [s.playerId]: s.score }), {}) ?? undefined}
                                            players={players}
                                            onScoresChange={handleScoresChange}
                                        />

                                        {!showEndRoundConfirm && (
                                            <>
                                                <HoleNoteInput
                                                    key={`note-${currentHole}`}
                                                    note={currentNoteText}
                                                    onNoteChange={setCurrentNoteText}
                                                />

                                                {settings.preShotReminderEnabled && (
                                                    <View style={[styles.holeNoteInput.container, { paddingHorizontal: 16, paddingVertical: 16, marginTop: 4, marginBottom: 12 }]}>
                                                        <Text style={[styles.normalText, { color: colours.primary, fontWeight: 'bold', marginBottom: 6 }]}>Pre-shot routine</Text>
                                                        <Text style={{ color: colours.text, fontSize: fontSizes.normal, lineHeight: 22 }}>{settings.preShotRoutineText}</Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {holePhase === 'stats' && (
                                    <PhaseStats
                                        key={`stats-${currentHole}`}
                                        holeNumber={currentHole}
                                        holePar={currentHoleData?.holePar ?? 4}
                                        sins={deadlySinsValues}
                                        onSinsChange={handledeadlySinsValuesChange}
                                        players={players}
                                        userScore={currentHoleData?.scores.find(s => {
                                            const player = players.find(p => p.Id === s.playerId);
                                            return player && player.IsUser === 1;
                                        })?.score}
                                    />
                                )}

                                {holePhase === 'sinDetails' && (
                                    <PhaseSinDetails
                                        key={`sinDetails-${currentHole}`}
                                        holeNumber={currentHole}
                                        clubDistances={clubDistances}
                                        deadlySinsValues={deadlySinsValues}
                                        selectedOffTeeClub={selectedOffTeeClub}
                                        sinDetailsClubError={sinDetailsClubError}
                                        selectedPenaltyType={selectedPenaltyType}
                                        sinDetailsPenaltyError={sinDetailsPenaltyError}
                                        selectedBogeysClub={selectedBogeysClub}
                                        sinDetailsBogeysClubError={sinDetailsBogeysClubError}
                                        selectedDoubleChipReason={selectedDoubleChipReason}
                                        sinDetailsDoubleChipReasonError={sinDetailsDoubleChipReasonError}
                                        onOffTeeClubChange={setSelectedOffTeeClub}
                                        onPenaltyTypeChange={setSelectedPenaltyType}
                                        onBogeysClubChange={setSelectedBogeysClub}
                                        onDoubleChipReasonChange={setSelectedDoubleChipReason}
                                    />
                                )}

                                {holePhase === 'putting' && (
                                    <View>
                                        <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <TouchableOpacity testID="putting-info-button" onPress={() => setShowPuttingInfo(true)} style={{ padding: 4 }}>
                                                <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                                            </TouchableOpacity>
                                            <Text style={styles.normalText}>Hole {currentHole} — Putting Stats</Text>
                                        </View>
                                        <PhasePutting
                                            key={`putting-${currentHole}`}
                                            holePar={currentHoleData?.holePar ?? 4}
                                            deadlySinsValues={deadlySinsValues}
                                            puttingStats={puttingStats}
                                            puttingFirstPuttError={puttingFirstPuttError}
                                            puttingSecondPuttError={puttingSecondPuttError}
                                            puttingSecondPuttRequiredError={puttingSecondPuttRequiredError}
                                            showPuttingInfo={showPuttingInfo}
                                            onStatsChange={(firstPutt, secondPutt, secondIsLong) => {
                                                setPuttingStats({ firstPutt, secondPutt, secondIsLong });
                                                if (firstPutt !== undefined) setPuttingFirstPuttError(false);
                                                if (secondPutt !== undefined) setPuttingSecondPuttRequiredError(false);
                                            }}
                                            onErrorChange={setPuttingSecondPuttError}
                                            onShowInfo={setShowPuttingInfo}
                                        />
                                    </View>
                                )}
                            </Animated.View>

                            {!showEndRoundConfirm && (
                                <HoleNavigationControls
                                    holePhase={holePhase}
                                    currentHole={currentHole}
                                    isLastHole={isLastHole}
                                    skipStatsFlow={skipStatsFlow}
                                    onPreviousHole={handlePreviousHole}
                                    onNextHole={handleNextHole}
                                    onEndRound={handleEndRoundPress}
                                    wind={wind}
                                    heading={heading}
                                />
                            )}

                            {showEndRoundConfirm && (
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                                    <TouchableOpacity
                                        testID="cancel-end-round-button"
                                        onPress={handleCancelEndRound}
                                        style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                    >
                                        <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="confirm-end-round-button"
                                        onPress={handleConfirmEndRound}
                                        style={styles.mediumButton}
                                    >
                                        <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}

                {scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <Text style={localStyles.scorecardHeader}>Scorecard</Text>
                        <Scorecard
                            players={scorecardData.players}
                            holeScores={scorecardData.holeScores}
                            editable
                            selectedScore={selectedScorecardScore}
                            onScoreSelect={handleScorecardScoreSelect}
                            sinHoles={scorecardSinHoles}
                        />

                        {selectedScorecardScore && scorecardDisplaySins && (
                            <DeadlySinsTally
                                key={selectedScorecardScore.holeNumber}
                                onEndRound={() => { }}
                                roundControlled
                                initialValues={scorecardDisplaySins}
                                holePar={scorecardData.holeScores.find(s => s.HoleNumber === selectedScorecardScore.holeNumber)?.HolePar}
                                userScore={scorecardData.holeScores.find(s => s.HoleNumber === selectedScorecardScore.holeNumber && s.RoundPlayerId === scorecardData.players.find(p => p.IsUser === 1)?.Id)?.Score}
                            />
                        )}
                        <CtaButton
                            testID="scorecard-done-button"
                            label="Done"
                            icon="check-circle"
                            onPress={handleScorecardDone}
                        />
                    </View>
                )}

                {displaySection('play-distances') && (
                    <Animated.View style={[styles.container, { opacity: sectionFadeAnim, transform: [{ translateX: sectionSlideAnim }] }]}>
                        <DistancesScreen />
                    </Animated.View>
                )}

                {displaySection('play-wedge-chart') && (
                    <Animated.View style={[styles.container, { opacity: sectionFadeAnim, transform: [{ translateX: sectionSlideAnim }] }]}>
                        <WedgeChartScreen />
                    </Animated.View>
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Play"
                steps={ONBOARDING_STEPS}
            />

            <AcknowledgeOverlay
                visible={showPuttingInfo}
                title="Putting Stats"
                text={
                    "If you 1-putted (holed out with the first putt), submit with 2nd-putt default value of 0.\n\n" +
                    "Short and Long refer to whether your ball finished short of the hole or past it — not left or right.\n\n" +
                    "If marked Short, your 2nd putt distance must be shorter than your 1st putt distance."
                }
                onDismiss={() => setShowPuttingInfo(false)}
                textAlign="left"
            />

            <AcknowledgeOverlay
                visible={showBadHoleReassurance}
                title="Tough hole!"
                text={reassuranceMessage}
                onDismiss={handleDismissBadHoleReassurance}
                buttonText="Move on"
                variant="reassurance"
            />
        </GestureHandlerRootView>
    );
}
