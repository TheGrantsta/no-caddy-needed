import type { WindEffect } from '../service/WeatherService';

export type WindEffectRow = { label: string; value: string };

export type WindEffectDescription = {
    title: string;
    subtitle: string;
    rows: WindEffectRow[];
};

// Components smaller than this (mph) round to nothing worth reporting
const MIN_REPORTED_MPH = 0.5;

const roundedMph = (mph: number): string => `${Math.round(Math.abs(mph))} mph`;

// Plain-English summary of a wind effect for the Wind tool: a headline, a subtitle, and a row
// for the along-the-line part (helping or hurting) and the cross part (left/right to right/left)
export const describeWindEffect = (effect: WindEffect): WindEffectDescription => {
    if (effect.category === 'calm') {
        return { title: 'Plays about the same', subtitle: 'Little or no wind effect', rows: [] };
    }

    const along = effect.alongComponentMph;
    const hasAlong = Math.abs(along) >= MIN_REPORTED_MPH;
    const hasCross = effect.crossDirection !== null && Math.abs(effect.crossComponentMph) >= MIN_REPORTED_MPH;

    const title = hasAlong ? (along > 0 ? 'Plays shorter' : 'Plays longer') : 'Plays about the same';

    const rows: WindEffectRow[] = [];
    const subtitleParts: string[] = [];

    if (hasAlong) {
        const label = along > 0 ? 'Helping' : 'Hurting';
        rows.push({ label, value: roundedMph(along) });
        subtitleParts.push(label);
    }
    if (hasCross) {
        const label = effect.crossDirection === 'left' ? 'Left to right' : 'Right to left';
        rows.push({ label, value: roundedMph(effect.crossComponentMph) });
        if (hasAlong) {
            subtitleParts.push(label.toLowerCase());
        }
    }

    // Without a along-the-line part the cross row already says it, so the subtitle is left empty
    // rather than repeating it; with no rows at all there is nothing to report
    const subtitle = subtitleParts.length > 0
        ? subtitleParts.join(', ')
        : rows.length === 0 ? 'Little or no wind effect' : '';

    return { title, subtitle, rows };
};
