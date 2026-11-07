import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    showSubMenu: 'practice' | 'bag' | 'perform';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
}

const allSubMenuItems = [
    { testId: 'bag-sub-menu-distances', name: 'bag-distances', title: 'Distances' },
    { testId: 'bag-sub-menu-wedge-chart', name: 'bag-wedge-chart', title: 'Wedge Chart' },
    { testId: 'practice-sub-menu-challenges', name: 'challenges', title: 'Challenges' },
    { testId: 'practice-sub-menu-tools', name: 'tools', title: 'Tools' },
    { testId: 'practice-sub-menu-history', name: 'history', title: 'History' },
    { testId: 'perform-sub-menu-sins', name: 'sins', title: 'Deadly Sins' },
    { testId: 'perform-sub-menu-putting', name: 'putting', title: 'Putting' },
    { testId: 'perform-sub-menu-proximity', name: 'proximity', title: 'Proximity' },
    { testId: 'perform-sub-menu-rounds', name: 'rounds', title: 'Rounds' },
]

const SubMenu = ({ showSubMenu, selectedItem, handleSubMenu }: Props) => {
    const styles = useStyles();
    const subMenuItems = allSubMenuItems.filter(item => item.testId.startsWith(showSubMenu));

    return (
        <View style={styles.subMenu.subMenuContainer}>
            {subMenuItems.map((item) => (
                <View key={item.testId} style={[styles.subMenu.subMenuItemContainer, selectedItem === item.name ? styles.subMenu.subMenuItemContainerSelected : null]}>
                    <TouchableOpacity
                        testID={item.testId}
                        onPress={() => handleSubMenu(item.name)}
                        accessibilityRole="tab"
                        accessibilityLabel={item.title}
                        accessibilityState={{ selected: selectedItem === item.name }}
                    >
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
