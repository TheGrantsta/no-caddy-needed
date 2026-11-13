import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Animated, RefreshControl, ScrollView, type ScrollViewInstance, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBarStyleFor, sceneStyleFor } from '../../assets/tabBarOptions';
import { MaterialIcons } from '@expo/vector-icons';
import { HoleScoreBody, HoleScoreHeader, useHoleScores } from '../../components/HoleScoreInput';
import HoleNoteInput from '../../components/HoleNoteInput';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import {
    startRoundService,
    endRoundService,
    deleteRoundService,
    getDeadlySinsForRoundService,
    getWedgeChartService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertHoleDeadlySinsService,
    getHoleDeadlySinsService,
    getHoleScoresService,
    insertPuttingStatsService,
    getPuttingStatsService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    hideCourseFromRecentsService,
    getHolesPlayedForRoundService,
    getCourseHoleParsService,
    loadCourseNotesService,
    saveHoleNoteService,
    getSettingsService,
    saveSettingsService,
    getClubDistancesService,
    insertHoleSinDetailsService,
    getHoleSinDetailsService,
    deleteHoleSinDetailsService,
    Round,
    RoundPlayer,
    DeadlySinsValues,
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
import PhaseStats from '../../components/PhaseStats';
import RoundSummary from '../../components/RoundSummary';
import { buildRoundSummary, RoundSummary as RoundSummaryData, SummarySins } from '../../utils/roundSummary';
import { HOLES_PER_ROUND, holeAtPlayPosition, isFirstHoleOfRound, isLastHoleOfRound, nextHoleInRound, previousHoleInRound, sanitiseStartHole } from '../../utils/holeOrder';
import EndRoundSheet from '../../components/EndRoundSheet';
import EndIncompleteRoundSheet from '../../components/EndIncompleteRoundSheet';
import BagSheet from '../../components/BagSheet';
import type { WedgeChartData } from '../../service/DbService';
import PhasePutting from '../../components/PhasePutting';
import RoundEntry from '../../components/RoundEntry';
import HoleNavigationControls from '../../components/HoleNavigationControls';
import AcknowledgeOverlay from '../../components/AcknowledgeOverlay';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

const BAD_HOLE_MESSAGES = [
    'A triple bogey isn\'t the end of the round — plenty of golf left.',
    'Shake it off — reset and go get the next one.',
    'Even the pros have blow-up holes. Onward!',
    'One bad hole doesn\'t define your round. Keep grinding.',
    'Just a bump in the road. You\'ve got this!',
];

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
    const validatePuttingStats = lifecycle.validatePuttingStats;
    const validateSinDetails = lifecycle.validateSinDetails;
    const resetForNewHole = lifecycle.resetForNewHole;

    // Read from the database on each render, so the club picker always shows the saved clubs
    const clubDistances: ClubDistance[] = getClubDistancesService();
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

    const [showPuttingInfo, , setShowPuttingInfo] = useToggle(false);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, , setShowEndRoundConfirm] = useToggle(false);
    const [roundSummary, setRoundSummary] = useState<RoundSummaryData | null>(null);
    const [showBagSheet, setShowBagSheet] = useState(false);
    const [bagClubs, setBagClubs] = useState<ClubDistance[]>([]);
    const [bagWedges, setBagWedges] = useState<WedgeChartData>({ distanceNames: [], clubs: [] });
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const { showError, showResult } = useAppToast();
    const { wind, heading, refreshWind } = useWind();

    const SECTION_ORDER = ['play-score'];
    const {
        displaySection,
        fadeAnim: sectionFadeAnim,
        slideAnim: sectionSlideAnim,
        replay: replaySectionTransition,
    } = useSectionTransition(SECTION_ORDER);

    const { refreshing, onRefresh } = useFakeRefresh(
        () => setRecentCourseNames(getRecentCourseNamesService())
    );

    const [settings, setSettings] = useState(getSettingsService());
    const [showOnboarding, , setShowOnboarding] = useToggle(false);
    // Shared with Performance; a stored year with no rounds falls back to All
    const [incompleteRound, setIncompleteRound] = useState<Round | null>(null);
    // The hole this round started on: 1 for a normal round, or any hole for a shotgun start
    const [roundStartHole, setRoundStartHole] = useState(1);
    const [showEndIncompleteRoundConfirm, setShowEndIncompleteRoundConfirm] = useState(false);
    const [courseHolePars, setCourseHolePars] = useState<Record<number, number>>({});
    const [activeCourseName, setActiveCourseName] = useState<string | null>(null);
    const [courseNotes, setCourseNotes] = useState<Record<number, string>>({});
    const [currentNoteText, setCurrentNoteText] = useState('');
    const showBadHoleReassurance = lifecycle.showBadHoleReassurance;
    const setShowBadHoleReassurance = lifecycle.setShowBadHoleReassurance;
    const reassuranceMessage = lifecycle.reassuranceMessage;
    const setReassuranceMessage = lifecycle.setReassuranceMessage;
    const scrollRef = useRef<ScrollViewInstance>(null);
    // Stable Animated.Value instances; held in state so they are not read from a ref during render.
    const [contentFadeAnim] = useState(() => new Animated.Value(0));
    const [contentSlideAnim] = useState(() => new Animated.Value(0));
    const navDirectionRef = useRef<'next' | 'previous'>('next');
    const isLastHole = isLastHoleOfRound(currentHole, roundStartHole);

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            // Mount-only hydration from SQLite; there is no external change to subscribe to.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIncompleteRound(activeRound);
            const roundPlayers = getRoundPlayersService(activeRound.Id);
            if (roundPlayers.length > 0) {
                setPlayers(roundPlayers);
            }
        }
        const history = getAllRoundHistoryService();
        setRecentCourseNames(getRecentCourseNamesService());

        const currentSettings = getSettingsService();
        setSettings(currentSettings);
        if (!currentSettings.playOnboardingSeen && history.length === 0 && !activeRound) {
            setShowOnboarding(true);
        }
    }, [setShowOnboarding]);


    // Re-read the history list whenever the screen regains focus (e.g. after a
    // round is deleted on the scorecard screen and we navigate back here).
    const refreshHistoryData = useCallback(() => {
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
        const startHole = sanitiseStartHole(incompleteRound.StartHole);
        setRoundStartHole(startHole);
        // Resume on the next hole in play order, which wraps for a shotgun start
        const resumeHole = holeAtPlayPosition(startHole, holesPlayed);
        setCurrentHole(resumeHole);
        setActiveRoundId(incompleteRound.Id);
        const courseName = incompleteRound.CourseName ?? '';
        setActiveCourseName(courseName);
        const notes = loadCourseNotesService(courseName);
        setCourseNotes(notes);
        setCurrentNoteText(notes[resumeHole] ?? '');
        const holePars = getCourseHoleParsService(courseName);
        setCourseHolePars(holePars);
        const holeData = loadHoleForScore(resumeHole, incompleteRound.Id, holePars);
        setCurrentHoleData(holeData);
        loadHoleEntry(resumeHole, incompleteRound.Id);
        setIncompleteRound(null);
        replaySectionTransition();
    };

    const handleEndIncompleteRound = () => {
        setShowEndIncompleteRoundConfirm(true);
    };

    const handleConfirmEndIncompleteRound = async () => {
        if (!incompleteRound) return;
        await endRoundService(incompleteRound.Id);
        if (notificationId) {
            await cancelRoundReminder(notificationId);
        } else {
            await cancelAllRoundReminders();
        }
        setIncompleteRound(null);
        setPlayers([]);
        setShowEndIncompleteRoundConfirm(false);
        showResult(true, 'Round ended', '');
    };

    const handleCancelEndIncompleteRound = () => {
        setShowEndIncompleteRoundConfirm(false);
    };

    const handleStartRound = async (playerNames: string[], courseName: string, startHole: number) => {
        const roundId = await startRoundService(courseName, settings.skipStatsFlowEnabled, startHole);

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
            setRoundStartHole(startHole);
            setCurrentHole(startHole);
            loadHoleEntry(startHole, roundId);
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
            replaySectionTransition();
            const nId = await scheduleRoundReminder();
            setNotificationId(nId);
        } else {
            showError('Failed to start round');
        }
    };

    const handleScoresChange = (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => {
        setCurrentHoleData({ holeNumber, holePar, scores });
        // Autosave so a score survives the app closing before Next is pressed
        if (activeRoundId !== null) {
            void addMultiplayerHoleScoresService(activeRoundId, holeNumber, holePar, scores);
        }
    };

    const buildDefaultHoleData = () => {
        const par = courseHolePars[currentHole] ?? 4;
        return {
            holeNumber: currentHole,
            holePar: par,
            scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: par })),
        };
    };

    const loadHoleForScore = (holeNumber: number, roundId: number | null = activeRoundId, holePars: Record<number, number> = courseHolePars) => {
        if (!roundId) return buildDefaultHoleData();
        const saved = getHoleScoresService(roundId, holeNumber);
        if (!saved) {
            const par = holePars[holeNumber] ?? 4;
            return {
                holeNumber,
                holePar: par,
                scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: par })),
            };
        }
        return {
            holeNumber,
            holePar: saved.holePar,
            scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: saved.scores[p.Id] ?? saved.holePar })),
        };
    };

    const loadHoleSins = (holeNumber: number, roundId: number | null = activeRoundId): DeadlySinsValues => {
        if (!roundId) return INITIAL_SINS;
        const saved = getHoleDeadlySinsService(roundId, holeNumber);
        return saved ?? INITIAL_SINS;
    };

    const shouldShowSinDetails = (sins: DeadlySinsValues) =>
        sins.troubleOffTee || sins.penalties || sins.bogeysInside9Iron || sins.doubleChips;

    // Loads everything entered for a hole (sins, sin details, putting) onto the single hole screen.
    // Moving forward starts the next hole's Deadly Sins clean; moving back restores what was saved.
    const loadHoleEntry = (holeNumber: number, roundId: number | null = activeRoundId, { resetSins = false } = {}) => {
        setDeadlySinsValues(resetSins ? INITIAL_SINS : loadHoleSins(holeNumber, roundId));
        setPuttingFirstPuttError(false);
        setPuttingSecondPuttError(false);
        setPuttingSecondPuttRequiredError(false);
        const saved = roundId ? getPuttingStatsService(roundId, holeNumber) : null;
        setPuttingStats(saved ? {
            firstPutt: saved.FirstPuttDistance,
            secondPutt: saved.SecondPuttDistance,
            secondIsLong: saved.SecondPuttIsLong === 1,
            greenInRegulation: saved.GreenInRegulation,
        } : null);
        const details = roundId ? getHoleSinDetailsService(roundId, holeNumber) : null;
        setSelectedOffTeeClub(details?.TroubleOffTeeClub ?? undefined);
        setSelectedPenaltyType(details?.PenaltyType ?? undefined);
        setSelectedBogeysClub(details?.BogeysInside9IronClub ?? undefined);
        setSelectedDoubleChipReason(details?.DoubleChipsReason ?? undefined);
        setSinDetailsClubError(false);
        setSinDetailsPenaltyError(false);
        setSinDetailsBogeysClubError(false);
        setSinDetailsDoubleChipReasonError(false);
    };

    // Saves everything entered for a hole. Putting and sins are only saved when the full stats flow is on.
    const saveHoleEntry = async (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]): Promise<boolean> => {
        const saved = await addMultiplayerHoleScoresService(activeRoundId!, holeNumber, holePar, scores);
        if (!saved) return false;
        if (activeCourseName !== null) {
            await saveHoleNoteService(activeCourseName, holeNumber, currentNoteText);
            setCourseNotes(prev => ({ ...prev, [holeNumber]: currentNoteText.trim() }));
        }
        if (!skipStatsFlow) {
            await insertHoleDeadlySinsService(activeRoundId!, holeNumber, deadlySinsValues);
            if (shouldShowSinDetails(deadlySinsValues)) {
                await insertHoleSinDetailsService(activeRoundId!, holeNumber, {
                    troubleOffTeeClub: selectedOffTeeClub,
                    penaltyType: selectedPenaltyType,
                    bogeysInside9IronClub: selectedBogeysClub,
                    doubleChipsReason: selectedDoubleChipReason,
                });
            } else {
                await deleteHoleSinDetailsService(activeRoundId!, holeNumber);
            }
            if (puttingStats && puttingStats.firstPutt !== undefined) {
                await insertPuttingStatsService(activeRoundId!, holeNumber, puttingStats.firstPutt, puttingStats.secondPutt ?? 0, puttingStats.secondIsLong, undefined, undefined, puttingStats.greenInRegulation);
            }
        }
        return true;
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
        if (isLastHole) {
            setShowEndRoundConfirm(true);
        } else {
            const nextHole = nextHoleInRound(currentHole, roundStartHole);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentNoteText(courseNotes[nextHole] ?? '');
            setCurrentHole(nextHole);
            setCurrentHoleData(loadHoleForScore(nextHole));
            resetForNewHole();
            loadHoleEntry(nextHole, activeRoundId, { resetSins: true });
        }
    };

    const handleDismissBadHoleReassurance = () => {
        setShowBadHoleReassurance(false);
        advanceHoleOrEndRound();
    };

    const handlePreviousHole = async () => {
        navDirectionRef.current = 'previous';
        if (isFirstHoleOfRound(currentHole, roundStartHole)) return;

        // Keep whatever was entered on this hole, then show the previous hole with its saved entries
        const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
        await saveHoleEntry(holeNumber, holePar, scores);
        const prevHole = previousHoleInRound(currentHole, roundStartHole);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentNoteText(courseNotes[prevHole] ?? '');
        setCurrentHole(prevHole);
        setCurrentHoleData(loadHoleForScore(prevHole));
        resetForNewHole();
        loadHoleEntry(prevHole);
    };

    const handleNextHole = async () => {
        navDirectionRef.current = 'next';
        if (!activeRoundId) return;

        if (!skipStatsFlow) {
            const puttingValid = validatePuttingStats(puttingStats);
            const sinDetailsValid = validateSinDetails(
                clubDistances,
                deadlySinsValues.troubleOffTee,
                deadlySinsValues.penalties,
                deadlySinsValues.bogeysInside9Iron,
                deadlySinsValues.doubleChips,
            );
            if (!puttingValid || !sinDetailsValid || puttingSecondPuttError) return;
        }

        const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
        const saved = await saveHoleEntry(holeNumber, holePar, scores);
        if (!saved) {
            showError('Could not save hole');
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        if (isTripleBogeyOrWorse(currentHoleData) && settings.badHoleReassuranceEnabled) {
            setReassuranceMessage(BAD_HOLE_MESSAGES[Math.floor(Math.random() * BAD_HOLE_MESSAGES.length)]);
            setShowBadHoleReassurance(true);
        } else {
            advanceHoleOrEndRound();
        }
    };


    const handledeadlySinsValuesChange = (values: DeadlySinsValues) => {
        setDeadlySinsValues(values);
    };

    // Reads the current distances and wedge chart each time the yardages open, so edits show straight away
    const handleOpenBag = () => {
        setBagClubs(getClubDistancesService());
        setBagWedges(getWedgeChartService());
        setShowBagSheet(true);
    };

    const handleEndRoundPress = () => {
        setShowEndRoundConfirm(true);
    };

    const handleCancelEndRound = () => {
        setShowEndRoundConfirm(false);
    };

    const handleDiscardRound = async () => {
        if (!activeRoundId) return;
        const success = await deleteRoundService(activeRoundId);
        if (notificationId) {
            await cancelRoundReminder(notificationId);
            setNotificationId(null);
        }
        resetToIdle();
        showResult(success, 'Round discarded', 'Failed to discard round');
    };

    const resetToIdle = () => {
        setActiveRoundId(null);
        setRoundStartHole(1);
        setCurrentHole(1);
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
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setCourseHolePars({});
        setActiveCourseName(null);
        setCourseNotes({});
        setCurrentNoteText('');
        setRecentCourseNames(getRecentCourseNamesService());
    };

    // Totals for the "Round saved" summary, read back from what was stored for the round
    const buildSummaryForRound = (roundId: number, isScoreOnly: boolean) => {
        const scorecard = getMultiplayerScorecardService(roundId);
        if (!scorecard) return null;
        const holeNumbers = [...new Set(scorecard.holeScores.map(h => h.HoleNumber))];
        const putting = isScoreOnly ? [] : holeNumbers.flatMap(hole => {
            const saved = getPuttingStatsService(roundId, hole);
            if (!saved) return [];
            return [{
                hole,
                firstPutt: saved.FirstPuttDistance ?? undefined,
                secondPutt: saved.SecondPuttDistance ?? undefined,
                greenInRegulation: Boolean(saved.GreenInRegulation),
            }];
        });
        const totals = isScoreOnly ? null : getDeadlySinsForRoundService(roundId);
        const sins: SummarySins = totals ? {
            TroubleOffTee: totals.TroubleOffTee,
            Penalties: totals.Penalties,
            ThreePutts: totals.ThreePutts,
            BogeysInside9Iron: totals.BogeysInside9Iron,
            DoubleChips: totals.DoubleChips,
            DoubleBogeys: totals.DoubleBogeys,
            BogeysPar5: totals.BogeysPar5,
        } : {};
        return buildRoundSummary({
            courseName: scorecard.round.CourseName ?? 'Round',
            players: scorecard.players,
            holeScores: scorecard.holeScores,
            putting,
            sins,
            isScoreOnly,
        });
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

        showResult(success, 'Round saved', 'Failed to save round');

        const summary = buildSummaryForRound(activeRoundId, skipStatsFlow);
        if (summary) {
            setShowEndRoundConfirm(false);
            setRoundSummary(summary);
        } else {
            resetToIdle();
        }
    };

    const handleSummaryDone = async () => {
        setRoundSummary(null);
        resetToIdle();
        // Ask for a review from the 7th completed round, then every 6th (7, 13, 19, …).
        const roundCount = getAllRoundHistoryService().length;
        const prompted = await maybeRequestRoundReviewService(roundCount);
        if (prompted) {
            logEvent('review_requested', { roundNumber: roundCount });
        }
    };

    const handleViewPerformance = () => {
        setRoundSummary(null);
        resetToIdle();
        router.push('/perform');
    };

    const isRoundActive = activeRoundId !== null;

    // Hide the bottom tab bar while a round is in progress, and bring it back when the round ends
    const navigation = useNavigation();
    const router = useRouter();
    const { bottom: tabBarBottomInset } = useSafeAreaInsets();
    useLayoutEffect(() => {
        navigation.setOptions({
            tabBarStyle: tabBarStyleFor(colours, tabBarBottomInset, isRoundActive),
            sceneStyle: sceneStyleFor(colours, tabBarBottomInset, isRoundActive),
        });
    }, [navigation, colours, tabBarBottomInset, isRoundActive]);

    // The par and scores for the hole on screen; the header is pinned above the page and the body scrolls
    const holeScores = useHoleScores({
        holeNumber: currentHole,
        players,
        onScoresChange: handleScoresChange,
        initialPar: courseHolePars[currentHole] ?? 4,
        initialScores: currentHoleData?.scores.reduce((acc, s) => ({ ...acc, [s.playerId]: s.score }), {}) ?? undefined,
    });

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {isRoundActive && !roundSummary && displaySection('play-score') && (
                <Animated.View style={{ opacity: sectionFadeAnim, transform: [{ translateX: sectionSlideAnim }] }}>
                    <HoleScoreHeader
                        holeNumber={currentHole}
                        courseName={activeCourseName}
                        par={holeScores.par}
                        onParChange={holeScores.handleParChange}
                        onEndRound={handleEndRoundPress}
                        onOpenBag={handleOpenBag}
                    />
                </Animated.View>
            )}
            <ScrollView
                testID="play-page-scroll"
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
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

                {!isRoundActive && !roundSummary && displaySection('play-score') && (
                    <RoundEntry
                        incompleteRound={incompleteRound}
                        onContinueRound={handleContinueRound}
                        onEndIncompleteRound={handleEndIncompleteRound}
                        recentCourseNames={recentCourseNames}
                        onStartRound={handleStartRound}
                        onRemoveCourse={(name) => {
                            hideCourseFromRecentsService(name);
                            setRecentCourseNames(getRecentCourseNamesService());
                        }}
                        onShowOnboarding={handleShowOnboarding}
                    />
                )}

                <EndIncompleteRoundSheet
                    visible={showEndIncompleteRoundConfirm && !isRoundActive}
                    onConfirm={handleConfirmEndIncompleteRound}
                    onCancel={handleCancelEndIncompleteRound}
                />

                {isRoundActive && !roundSummary && displaySection('play-score') && (
                    <Animated.View style={[styles.container, { opacity: sectionFadeAnim, transform: [{ translateX: sectionSlideAnim }] }]}>
                        <View>
                            <Animated.View style={{ opacity: contentFadeAnim, transform: [{ translateX: contentSlideAnim }] }}>
                                <HoleScoreBody
                                    players={players}
                                    par={holeScores.par}
                                    scores={holeScores.scores}
                                    onIncrement={holeScores.handleIncrement}
                                    onDecrement={holeScores.handleDecrement}
                                />

                                {!skipStatsFlow && (
                                    <>
                                        <View style={styles.holeScreen.sectionHeaderRow}>
                                            <Text style={[styles.holeScreen.sectionLabel, styles.holeScreen.sectionLabelInRow]}>Putting</Text>
                                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help" testID="putting-info-button" onPress={() => setShowPuttingInfo(true)} style={{ padding: 4 }}>
                                                <MaterialIcons name="info-outline" size={20} color={colours.primary} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.holeScreen.card}>
                                        <PhasePutting
                                            key={`putting-${currentHole}`}
                                            holePar={currentHoleData?.holePar ?? 4}
                                            userScore={currentHoleData?.scores.find(s => {
                                                const player = players.find(p => p.Id === s.playerId);
                                                return player && player.IsUser === 1;
                                            })?.score}
                                            deadlySinsValues={deadlySinsValues}
                                            puttingStats={puttingStats}
                                            puttingFirstPuttError={puttingFirstPuttError}
                                            puttingSecondPuttError={puttingSecondPuttError}
                                            puttingSecondPuttRequiredError={puttingSecondPuttRequiredError}
                                            showPuttingInfo={showPuttingInfo}
                                            onStatsChange={(firstPutt, secondPutt, secondIsLong, greenInRegulation) => {
                                                setPuttingStats({ firstPutt, secondPutt, secondIsLong, greenInRegulation });
                                                if (firstPutt !== undefined) setPuttingFirstPuttError(false);
                                                if (secondPutt !== undefined) setPuttingSecondPuttRequiredError(false);
                                            }}
                                            onErrorChange={setPuttingSecondPuttError}
                                            onShowInfo={setShowPuttingInfo}
                                        />
                                        </View>

                                        <PhaseStats
                                            holeNumber={currentHole}
                                            holePar={currentHoleData?.holePar ?? 4}
                                            sins={deadlySinsValues}
                                            onSinsChange={handledeadlySinsValuesChange}
                                            players={players}
                                            userScore={currentHoleData?.scores.find(s => {
                                                const player = players.find(p => p.Id === s.playerId);
                                                return player && player.IsUser === 1;
                                            })?.score}
                                            clubDistances={clubDistances}
                                            selectedOffTeeClub={selectedOffTeeClub}
                                            sinDetailsClubError={sinDetailsClubError}
                                            onOffTeeClubChange={setSelectedOffTeeClub}
                                            selectedPenaltyType={selectedPenaltyType}
                                            sinDetailsPenaltyError={sinDetailsPenaltyError}
                                            onPenaltyTypeChange={setSelectedPenaltyType}
                                            selectedBogeysClub={selectedBogeysClub}
                                            sinDetailsBogeysClubError={sinDetailsBogeysClubError}
                                            onBogeysClubChange={setSelectedBogeysClub}
                                            selectedDoubleChipReason={selectedDoubleChipReason}
                                            sinDetailsDoubleChipReasonError={sinDetailsDoubleChipReasonError}
                                            onDoubleChipReasonChange={setSelectedDoubleChipReason}
                                        />

                                    </>
                                )}

                                {(
                                    <>
                                        <Text style={styles.holeScreen.sectionLabel}>Notes</Text>
                                        <HoleNoteInput
                                            key={`note-${currentHole}`}
                                            note={currentNoteText}
                                            onNoteChange={setCurrentNoteText}
                                        />

                                    </>
                                )}
                            </Animated.View>

                            {(
                                <HoleNavigationControls
                                    currentHole={currentHole}
                                    startHole={roundStartHole}
                                    isLastHole={isLastHole}
                                    onPreviousHole={handlePreviousHole}
                                    onNextHole={handleNextHole}
                                    wind={wind}
                                    heading={heading}
                                />
                            )}

                            <BagSheet
                                visible={showBagSheet}
                                onClose={() => setShowBagSheet(false)}
                                clubDistances={bagClubs}
                                wedgeChart={bagWedges}
                                units={settings.units}
                            />
                            <EndRoundSheet
                                visible={showEndRoundConfirm}
                                holeNumber={currentHole}
                                holesTotal={HOLES_PER_ROUND}
                                onSave={handleConfirmEndRound}
                                onDiscard={handleDiscardRound}
                                onKeepPlaying={handleCancelEndRound}
                            />
                        </View>
                    </Animated.View>
                )}

                {roundSummary && displaySection('play-score') && (
                    <RoundSummary
                        summary={roundSummary}
                        onDone={handleSummaryDone}
                        onViewPerformance={handleViewPerformance}
                    />
                )}

            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Play"
                steps={ONBOARDING_STEPS.play}
            />

            <AcknowledgeOverlay
                visible={showPuttingInfo}
                title="Putting stats"
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
