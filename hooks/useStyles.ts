import { useMemo } from 'react';
import { createStyles } from '../assets/stlyes';
import { useThemeColours } from '../context/ThemeContext';

export const useStyles = () => {
    const colours = useThemeColours();
    return useMemo(() => createStyles(colours), [colours]);
};
