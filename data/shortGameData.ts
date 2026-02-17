import { ShortGameConfig } from '../types/ShortGame';
import { t } from '../assets/i18n/i18n';

export const getPuttingConfig = (): ShortGameConfig => ({
    category: 'putting',
    drills: [
        {
            label: t('putting.drills.gate.label'),
            iconName: 'data-array',
            target: t('putting.drills.gate.target'),
            objective: t('putting.drills.gate.objective'),
            setup: t('putting.drills.gate.setup'),
            howToPlay: t('putting.drills.gate.howToPlay'),
        },
        {
            label: t('putting.drills.clock.label'),
            iconName: 'schedule',
            target: t('putting.drills.clock.target'),
            objective: t('putting.drills.clock.objective'),
            setup: t('putting.drills.clock.setup'),
            howToPlay: t('putting.drills.clock.howToPlay'),
        },
        {
            label: t('putting.drills.ladder.label'),
            iconName: 'sort',
            target: t('putting.drills.ladder.target'),
            objective: t('putting.drills.ladder.objective'),
            setup: t('putting.drills.ladder.setup'),
            howToPlay: t('putting.drills.ladder.howToPlay'),
        },
    ],
    games: [
        {
            header: t('putting.games.aroundTheWorld.header'),
            objective: t('putting.games.aroundTheWorld.objective'),
            setup: t('putting.games.aroundTheWorld.setup'),
            howToPlay: t('putting.games.aroundTheWorld.howToPlay'),
        },
        {
            header: t('putting.games.ladder.header'),
            objective: t('putting.games.ladder.objective'),
            setup: t('putting.games.ladder.setup'),
            howToPlay: t('putting.games.ladder.howToPlay'),
        },
        {
            header: t('putting.games.par18.header'),
            objective: t('putting.games.par18.objective'),
            setup: t('putting.games.par18.setup'),
            howToPlay: t('putting.games.par18.howToPlay'),
        },
    ],
    drillsFooter: t('putting.drillsFooter'),
    gamesFooter: t('putting.gamesFooter'),
});

export const getChippingConfig = (): ShortGameConfig => ({
    category: 'chipping',
    drills: [
        {
            label: t('chipping.drills.gate.label'),
            iconName: 'horizontal-distribute',
            target: t('chipping.drills.gate.target'),
            objective: t('chipping.drills.gate.objective'),
            setup: t('chipping.drills.gate.setup'),
            howToPlay: t('chipping.drills.gate.howToPlay'),
        },
        {
            label: t('chipping.drills.hoop.label'),
            iconName: 'adjust',
            target: t('chipping.drills.hoop.target'),
            objective: t('chipping.drills.hoop.objective'),
            setup: t('chipping.drills.hoop.setup'),
            howToPlay: t('chipping.drills.hoop.howToPlay'),
        },
        {
            label: t('chipping.drills.oneHand.label'),
            iconName: 'back-hand',
            target: t('chipping.drills.oneHand.target'),
            objective: t('chipping.drills.oneHand.objective'),
            setup: t('chipping.drills.oneHand.setup'),
            howToPlay: t('chipping.drills.oneHand.howToPlay'),
        },
    ],
    games: [
        {
            header: t('chipping.games.upAndDown.header'),
            objective: t('chipping.games.upAndDown.objective'),
            setup: t('chipping.games.upAndDown.setup'),
            howToPlay: t('chipping.games.upAndDown.howToPlay'),
        },
        {
            header: t('chipping.games.ladder.header'),
            objective: t('chipping.games.ladder.objective'),
            setup: t('chipping.games.ladder.setup'),
            howToPlay: t('chipping.games.ladder.howToPlay'),
        },
        {
            header: t('chipping.games.par18.header'),
            objective: t('chipping.games.par18.objective'),
            setup: t('chipping.games.par18.setup'),
            howToPlay: t('chipping.games.par18.howToPlay'),
        },
    ],
    drillsFooter: t('chipping.drillsFooter'),
    gamesFooter: t('chipping.gamesFooter'),
});

export const getPitchingConfig = (): ShortGameConfig => ({
    category: 'pitching',
    drills: [
        {
            label: t('pitching.drills.threeBall.label'),
            iconName: 'track-changes',
            target: t('pitching.drills.threeBall.target'),
            objective: t('pitching.drills.threeBall.objective'),
            setup: t('pitching.drills.threeBall.setup'),
            howToPlay: t('pitching.drills.threeBall.howToPlay'),
        },
        {
            label: t('pitching.drills.wedge.label'),
            iconName: 'av-timer',
            target: t('pitching.drills.wedge.target'),
            objective: t('pitching.drills.wedge.objective'),
            setup: t('pitching.drills.wedge.setup'),
            howToPlay: t('pitching.drills.wedge.howToPlay'),
        },
        {
            label: t('pitching.drills.ladder.label'),
            iconName: 'sort',
            target: t('pitching.drills.ladder.target'),
            objective: t('pitching.drills.ladder.objective'),
            setup: t('pitching.drills.ladder.setup'),
            howToPlay: t('pitching.drills.ladder.howToPlay'),
        },
    ],
    games: [
        {
            header: t('pitching.games.threeClub.header'),
            objective: t('pitching.games.threeClub.objective'),
            setup: t('pitching.games.threeClub.setup'),
            howToPlay: t('pitching.games.threeClub.howToPlay'),
        },
        {
            header: t('pitching.games.targetChallenge.header'),
            objective: t('pitching.games.targetChallenge.objective'),
            setup: t('pitching.games.targetChallenge.setup'),
            howToPlay: t('pitching.games.targetChallenge.howToPlay'),
        },
        {
            header: t('pitching.games.fiveBall.header'),
            objective: t('pitching.games.fiveBall.objective'),
            setup: t('pitching.games.fiveBall.setup'),
            howToPlay: t('pitching.games.fiveBall.howToPlay'),
        },
    ],
    drillsFooter: t('pitching.drillsFooter'),
    gamesFooter: t('pitching.gamesFooter'),
});

export const getBunkerConfig = (): ShortGameConfig => ({
    category: 'bunker',
    drills: [
        {
            label: t('bunker.drills.line.label'),
            iconName: 'linear-scale',
            target: t('bunker.drills.line.target'),
            objective: t('bunker.drills.line.objective'),
            setup: t('bunker.drills.line.setup'),
            howToPlay: t('bunker.drills.line.howToPlay'),
        },
        {
            label: t('bunker.drills.dollarBill.label'),
            iconName: 'money',
            target: t('bunker.drills.dollarBill.target'),
            objective: t('bunker.drills.dollarBill.objective'),
            setup: t('bunker.drills.dollarBill.setup'),
            howToPlay: t('bunker.drills.dollarBill.howToPlay'),
        },
        {
            label: t('bunker.drills.noBall.label'),
            iconName: 'sports-golf',
            target: t('bunker.drills.noBall.target'),
            objective: t('bunker.drills.noBall.objective'),
            setup: t('bunker.drills.noBall.setup'),
            howToPlay: t('bunker.drills.noBall.howToPlay'),
        },
    ],
    games: [
        {
            header: t('bunker.games.upAndDown.header'),
            objective: t('bunker.games.upAndDown.objective'),
            setup: t('bunker.games.upAndDown.setup'),
            howToPlay: t('bunker.games.upAndDown.howToPlay'),
        },
        {
            header: t('bunker.games.worstLie.header'),
            objective: t('bunker.games.worstLie.objective'),
            setup: t('bunker.games.worstLie.setup'),
            howToPlay: t('bunker.games.worstLie.howToPlay'),
        },
        {
            header: t('bunker.games.tenPoint.header'),
            objective: t('bunker.games.tenPoint.objective'),
            setup: t('bunker.games.tenPoint.setup'),
            howToPlay: t('bunker.games.tenPoint.howToPlay'),
        },
    ],
    drillsFooter: t('bunker.drillsFooter'),
    gamesFooter: t('bunker.gamesFooter'),
});
