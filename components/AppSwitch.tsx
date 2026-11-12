import React from 'react';
import { Switch, SwitchProps } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';

// The app's on/off switch: a grey-green track when off and the primary colour when on
export default function AppSwitch(props: SwitchProps) {
    const colours = useThemeColours();

    return <Switch trackColor={{ false: colours.tertiary, true: colours.primary }} {...props} />;
}
