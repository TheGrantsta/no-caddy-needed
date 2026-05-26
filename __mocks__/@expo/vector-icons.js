import React from 'react';
import { Text } from 'react-native';

const MockIcon = ({ name, size }) => (
    <Text>{`Icon: ${name}, Size: ${size}`}</Text>
);

export const MaterialIcons = MockIcon;
export const Ionicons = MockIcon;
export const FontAwesome = MockIcon;

export default {
    MaterialIcons,
    Ionicons,
    FontAwesome,
};
