import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenWrapper from '../../app/screen-wrapper';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => ({ background: '#25292e' }),
}));

describe('ScreenWrapper', () => {
    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<ScreenWrapper />);
        expect(toJSON()).toBeTruthy();
    });

    it('rendersChildren', () => {
        const { getByText } = render(
            <ScreenWrapper>
                <Text>test content</Text>
            </ScreenWrapper>
        );
        expect(getByText('test content')).toBeTruthy();
    });

    it('appliesBackgroundColourFromTheme', () => {
        const { toJSON } = render(<ScreenWrapper />);
        const root = toJSON() as any;
        expect(root.props.style).toEqual(
            expect.objectContaining({ backgroundColor: '#25292e' })
        );
    });

    it('appliesHorizontalPadding', () => {
        const { toJSON } = render(<ScreenWrapper />);
        const root = toJSON() as any;
        expect(root.props.style).toEqual(
            expect.objectContaining({ paddingLeft: 10, paddingRight: 10 })
        );
    });

    it('appliesFlexOne', () => {
        const { toJSON } = render(<ScreenWrapper />);
        const root = toJSON() as any;
        expect(root.props.style).toEqual(
            expect.objectContaining({ flex: 1 })
        );
    });
});
