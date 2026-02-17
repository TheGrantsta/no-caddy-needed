import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';
import { t } from '../assets/i18n/i18n';

type Props = {
    showSubMenu: 'practice' | 'play' | 'perform' | 'putting' | 'chipping' | 'bunker' | 'pitching';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
}

const allSubMenuItems = [
    { testId: 'play-sub-menu-score', name: 'play-score', titleKey: 'subMenu.playScore' },
    { testId: 'play-sub-menu-distances', name: 'play-distances', titleKey: 'subMenu.playDistances' },
    { testId: 'play-sub-menu-wedge-chart', name: 'play-wedge-chart', titleKey: 'subMenu.playWedgeChart' },
    { testId: 'practice-sub-menu-short-game', name: 'short-game', titleKey: 'subMenu.shortGame' },
    { testId: 'practice-sub-menu-tools', name: 'tools', titleKey: 'subMenu.tools' },
    { testId: 'practice-sub-menu-history', name: 'history', titleKey: 'subMenu.history' },
    { testId: 'perform-sub-menu-approach', name: 'approach', titleKey: 'subMenu.approach' },
    { testId: 'perform-sub-menu-pro-stats', name: 'pros', titleKey: 'subMenu.pros' },
    { testId: 'putting-sub-menu-putting-drills', name: 'putting-drills', titleKey: 'subMenu.drills' },
    { testId: 'putting-sub-menu-putting-games', name: 'putting-games', titleKey: 'subMenu.games' },
    { testId: 'chipping-sub-menu-chipping-drills', name: 'chipping-drills', titleKey: 'subMenu.drills' },
    { testId: 'chipping-sub-menu-chipping-games', name: 'chipping-games', titleKey: 'subMenu.games' },
    { testId: 'pitching-sub-menu-pitching-drills', name: 'pitching-drills', titleKey: 'subMenu.drills' },
    { testId: 'pitching-sub-menu-pitching-games', name: 'pitching-games', titleKey: 'subMenu.games' },
    { testId: 'bunker-sub-menu-bunker-drills', name: 'bunker-drills', titleKey: 'subMenu.drills' },
    { testId: 'bunker-sub-menu-bunker-games', name: 'bunker-games', titleKey: 'subMenu.games' },
]

const SubMenu = ({ showSubMenu, selectedItem, handleSubMenu }: Props) => {
    const colours = useThemeColours();
    const subMenuItems = allSubMenuItems.filter(item => item.testId.startsWith(showSubMenu));

    const localStyles = useMemo(() => StyleSheet.create({
        subMenuContainer: {
            padding: 7,
            paddingBottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            backgroundColor: colours.background,
            borderBottomWidth: 0.5,
            borderBottomColor: colours.yellow
        },
        subMenuItemContainer: {
            flex: 1,
            alignItems: 'center',
        },
        subMenuItemContainerSelected: {
            borderBottomWidth: 4,
            borderBottomColor: colours.yellow,
        },
        subMenuItem: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
        },
        subMenuItemSelected: {
            textDecorationColor: colours.yellow,
            textDecorationStyle: 'solid',
            color: colours.yellow,
            fontSize: fontSizes.normal,
        }
    }), [colours]);

    return (
        <View style={localStyles.subMenuContainer}>
            {subMenuItems.map((item) => (
                <View key={item.testId} style={[localStyles.subMenuItemContainer, selectedItem === item.name ? localStyles.subMenuItemContainerSelected : null]}>
                    <TouchableOpacity testID={item.testId} onPress={() => handleSubMenu(item.name)}>
                        <Text style={[localStyles.subMenuItem, selectedItem === item.name ? localStyles.subMenuItemSelected : null]}>
                            {t(item.titleKey)}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View >
    )
};

export default SubMenu;
