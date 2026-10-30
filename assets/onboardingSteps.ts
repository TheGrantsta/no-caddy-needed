// One short overlay per main screen. Keep each overlay to one or two steps.
export type OnboardingStep = { text: string };

export const ONBOARDING_STEPS: Record<'home' | 'play' | 'practice' | 'perform' | 'distances' | 'wedgeChart' | 'settings', OnboardingStep[]> = {
  home: [
    { text: 'Play tracks your rounds, Practice sharpens your game and Performance shows your stats. Tap the info icon to see this again.' },
  ],
  play: [
    { text: 'Start a round to score hole by hole with your playing partners.' },
    { text: 'Review your scorecard afterwards and track your 7 Deadly Sins over time.' },
  ],
  practice: [
    { text: 'Use Challenges and Tools to practise with purpose, and check History to track progress.' },
  ],
  perform: [
    { text: 'Performance shows how your rounds and putting are trending. Pick a tab to see that statistic.' },
  ],
  distances: [
    { text: 'Add your clubs and typical carry distances to use as a quick reference during a round.' },
  ],
  wedgeChart: [
    { text: 'Enter the carry distance for each club and swing length to build a reference for the course.' },
  ],
  settings: [
    { text: 'Set your units, notifications, sounds, voice and pre-shot routine here.' },
  ],
};
