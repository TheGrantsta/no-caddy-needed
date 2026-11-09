import { tabBarStyleFor, sceneStyleFor } from '../../assets/tabBarOptions';
import colours from '../../assets/colours';

describe('tab bar options', () => {
    it('shouldHideTheTabBarWhenHidden', () => {
        expect(tabBarStyleFor(colours, 34, true)).toEqual({ display: 'none' });
    });

    it('shouldShowTheFloatingTabBarWhenNotHidden', () => {
        const style = tabBarStyleFor(colours, 34, false);

        expect(style.display).toBeUndefined();
        expect(style.position).toBe('absolute');
        expect(style.left).toBe(16);
        expect(style.right).toBe(16);
    });

    it('shouldReserveSpaceForTheTabBarOnlyWhenItIsShown', () => {
        expect(sceneStyleFor(colours, 34, false).paddingBottom).toBeGreaterThan(0);
        expect(sceneStyleFor(colours, 34, true).paddingBottom).toBeUndefined();
    });
});
