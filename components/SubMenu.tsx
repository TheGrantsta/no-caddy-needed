import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    showSubMenu: 'practice' | 'perform';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
    // 'pill' gives the iOS-style grey track with a white selected pill
    variant?: 'default' | 'pill';
}

const allSubMenuItems = [
    { testId: 'practice-sub-menu-challenges', name: 'challenges', title: 'Challenges' },
    { testId: 'practice-sub-menu-tools', name: 'tools', title: 'Tools' },
    { testId: 'practice-sub-menu-history', name: 'history', title: 'History' },
    { testId: 'perform-sub-menu-rounds', name: 'rounds', title: 'Rounds' },
    { testId: 'perform-sub-menu-sins', name: 'sins', title: 'Sins' },
    { testId: 'perform-sub-menu-putting', name: 'putting', title: 'Putting' },
    { testId: 'perform-sub-menu-proximity', name: 'proximity', title: 'Proximity' },
]

const SubMenu = ({ showSubMenu, selectedItem, handleSubMenu, variant = 'default' }: Props) => {
    const styles = useStyles();
    const pill = variant === 'pill';
    const subMenuItems = allSubMenuItems.filter(item => item.testId.startsWith(showSubMenu));

    return (
        <View style={pill ? styles.subMenu.pillContainer : styles.subMenu.subMenuContainer}>
            {subMenuItems.map((item) => (
                <View key={item.testId} style={pill
                    ? [styles.subMenu.pillItemContainer, selectedItem === item.name ? styles.subMenu.pillItemSelected : null]
                    : [styles.subMenu.subMenuItemContainer, selectedItem === item.name ? styles.subMenu.subMenuItemContainerSelected : null]}>
                    <TouchableOpacity
                        testID={item.testId}
                        onPress={() => handleSubMenu(item.name)}
                        accessibilityRole="tab"
                        accessibilityLabel={item.title}
                        accessibilityState={{ selected: selectedItem === item.name }}
                    >
                        <Text style={pill
                            ? [styles.subMenu.pillItemText, selectedItem === item.name ? styles.subMenu.pillItemTextSelected : null]
                            : [styles.subMenu.subMenuItem, selectedItem === item.name ? styles.subMenu.subMenuItemSelected : null]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View >
    )
};

export default SubMenu;
