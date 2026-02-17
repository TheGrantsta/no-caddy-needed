import { t } from '../../assets/i18n/i18n';
import i18n from '../../assets/i18n/i18n';
import en from '../../assets/i18n/en';

describe('i18n', () => {
    it('should default to English locale', () => {
        expect(i18n.locale).toBe('en');
    });

    it('should have fallback enabled', () => {
        expect(i18n.enableFallback).toBe(true);
    });

    it('should have en as default locale', () => {
        expect(i18n.defaultLocale).toBe('en');
    });

    it('should translate a simple key', () => {
        expect(t('common.save')).toBe('Save');
    });

    it('should translate a nested key', () => {
        expect(t('home.title')).toBe('No caddy needed!');
    });

    it('should handle interpolation', () => {
        expect(t('play.holeNumber', { number: 7 })).toBe('Hole 7');
    });

    it('should handle interpolation with multiple variables', () => {
        expect(t('scoreEditor.header', { holeNumber: 3, playerName: 'John' })).toBe('Hole 3 - John');
    });

    it('should return a missing translation indicator for unknown keys', () => {
        const result = t('nonexistent.key');
        expect(result).toContain('missing');
    });

    it('should have all top-level sections in en translations', () => {
        const expectedSections = [
            'common', 'tabs', 'home', 'notFound', 'settings', 'play',
            'playerSetup', 'holeScore', 'tiger5', 'scoreEditor',
            'scorecardScreen', 'roundScorecard', 'multiplayerScorecard',
            'distances', 'clubDistanceList', 'wedgeChart', 'wedgeChartComponent',
            'practice', 'perform', 'shortGame', 'instructions', 'drill',
            'networkStatus', 'errorBoundary', 'subMenu', 'tempo', 'random',
            'putting', 'chipping', 'pitching', 'bunker',
        ];

        expectedSections.forEach(section => {
            expect(en).toHaveProperty(section);
        });
    });

    it('should translate tab titles', () => {
        expect(t('tabs.home')).toBe('Home');
        expect(t('tabs.play')).toBe('Play');
        expect(t('tabs.practice')).toBe('Practice');
        expect(t('tabs.perform')).toBe('Perform');
    });

    it('should translate short game drill data', () => {
        expect(t('putting.drills.gate.label')).toBe('Gate');
        expect(t('chipping.drills.gate.label')).toBe('Gate');
        expect(t('pitching.drills.threeBall.label')).toBe('Three ball');
        expect(t('bunker.drills.line.label')).toBe('Line');
    });

    it('should translate short game game data', () => {
        expect(t('putting.games.aroundTheWorld.header')).toBe('Around the world!');
        expect(t('chipping.games.upAndDown.header')).toBe('Up & down challenge!');
        expect(t('pitching.games.threeClub.header')).toBe('Three club!');
        expect(t('bunker.games.upAndDown.header')).toBe('Up and down challenge!');
    });

    it('should translate category drills suffix with interpolation', () => {
        expect(t('shortGame.drillsSuffix', { category: 'Putting' })).toBe('Putting drills');
    });
});
