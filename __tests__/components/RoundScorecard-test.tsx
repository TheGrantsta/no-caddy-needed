import React from 'react';
import { render } from '@testing-library/react-native';
import RoundScorecard from '../../components/RoundScorecard';

describe('RoundScorecard component', () => {
    it('displays round total score', () => {
        const holes = [
            { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
            { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: -1 },
            { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: 0 },
        ];

        const { getByTestId } = render(
            <RoundScorecard totalScore={0} coursePar={72} holes={holes} />
        );

        expect(getByTestId('scorecard-total')).toBeTruthy();
    });

    it('displays even par as E', () => {
        const { getByText } = render(
            <RoundScorecard totalScore={0} coursePar={72} holes={[]} />
        );

        expect(getByText('E')).toBeTruthy();
    });

    it('displays positive score with plus sign', () => {
        const { getByText } = render(
            <RoundScorecard totalScore={5} coursePar={72} holes={[]} />
        );

        expect(getByText('+5')).toBeTruthy();
    });

    it('displays negative score', () => {
        const { getByText } = render(
            <RoundScorecard totalScore={-3} coursePar={72} holes={[]} />
        );

        expect(getByText('-3')).toBeTruthy();
    });

    it('displays hole scores', () => {
        const holes = [
            { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
            { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: 0 },
            { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: -1 },
        ];

        const { getByTestId } = render(
            <RoundScorecard totalScore={0} coursePar={72} holes={holes} />
        );

        expect(getByTestId('hole-1-score')).toBeTruthy();
        expect(getByTestId('hole-2-score')).toBeTruthy();
        expect(getByTestId('hole-3-score')).toBeTruthy();
    });

    it('displays front 9 total when holes exist', () => {
        const holes = Array.from({ length: 9 }, (_, i) => ({
            Id: i + 1, RoundId: 1, HoleNumber: i + 1, ScoreRelativeToPar: 1,
        }));

        const { getByTestId } = render(
            <RoundScorecard totalScore={9} coursePar={72} holes={holes} />
        );

        expect(getByTestId('front-9-total')).toBeTruthy();
    });

    it('displays back 9 total when 18 holes exist', () => {
        const holes = Array.from({ length: 18 }, (_, i) => ({
            Id: i + 1, RoundId: 1, HoleNumber: i + 1, ScoreRelativeToPar: 0,
        }));

        const { getByTestId } = render(
            <RoundScorecard totalScore={0} coursePar={72} holes={holes} />
        );

        expect(getByTestId('back-9-total')).toBeTruthy();
    });

    it('displays course par', () => {
        const { getByText } = render(
            <RoundScorecard totalScore={0} coursePar={72} holes={[]} />
        );

        expect(getByText(/Par 72/)).toBeTruthy();
    });
});
