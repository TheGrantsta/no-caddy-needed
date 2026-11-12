import {
    CHALLENGE_OPTIONS,
    TOOL_OPTIONS,
    DEFAULT_QUICK_TOOLS,
    QUICK_TOOL_COUNT,
    QUICK_TOOL_OPTIONS,
    optionsForQuickToolSlot,
    parseQuickTools,
    serializeQuickTools,
} from '../../utils/quickTools';

describe('quick tool catalogue', () => {
    it('shouldOfferEveryChallengeAndToolAsAQuickToolOption', () => {
        const slugs = QUICK_TOOL_OPTIONS.map(option => option.slug).sort();

        expect(slugs).toEqual([
            'lag-putting',
            'putting-simulation',
            'random',
            'reminders',
            'short-putting-ladder',
            'tempo',
            'up-and-down',
            'wind',
        ]);
    });

    it('shouldGroupEachOptionAsAChallengeOrATool', () => {
        const groupOf = (slug: string) => QUICK_TOOL_OPTIONS.find(option => option.slug === slug)?.group;

        expect(groupOf('lag-putting')).toBe('Challenges');
        expect(groupOf('wind')).toBe('Tools');
    });

    it('shouldUseUniqueLabelsSoEachOptionCanBeChosenByName', () => {
        const labels = QUICK_TOOL_OPTIONS.map(option => option.label);

        expect(new Set(labels).size).toBe(labels.length);
    });

    it('shouldRequireExactlyThreeQuickTools', () => {
        expect(QUICK_TOOL_COUNT).toBe(3);
    });

    it('shouldDefaultToWindTempoAndRandom', () => {
        expect(DEFAULT_QUICK_TOOLS).toEqual(['wind', 'tempo', 'random']);
    });
});

describe('practice card lists', () => {
    it('shouldListTheFourChallengesInPracticeOrder', () => {
        expect(CHALLENGE_OPTIONS.map(option => option.slug)).toEqual([
            'putting-simulation',
            'up-and-down',
            'short-putting-ladder',
            'lag-putting',
        ]);
    });

    it('shouldListTheFourToolsInTheirSharedOrder', () => {
        expect(TOOL_OPTIONS.map(option => option.slug)).toEqual(['tempo', 'random', 'reminders', 'wind']);
    });
});

describe('parseQuickTools', () => {
    it('shouldReadThreeSavedToolsInTheirSavedOrder', () => {
        expect(parseQuickTools('tempo,lag-putting,wind')).toEqual(['tempo', 'lag-putting', 'wind']);
    });

    it('shouldFallBackToTheDefaultWhenNothingIsSaved', () => {
        expect(parseQuickTools('')).toEqual(DEFAULT_QUICK_TOOLS);
    });

    it('shouldFallBackToTheDefaultWhenFewerThanThreeToolsAreSaved', () => {
        expect(parseQuickTools('tempo,wind')).toEqual(DEFAULT_QUICK_TOOLS);
    });

    it('shouldFallBackToTheDefaultWhenAToolIsUnknown', () => {
        expect(parseQuickTools('tempo,wind,unknown-tool')).toEqual(DEFAULT_QUICK_TOOLS);
    });

    it('shouldFallBackToTheDefaultWhenAToolIsRepeated', () => {
        expect(parseQuickTools('tempo,tempo,wind')).toEqual(DEFAULT_QUICK_TOOLS);
    });
});

describe('serializeQuickTools', () => {
    it('shouldJoinTheToolsWithCommas', () => {
        expect(serializeQuickTools(['tempo', 'wind', 'random'])).toBe('tempo,wind,random');
    });

    it('shouldRoundTripThroughParse', () => {
        const saved = ['lag-putting', 'reminders', 'up-and-down'];

        expect(parseQuickTools(serializeQuickTools(saved))).toEqual(saved);
    });
});

describe('optionsForQuickToolSlot', () => {
    it('shouldLeaveOutToolsChosenInTheOtherSlots', () => {
        const options = optionsForQuickToolSlot(['wind', 'tempo', 'random'], 0).map(option => option.slug);

        expect(options).not.toContain('tempo');
        expect(options).not.toContain('random');
    });

    it('shouldKeepTheToolAlreadyInThisSlotAsAnOption', () => {
        const options = optionsForQuickToolSlot(['wind', 'tempo', 'random'], 0).map(option => option.slug);

        expect(options).toContain('wind');
    });

    it('shouldOfferEveryOtherToolWhenOnlyThisSlotIsFilled', () => {
        const options = optionsForQuickToolSlot(['wind', 'tempo', 'random'], 1);

        expect(options).toHaveLength(QUICK_TOOL_OPTIONS.length - 2);
    });
});
