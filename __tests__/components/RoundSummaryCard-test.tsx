import React from 'react';
import { render } from '@testing-library/react-native';
import RoundSummaryCard from '../../components/RoundSummaryCard';

const base = { holesPlayed: 5, totalScore: 20, totalPar: 20, putts: 7, threePutts: 1, penalties: 1 };

describe('RoundSummaryCard', () => {
    it('shouldShowHowManyHolesWerePlayed', () => {
        const { getByText } = render(<RoundSummaryCard {...base} />);

        expect(getByText('You · 5 holes')).toBeTruthy();
    });

    it('shouldShowTheTotalScoreLargeWithTheDifferenceFromPar', () => {
        const { getByTestId, getByText } = render(<RoundSummaryCard {...base} />);

        expect(getByTestId('round-summary-score')).toHaveTextContent('20');
        expect(getByText('Even par')).toBeTruthy();
    });

    it('shouldShowHowManyOverParTheRoundWas', () => {
        const { getByText } = render(<RoundSummaryCard {...base} totalScore={23} />);

        expect(getByText('3 over par')).toBeTruthy();
    });

    it('shouldShowHowManyUnderParTheRoundWas', () => {
        const { getByText } = render(<RoundSummaryCard {...base} totalScore={18} />);

        expect(getByText('2 under par')).toBeTruthy();
    });

    it('shouldShowPuttsThreePuttsAndPenaltiesAsStatTiles', () => {
        const { getByText } = render(<RoundSummaryCard {...base} />);

        expect(getByText('Putts')).toBeTruthy();
        expect(getByText('7')).toBeTruthy();
        expect(getByText('3-putts')).toBeTruthy();
        expect(getByText('Penalties')).toBeTruthy();
    });

    it('shouldShowADashForPuttsWhenTheRoundDidNotRecordThem', () => {
        const { getByText } = render(
            <RoundSummaryCard holesPlayed={5} totalScore={20} totalPar={20} putts={null} threePutts={0} penalties={0} />
        );

        expect(getByText('–')).toBeTruthy();
    });

    it('shouldHideThePutts3PuttsAndPenaltiesTilesWhenStatsAreOff', () => {
        const { queryByText, getByTestId } = render(
            <RoundSummaryCard holesPlayed={5} totalScore={20} totalPar={20} putts={null} threePutts={0} penalties={0} showStats={false} />
        );

        expect(getByTestId('round-summary-score')).toHaveTextContent('20');
        expect(queryByText('Putts')).toBeNull();
        expect(queryByText('3-putts')).toBeNull();
        expect(queryByText('Penalties')).toBeNull();
    });
});
