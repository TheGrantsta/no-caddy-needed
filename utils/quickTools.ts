// The challenges and tools that can be shown as Quick tools on the Home screen.
// Each option is named once here, so the Settings picker, the Home tiles and the saved setting agree.
import type { Href } from 'expo-router';

export type QuickToolOption = {
    slug: string;
    label: string;
    icon: string;
    href: Href;
    group: 'Challenges' | 'Tools';
};

export const QUICK_TOOL_OPTIONS: QuickToolOption[] = [
    { slug: 'putting-simulation', label: 'Putting sim', icon: 'adjust', href: '/challenges/putting-simulation', group: 'Challenges' },
    { slug: 'up-and-down', label: 'Up-and-down', icon: 'flag', href: '/challenges/up-and-down', group: 'Challenges' },
    { slug: 'short-putting-ladder', label: 'Short putting', icon: 'stairs', href: '/challenges/short-putting-ladder', group: 'Challenges' },
    { slug: 'lag-putting', label: 'Lag putting', icon: 'trending-up', href: '/challenges/lag-putting', group: 'Challenges' },
    { slug: 'tempo', label: 'Tempo', icon: 'music-note', href: '/tools/tempo', group: 'Tools' },
    { slug: 'random', label: 'Random', icon: 'casino', href: '/tools/random', group: 'Tools' },
    { slug: 'reminders', label: 'Reminders', icon: 'notifications-none', href: '/tools/reminders', group: 'Tools' },
    { slug: 'wind', label: 'Wind', icon: 'air', href: '/tools/wind', group: 'Tools' },
];

// The practice cards show these two lists, in this order
export const CHALLENGE_OPTIONS = QUICK_TOOL_OPTIONS.filter(option => option.group === 'Challenges');
export const TOOL_OPTIONS = QUICK_TOOL_OPTIONS.filter(option => option.group === 'Tools');

// Exactly three Quick tools are shown on Home
export const QUICK_TOOL_COUNT = 3;

export const DEFAULT_QUICK_TOOLS: string[] = ['wind', 'tempo', 'random'];

const KNOWN_SLUGS = new Set(QUICK_TOOL_OPTIONS.map(option => option.slug));

// Reads the saved list. Anything that isn't exactly three different known tools falls back to the default.
export const parseQuickTools = (saved: string): string[] => {
    const slugs = saved.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0);
    const unique = new Set(slugs);
    const valid = slugs.length === QUICK_TOOL_COUNT && unique.size === QUICK_TOOL_COUNT && slugs.every(slug => KNOWN_SLUGS.has(slug));
    return valid ? slugs : DEFAULT_QUICK_TOOLS;
};

export const serializeQuickTools = (slugs: string[]): string => slugs.join(',');

// The options a slot can pick from: everything except the tools already chosen in the other slots
export const optionsForQuickToolSlot = (selected: string[], slot: number): QuickToolOption[] => {
    const taken = new Set(selected.filter((_, index) => index !== slot));
    return QUICK_TOOL_OPTIONS.filter(option => !taken.has(option.slug));
};
