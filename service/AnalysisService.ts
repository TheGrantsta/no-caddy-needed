import { getMultiplayerScorecardService, getDeadlySinsForRoundService, DeadlySinsRound } from './DbService';

export type DetectedIssue = {
    issue_type: string;
    severity: 'high' | 'medium';
    evidence: { count: number };
    possible_causes: string[];
};

export type RoundAnalysisPayload = {
    round: {
        round_id: string;
        score: number;
        course_par: number;
        holes: { hole: number; par: number; score: number }[];
        deadly_sins: {
            three_putts: number;
            double_bogeys: number;
            trouble_off_tee: number;
            penalties: number;
            double_chips: number;
            bogeys_inside_9iron: number;
            bogeys_par_5: number;
        };
    };
    detected_issues: DetectedIssue[];
};

const POSSIBLE_CAUSES: Record<string, string[]> = {
    three_putts: ['poor_lag_distance_control', 'green_speed_misjudgment', 'poor_green_reading', 'missed_short_second_putts'],
    double_bogeys: ['poor_iron_play', 'trouble_recovery', 'poor_short_game'],
    trouble_off_tee: ['alignment_issues', 'swing_path_error', 'poor_course_management'],
    penalties: ['aggressive_course_management', 'poor_ball_striking', 'poor_decision_making'],
    double_chips: ['poor_contact', 'improper_club_selection', 'poor_lie_assessment'],
    bogeys_inside_9iron: ['poor_ball_striking', 'improper_club_selection', 'poor_distance_control'],
    bogeys_par_5: ['poor_course_management', 'poor_layup_strategy', 'poor_short_game'],
};

const buildDetectedIssues = (sins: DeadlySinsRound): DetectedIssue[] => {
    const entries: { type: string; count: number }[] = [
        { type: 'three_putts', count: sins.ThreePutts },
        { type: 'double_bogeys', count: sins.DoubleBogeys },
        { type: 'trouble_off_tee', count: sins.TroubleOffTee },
        { type: 'penalties', count: sins.Penalties },
        { type: 'double_chips', count: sins.DoubleChips },
        { type: 'bogeys_inside_9iron', count: sins.BogeysInside9Iron },
        { type: 'bogeys_par_5', count: sins.BogeysPar5 },
    ];

    return entries
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(e => ({
            issue_type: e.type,
            severity: e.count >= 3 ? 'high' : 'medium',
            evidence: { count: e.count },
            possible_causes: POSSIBLE_CAUSES[e.type],
        }));
};

export const buildRoundAnalysisPayload = (roundId: number): RoundAnalysisPayload | null => {
    const scorecard = getMultiplayerScorecardService(roundId);
    if (!scorecard) return null;

    const sins = getDeadlySinsForRoundService(roundId);

    const userPlayer = scorecard.players.find(p => p.IsUser === 1);
    const userHoleScores = userPlayer
        ? scorecard.holeScores
            .filter(s => s.RoundPlayerId === userPlayer.Id)
            .sort((a, b) => a.HoleNumber - b.HoleNumber)
        : [];

    const uniqueHoleNumbers = [...new Set(userHoleScores.map(s => s.HoleNumber))];
    const coursePar = uniqueHoleNumbers.reduce((sum, h) => {
        const hs = userHoleScores.find(s => s.HoleNumber === h);
        return sum + (hs?.HolePar ?? 0);
    }, 0);
    const strokeTotal = userHoleScores.reduce((sum, s) => sum + s.Score, 0);

    const deadlySins = sins
        ? {
            three_putts: sins.ThreePutts,
            double_bogeys: sins.DoubleBogeys,
            trouble_off_tee: sins.TroubleOffTee,
            penalties: sins.Penalties,
            double_chips: sins.DoubleChips,
            bogeys_inside_9iron: sins.BogeysInside9Iron,
            bogeys_par_5: sins.BogeysPar5,
        }
        : {
            three_putts: 0,
            double_bogeys: 0,
            trouble_off_tee: 0,
            penalties: 0,
            double_chips: 0,
            bogeys_inside_9iron: 0,
            bogeys_par_5: 0,
        };

    return {
        round: {
            round_id: `r_${roundId}`,
            score: strokeTotal,
            course_par: coursePar,
            holes: userHoleScores.map(s => ({ hole: s.HoleNumber, par: s.HolePar, score: s.Score })),
            deadly_sins: deadlySins,
        },
        detected_issues: sins ? buildDetectedIssues(sins) : [],
    };
};
