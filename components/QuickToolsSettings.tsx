import React from 'react';
import { View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { QUICK_TOOL_COUNT, QUICK_TOOL_OPTIONS, optionsForQuickToolSlot } from '@/utils/quickTools';
import Dropdown from './Dropdown';
import SettingsSection from './SettingsSection';
import SettingsRow from './SettingsRow';

type Props = {
    // The three saved Quick tool slugs, in display order
    quickTools: string[];
    onQuickToolsChange: (quickTools: string[]) => void;
};

// Three slots on Home, each choosing a challenge or tool. A tool chosen in one slot is not offered in the others.
export default function QuickToolsSettings({ quickTools, onQuickToolsChange }: Props) {
    const styles = useStyles();
    const s = styles.settingsSheet;

    const labelOf = (slug: string) => QUICK_TOOL_OPTIONS.find(option => option.slug === slug)?.label ?? '';

    const chooseForSlot = (slot: number, label: string) => {
        const chosen = QUICK_TOOL_OPTIONS.find(option => option.label === label);
        if (!chosen) return;
        const next = quickTools.map((slug, index) => (index === slot ? chosen.slug : slug));
        onQuickToolsChange(next);
    };

    return (
        <SettingsSection title="QUICK TOOLS" footnote="Choose three challenges or tools for the Home screen.">
            {Array.from({ length: QUICK_TOOL_COUNT }, (_, slot) => (
                <View key={slot}>
                    {slot > 0 && <View style={s.rowDivider} />}
                    <SettingsRow label={`Shortcut ${slot + 1}`}>
                        <Dropdown
                            options={optionsForQuickToolSlot(quickTools, slot).map(option => option.label)}
                            selectedOption={labelOf(quickTools[slot])}
                            onSelectOption={label => chooseForSlot(slot, label)}
                            testIDPrefix={`quick-tool-${slot}`}
                        />
                    </SettingsRow>
                </View>
            ))}
        </SettingsSection>
    );
}
