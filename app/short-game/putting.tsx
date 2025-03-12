import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import SubMenu from "@/components/SubMenu";

export default function Putting() {
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState('putting-drills');

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 750);
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SubMenu showSubMenu='putting' selectedItem={section} handleSubMenu={handleSubMenu} />

            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        Release to update
                    </Text>
                </View>
            )}

            <ScrollView style={styles.scrollContainer} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.yellow} />
            }>
                {/* Drills */}
                {displaySection('putting-drills') && (
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Text style={[styles.headerText, styles.marginTop]}>
                                Putting drills
                            </Text>

                        </View>
                    </View>
                )}

                {/* Games */}
                {displaySection('putting-games') && (
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Text style={[styles.headerText, styles.marginTop]}>
                                Putting games
                            </Text>

                        </View>
                    </View>
                )}
            </ScrollView>

        </GestureHandlerRootView>
    )
}
