import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";

export default function Bunker() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 750);
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>

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
                {/* Drill */}
                {/* {displaySection('short-game') && ( */}
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            Bunker drills
                        </Text>

                    </View>
                </View>
            </ScrollView>

        </GestureHandlerRootView>
    )
}
