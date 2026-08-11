import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    const [refreshing, setRefreshing] = useState(false);
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
    const [currentHole, setCurrentHole] = useState(1);
    const [holePhase, setHolePhase] = useState<'score' | 'stats' | 'sinDetails' | 'putting'>('score');
    const [skipStatsFlow, setSkipStatsFlow] = useState(false);
    const [roundHistory, setRoundHistory] = useState<Round[]>([]);
    const [section, setSection] = useState('play-score');
    const INITIAL_SINS: DeadlySinsValues = { threePutts: false, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false };
    const [deadlySinsValues, setDeadlySinsValues] = useState<DeadlySinsValues>(INITIAL_SINS);
    const [puttingStats, setPuttingStats] = useState<{ firstPutt?: number; secondPutt?: number; secondIsLong: boolean } | null>(null);
    const [puttingFirstPuttError, setPuttingFirstPuttError] = useState(false);
    const [puttingSecondPuttError, setPuttingSecondPuttError] = useState(false);
    const [puttingSecondPuttRequiredError, setPuttingSecondPuttRequiredError] = useState(false);
    const [clubDistances, setClubDistances] = useState<ClubDistance[]>([]);
    const [selectedOffTeeClub, setSelectedOffTeeClub] = useState<string | undefined>(undefined);
    const [sinDetailsClubError, setSinDetailsClubError] = useState(false);
    const [selectedPenaltyType, setSelectedPenaltyType] = useState<string | undefined>(undefined);
    const [sinDetailsPenaltyError, setSinDetailsPenaltyError] = useState(false);
    const [selectedBogeysClub, setSelectedBogeysClub] = useState<string | undefined>(undefined);
    const [sinDetailsBogeysClubError, setSinDetailsBogeysClubError] = useState(false);
    const [selectedDoubleChipReason, setSelectedDoubleChipReason] = useState<string | undefined>(undefined);
    const [sinDetailsDoubleChipReasonError, setSinDetailsDoubleChipReasonError] = useState(false);
    const [showPuttingInfo, setShowPuttingInfo] = useState(false);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [showPlayerSetup, setShowPlayerSetup] = useState(false);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);
    const [scorecardData, setScorecardData] = useState<MultiplayerRoundScorecard | null>(null);
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const [recentPlayerNames, setRecentPlayerNames] = useState<string[]>([]);
    const { showError, showResult } = useAppToast();
    const { wind, heading, refreshWind } = useWind();
    const router = useRouter();
    const [settings, setSettings] = useState(getSettingsService());
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<1 | 10 | 'all'>('all');
    const [incompleteRound, setIncompleteRound] = useState<Round | null>(null);
    const [courseHolePars, setCourseHolePars] = useState<Record<number, number>>({});
    const [activeCourseName, setActiveCourseName] = useState<string | null>(null);
    const [scorecardSinHoles, setScorecardSinHoles] = useState<Set<number>>(new Set());
    const [selectedScorecardScore, setSelectedScorecardScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [scorecardDisplaySins, setScorecardDisplaySins] = useState<DeadlySinsValues | null>(null);
    const [courseNotes, setCourseNotes] = useState<Record<number, string>>({});
    const [currentNoteText, setCurrentNoteText] = useState('');
    const [showPreShotReminder, setShowPreShotReminder] = useState(false);
    const [preShotText, setPreShotText] = useState('');
    const [showBadHoleReassurance, setShowBadHoleReassurance] = useState(false);
    const [reassuranceMessage, setReassuranceMessage] = useState('');
    const scrollRef = useRef<ScrollView>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    const onRefresh = () => {
        setRefreshing(true);
        refreshTimerRef.current = setTimeout(() => {
            setRoundHistory(getAllRoundHistoryService());
            setRefreshing(false);
        }, 750);
    };

    useEffect(() => {
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, []);

    // Re-read the history list whenever the screen regains focus (e.g. after a
    // round is deleted on the scorecard screen and we navigate back here).
    const refreshHistoryData = useCallback(() => {
        setRoundHistory(getAllRoundHistoryService());
    }, []);

    useFocusEffect(refreshHistoryData);

    // Refresh wind whenever a hole loads during an active round.
    useEffect(() => {
        if (activeRoundId !== null) {
            refreshWind();
        }
    }, [currentHole, activeRoundId, refreshWind]);

    // Show the pre-shot routine reminder before the first hole and between holes.
    useEffect(() => {
        if (activeRoundId === null) return;
        const currentSettings = getSettingsService();
        if (currentSettings.preShotReminderEnabled) {
            setPreShotText(currentSettings.preShotRoutineText);
            setShowPreShotReminder(true);
        }
    }, [currentHole, activeRoundId]);

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
        console.log("[PLAY] Resuming round with IsScoreOnly:", incompleteRound.IsScoreOnly, "→ skipStatsFlow:", incompleteRound.IsScoreOnly === 1);
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

        console.log("[PLAY] Starting round with skipStatsFlowEnabled:", settings.skipStatsFlowEnabled);
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
        if (holePhase === 'score') {
            if (currentHole <= 1) return;
            const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
            await addMultiplayerHoleScoresService(activeRoundId!, holeNumber, holePar, scores);
            const prevHole = currentHole - 1;
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

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
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
        setSection('play-score');
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

                {!isRoundActive && !showPlayerSetup && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <TouchableOpacity
                                    testID="play-onboarding-info-button"
                                    onPress={handleShowOnboarding}
                                    style={{ padding: 4 }}
                                >
                                    <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                                </TouchableOpacity>
                                <Text style={[styles.headerText, styles.marginTop]}>Play</Text>
                            </View>

                            {incompleteRound ? (
                                <Text style={[styles.normalText, styles.marginBottom]}>
                                    Continue or end previously started round that was not completed
                                </Text>
                            ) : (
                                <Text style={[styles.normalText, styles.marginBottom]}>
                                    Start round, review past rounds & 7 Deadly Sins stats
                                </Text>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {incompleteRound ? (
                            <>
                                <CtaButton
                                    testID="continue-round-button"
                                    label="Continue round"
                                    icon="play-circle-outline"
                                    onPress={handleContinueRound}
                                    style={styles.marginTop}
                                />
                                <TouchableOpacity
                                    testID="end-incomplete-round-link"
                                    onPress={handleEndIncompleteRound}
                                    style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}
                                >
                                    <Text style={localStyles.endRoundLink}>End round</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <CtaButton
                                testID="start-round-button"
                                label="Start round"
                                icon="play-arrow"
                                onPress={handleShowPlayerSetup}
                                style={styles.marginTop}
                            />
                        )}


                        {!incompleteRound && roundHistory.length > 0 && (
                            <View style={localStyles.filterContainer}>
                                <Text testID="filter-label" style={localStyles.filterLabel}>Show</Text>
                                {([1, 10, 'all'] as const).map(f => (
                                    <TouchableOpacity
                                        key={String(f)}
                                        testID={`filter-button-${f}`}
                                        onPress={() => setHistoryFilter(f)}
                                        style={[localStyles.filterButton, historyFilter === f && localStyles.filterButtonSelected]}
                                    >
                                        <Text style={[localStyles.filterButtonText, historyFilter === f && localStyles.filterButtonTextSelected]}>
                                            {f === 'all' ? 'All' : String(f)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {!incompleteRound && roundHistory.length > 0 && (
                            <View testID="par-averages-container" style={styles.parAverages.container}>
                                <Text style={styles.parAverages.heading}>Average score by par</Text>
                                <View style={styles.parAverages.row}>
                                    {([3, 4, 5] as const).map(par => {
                                        const val = parAverages[`par${par}` as keyof ParAverages];
                                        return (
                                            <View key={par} style={styles.parAverages.cell}>
                                                <Text
                                                    testID={`par-averages-par${par}`}
                                                    style={styles.parAverages.value}
                                                >
                                                    Par {par}: {val !== null ? val.toFixed(2) : '-'}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {!incompleteRound && roundHistory.length > 0 && (
                            <View style={{ padding: 5 }}>
                                <Text style={styles.subHeaderText}>
                                    Round history
                                </Text>
                                <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.primary }]}>
                                    <Text testID="round-history-header-date" style={[styles.smallText, localStyles.historyDateColumn]}>Date Course</Text>
                                    <Text testID="round-history-header-strokes" style={[styles.smallText, localStyles.historyTotalColumn, { textAlign: 'left' }]}>Score</Text>
                                </View>
                                <ScrollView testID="round-history-scroll" style={localStyles.roundHistoryScroll} nestedScrollEnabled>
                                    {filteredRoundHistory.map((round) => (
                                        <TouchableOpacity
                                            key={round.Id}
                                            testID={`round-history-row-${round.Id}`}
                                            onPress={() => router.push({ pathname: '/play/scorecard', params: { roundId: String(round.Id) } })}
                                        >
                                            <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.primary }]}>
                                                <Text style={[styles.smallTextNoPadding, localStyles.historyDateColumn]}>{round.CourseName ? `${round.Created_At} ${round.CourseName}` : round.Created_At}{round.HolesPlayed < 18 ? ` (${round.HolesPlayed})` : ''}</Text>
                                                <View style={[styles.row, localStyles.historyTotalColumn]}>
                                                    <Text testID={`round-history-strokes-${round.Id}`} style={styles.smallTextNoPadding}>
                                                        {round.StrokeTotal !== null && round.StrokeTotal !== undefined ? String(round.StrokeTotal) : '-'}
                                                    </Text>
                                                    <Text style={[styles.smallTextNoPadding, { textAlign: 'right' }]}>
                                                        &nbsp;({formatScore(round.TotalScore)})
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                {!isRoundActive && showPlayerSetup && displaySection('play-score') && (
                    <View style={styles.container}>
                        <PlayerSetup
                            onStartRound={handleStartRound}
                            onCancel={() => setShowPlayerSetup(false)}
                            recentCourseNames={recentCourseNames}
                            recentPlayerNames={recentPlayerNames}
                            onRemoveCourse={(name) => {
                                hideCourseFromRecentsService(name);
                                setRecentCourseNames(getRecentCourseNamesService());
                            }}
                            onRemovePlayer={(name) => {
                                hidePlayerFromRecentsService(name);
                                setRecentPlayerNames(getRecentPlayerNamesService());
                            }}
                        />
                    </View>
                )}

                {isRoundActive && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View>
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

                                    <HoleNoteInput
                                        key={`note-${currentHole}`}
                                        note={currentNoteText}
                                        onNoteChange={setCurrentNoteText}
                                    />
                                </>
                            )}

                            {holePhase === 'stats' && (
                                <>
                                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                        <Text style={styles.normalText}>Hole {currentHole} — 7 Deadly Sins</Text>
                                    </View>
                                    <DeadlySinsTally
                                        key={`tally-${currentHole}`}
                                        onEndRound={() => { }}
                                        roundControlled={true}
                                        onValuesChange={handledeadlySinsValuesChange}
                                        initialValues={deadlySinsValues}
                                        holePar={currentHoleData?.holePar}
                                        userScore={currentHoleData?.scores.find(s => {
                                            const player = players.find(p => p.Id === s.playerId);
                                            return player && player.IsUser === 1;
                                        })?.score}
                                    />
                                </>
                            )}

                            {holePhase === 'sinDetails' && (
                                <>
                                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                        <Text style={styles.normalText}>Hole {currentHole} — Sin Details</Text>
                                    </View>
                                    <SinDetailsInput
                                        key={`sinDetails-${currentHole}`}
                                        sins={deadlySinsValues}
                                        clubs={clubDistances}
                                        selectedOffTeeClub={selectedOffTeeClub}
                                        onOffTeeClubChange={setSelectedOffTeeClub}
                                        showOffTeeClubError={sinDetailsClubError}
                                        selectedPenaltyType={selectedPenaltyType}
                                        onPenaltyTypeChange={setSelectedPenaltyType}
                                        showPenaltyTypeError={sinDetailsPenaltyError}
                                        selectedBogeysClub={selectedBogeysClub}
                                        onBogeysClubChange={setSelectedBogeysClub}
                                        showBogeysClubError={sinDetailsBogeysClubError}
                                        selectedDoubleChipReason={selectedDoubleChipReason}
                                        onDoubleChipReasonChange={setSelectedDoubleChipReason}
                                        showDoubleChipReasonError={sinDetailsDoubleChipReasonError}
                                    />
                                </>
                            )}

                            {holePhase === 'putting' && (
                                <>
                                    <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <TouchableOpacity testID="putting-info-button" onPress={() => setShowPuttingInfo(true)} style={{ padding: 4 }}>
                                            <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                                        </TouchableOpacity>
                                        <Text style={styles.normalText}>Hole {currentHole} — Putting Stats</Text>
                                    </View>
                                    <PuttingStatsInput
                                        key={`putting-${currentHole}`}
                                        holePar={currentHoleData?.holePar ?? 4}
                                        threePuttSelected={deadlySinsValues.threePutts}
                                        onStatsChange={(firstPutt, secondPutt, secondIsLong) => {
                                            setPuttingStats({ firstPutt, secondPutt, secondIsLong });
                                            if (firstPutt !== undefined) setPuttingFirstPuttError(false);
                                            if (secondPutt !== undefined) setPuttingSecondPuttRequiredError(false);
                                        }}
                                        initialFirstPutt={puttingStats?.firstPutt}
                                        initialSecondPutt={puttingStats?.secondPutt}
                                        initialSecondIsLong={puttingStats?.secondIsLong}
                                        showFirstPuttError={puttingFirstPuttError}
                                        showSecondPuttRequiredError={puttingSecondPuttRequiredError}
                                        onSecondPuttErrorChange={setPuttingSecondPuttError}
                                    />
                                </>
                            )}

                            {!showEndRoundConfirm && (
                                <View>
                                    <TouchableOpacity
                                        testID="next-hole-button"
                                        onPress={handleNextHole}
                                        style={localStyles.nextHoleButton}
                                    >
                                        <View style={{ width: 24 }} />
                                        <Text style={localStyles.nextHoleButtonText}>
                                            {holePhase === 'putting' || (holePhase === 'score' && skipStatsFlow) ? (isLastHole ? 'Finish round' : 'Next hole') : 'Next'}
                                        </Text>
                                        <MaterialIcons
                                            name={(holePhase === 'putting' || (holePhase === 'score' && skipStatsFlow)) && isLastHole ? 'sports-score' : 'skip-next'}
                                            size={24}
                                            color={colours.background}
                                        />
                                    </TouchableOpacity>

                                    {holePhase === 'score' && currentHole <= 1 ? (
                                        <View
                                            testID="previous-hole-placeholder"
                                            style={[localStyles.previousHoleButton, { opacity: 0 }]}
                                            pointerEvents="none"
                                        >
                                            <MaterialIcons name="skip-previous" size={24} color={colours.primary} />
                                            <Text style={localStyles.previousHoleButtonText}>Previous hole</Text>
                                            <View style={{ width: 24 }} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            testID="previous-hole-button"
                                            onPress={handlePreviousHole}
                                            style={localStyles.previousHoleButton}
                                        >
                                            <MaterialIcons name="skip-previous" size={24} color={colours.primary} />
                                            <Text style={localStyles.previousHoleButtonText}>
                                                {holePhase === 'score' ? 'Previous hole' : 'Previous'}
                                            </Text>
                                            <View style={{ width: 24 }} />
                                        </TouchableOpacity>
                                    )}

                                    {holePhase === 'score' && (wind?.directionFrom || wind?.speedMph) && (
                                        <View style={styles.contentSection}>
                                            <WindDisplay
                                                directionFrom={wind?.directionFrom ?? null}
                                                speedMph={wind?.speedMph ?? null}
                                                heading={heading}
                                                compact
                                            />
                                        </View>
                                    )}

                                    {holePhase === 'score' && (
                                        <>
                                            {!showEndRoundConfirm && (
                                                <TouchableOpacity
                                                    testID="end-round-button"
                                                    onPress={handleEndRoundPress}
                                                    style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}
                                                >
                                                    <Text style={localStyles.endRoundLink}>End round</Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
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
                    </View>
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
                    <View style={styles.container}>
                        <DistancesScreen />
                    </View>
                )}

                {displaySection('play-wedge-chart') && (
                    <View style={styles.container}>
                        <WedgeChartScreen />
                    </View>
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Play"
                steps={ONBOARDING_STEPS}
            />

            <AcknowledgeOverlay
                visible={showPreShotReminder}
                title="Pre-shot routine"
                text={preShotText}
                onDismiss={() => setShowPreShotReminder(false)}
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
            />
        </GestureHandlerRootView>
    );
}
