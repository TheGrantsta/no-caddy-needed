import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    showSubMenu: 'practice' | 'on-course' | 'putting' | 'chipping' | 'bunker';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
}

const allSubMenuItems = [
    { testId: 'practice-sub-menu-short-game', name: 'short-game', title: 'Short game' },
    { testId: 'practice-sub-menu-tools', name: 'tools', title: 'Tools' },
    { testId: 'practice-sub-menu-history', name: 'history', title: 'History' },
    { testId: 'on-course-sub-menu-approach', name: 'approach', title: 'Approach' },
    { testId: 'on-course-sub-menu-wedge-chart', name: 'wedge-chart', title: 'Wedge chart' },
    { testId: 'on-course-sub-menu-pro-stats', name: 'pros', title: 'Pros' },
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
    const subMenuItems = allSubMenuItems.filter(item => item.testId.startsWith(showSubMenu));

    return (
        <View style={localStyles.subMenuContainer}>
            {subMenuItems.map((item) => (
                <View key={item.testId}>
                    <TouchableOpacity testID={item.testId} onPress={() => handleSubMenu(item.name)}>
                        <Text style={[localStyles.subMenuItem, selectedItem === item.name ? localStyles.subMenuItemSelected : null]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View >
    )
};

export default SubMenu;

const localStyles = StyleSheet.create({
    subMenuContainer: {
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderBottomColor: colours.yellow,
        borderBottomWidth: 0.5,
        backgroundColor: colours.background,
    },
    subMenuItem: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
    },
    subMenuItemSelected: {
        textDecorationLine: 'underline',
        textDecorationColor: colours.yellow,
        textDecorationStyle: 'solid',
        color: colours.yellow,
        fontSize: fontSizes.normal,
    }
});
