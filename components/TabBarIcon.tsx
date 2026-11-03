import React, { ReactNode } from 'react';
import { ColorValue, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];
type IconColor = React.ComponentProps<typeof MaterialIcons>['color'];

interface Props {
    name: IconName;
    color: ColorValue;
    focused: boolean;
    // Extra elements that should move with the icon, such as the Practice overdue badge
    children?: ReactNode;
}

// Tab bar icon with a short bar above it. The bar takes the active tint on the focused tab and is
// transparent otherwise, so the icons stay aligned whichever tab is selected.
export default function TabBarIcon({ name, color, focused, children }: Props) {
    return (
        <View style={{ alignItems: 'center' }}>
            <View
                testID="tab-icon-indicator"
                style={{
                    width: 32,
                    height: 4,
                    borderRadius: 2,
                    marginBottom: 6,
                    backgroundColor: focused ? color : 'transparent',
                }}
            />
            {/* React Navigation's ColorValue is wider than MaterialIcons' colour type; the value is a plain colour string */}
            <MaterialIcons name={name} color={color as IconColor} size={32} />
            {children}
        </View>
    );
}
