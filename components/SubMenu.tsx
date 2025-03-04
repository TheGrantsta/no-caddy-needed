import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    showSubMenu: 'practice' | 'on-course' | 'stats';
    selectedItem: string;
    handleSubMenu: (arg: string) => void;
}

const allSubMenuItems = [
    { testId: 'practice-sub-menu-short-game', name: 'short-game', title: 'Short game' },
    { testId: 'practice-sub-menu-tools', name: 'tools', title: 'Tools' },
    { testId: 'practice-sub-menu-general', name: 'general', title: 'General' },
    { testId: 'on-course-sub-menu-approach', name: 'approach', title: 'Approach' },
    { testId: 'on-course-sub-menu-wedge-chart', name: 'wedge-chart', title: 'Wedge chart' },
    { testId: 'stats-sub-menu-your-game', name: 'your-game', title: 'Your game' },
    { testId: 'stats-sub-menu-approach', name: 'approach', title: 'Approach' },
    { testId: 'stats-sub-menu-putting', name: 'putting', title: 'Putting' },
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
        borderBottomColor: colours.backgroundLight,
        borderBottomWidth: 0.5,
        backgroundColor: colours.background
    },
    subMenuItem: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
    },
    subMenuItemSelected: {
        fontWeight: 'bold'
    }
});
