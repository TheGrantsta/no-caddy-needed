import type { ThemeColours } from './colours';

// Tab bar and scene styles, shared by the tab layout and by the Play screen,
// which hides the bar while a round is in progress.
export const tabBarStyleFor = (c: ThemeColours, bottomInset: number, hidden = false) => {
    if (hidden) {
        return { display: 'none' as const };
    }
    return {
        position: 'absolute' as const,
        left: 16,
        right: 16,
        bottom: bottomInset + 8,
        height: 76,
        borderRadius: 32,
        borderTopWidth: 0,
        backgroundColor: c.backgroundLight,
        shadowColor: c.black,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    };
};

export const sceneStyleFor = (c: ThemeColours, bottomInset: number, hidden = false) => {
    if (hidden) {
        return { backgroundColor: c.background };
    }
    return {
        // App background, so the navigator's dark-theme black never shows around the floating bar
        backgroundColor: c.background,
        // Leave room under the content so the floating bar never covers the last row of a screen
        paddingBottom: bottomInset + 76 + 8 + 16,
    };
};
