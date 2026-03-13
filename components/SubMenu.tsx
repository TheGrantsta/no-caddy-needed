import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    showSubMenu: 'practice' | 'play' | 'perform' | 'putting' | 'chipping' | 'bunker' | 'pitching';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
}

const allSubMenuItems = [
    { testId: 'play-sub-menu-score', name: 'play-score', title: 'Play' },
    { testId: 'play-sub-menu-distances', name: 'play-distances', title: 'Distances' },
    { testId: 'play-sub-menu-wedge-chart', name: 'play-wedge-chart', title: 'Wedge chart' },
    { testId: 'practice-sub-menu-short-game', name: 'short-game', title: 'Short game' },
    { testId: 'practice-sub-menu-tools', name: 'tools', title: 'Tools' },
    { testId: 'practice-sub-menu-history', name: 'history', title: 'History' },
    { testId: 'perform-sub-menu-approach', name: 'approach', title: 'Approach' },
    { testId: 'perform-sub-menu-pro-stats', name: 'pros', title: 'Pros' },
    { testId: 'putting-sub-menu-putting-drills', name: 'putting-drills', title: 'Drills' },
    { testId: 'putting-sub-menu-putting-games', name: 'putting-games', title: 'Games' },
    { testId: 'chipping-sub-menu-chipping-drills', name: 'chipping-drills', title: 'Drills' },
    { testId: 'chipping-sub-menu-chipping-games', name: 'chipping-games', title: 'Games' },
    { testId: 'pitching-sub-menu-pitching-drills', name: 'pitching-drills', title: 'Drills' },
    { testId: 'pitching-sub-menu-pitching-games', name: 'pitching-games', title: 'Games' },
    { testId: 'bunker-sub-menu-bunker-drills', name: 'bunker-drills', title: 'Drills' },
    { testId: 'bunker-sub-menu-bunker-games', name: 'bunker-games', title: 'Games' },
]

const SubMenu = ({ showSubMenu, selectedItem, handleSubMenu }: Props) => {
    const styles = useStyles();
    const subMenuItems = allSubMenuItems.filter(item => item.testId.startsWith(showSubMenu));

    return (
        <View style={styles.subMenu.subMenuContainer}>
            {subMenuItems.map((item) => (
                <View key={item.testId} style={[styles.subMenu.subMenuItemContainer, selectedItem === item.name ? styles.subMenu.subMenuItemContainerSelected : null]}>
                    <TouchableOpacity testID={item.testId} onPress={() => handleSubMenu(item.name)}>
                        <Text style={[styles.subMenu.subMenuItem, selectedItem === item.name ? styles.subMenu.subMenuItemSelected : null]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View >
    )
};

export default SubMenu;
