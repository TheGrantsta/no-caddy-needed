export type DrillSeedRecord = {
    category: string;
    label: string;
    iconName: string;
    target: string;
    objective: string;
    setUp: string;
    howToPlay: string;
};

export const drillSeedData: DrillSeedRecord[] = [
    // Putting
    {
        category: 'putting',
        label: 'Gate',
        iconName: 'data-array',
        target: '8 / 10',
        objective: 'improve accuracy and stroke path',
        setUp: "place two tees just wider than your putter head & practice putting from 3' through the \"gate\" without hitting the tees",
        howToPlay: 'ten putts in total. Repeat until you hit the target',
    },
    {
        category: 'putting',
        label: 'Clock',
        iconName: 'schedule',
        target: '8 / 10',
        objective: "work your putting stroke and get better at 4' putts",
        setUp: "5 tees & 1 golf ball. Create a 4' circle around the hole",
        howToPlay: 'go around twice. Ten putts in total. Repeat until you hit the target',
    },
    {
        category: 'putting',
        label: 'Ladder',
        iconName: 'sort',
        target: '10 / 12',
        objective: 'improve lag putting distance control',
        setUp: "5 tees & 3 golf balls. Place one tee at start, and then at 20', 25', 30' & 40'",
        howToPlay: 'putt to finish within 10% of distance. Repeat until you hit the target',
    },
    // Chipping
    {
        category: 'chipping',
        label: 'Gate',
        iconName: 'horizontal-distribute',
        target: '10 / 10',
        objective: 'improve accuracy and stroke path',
        setUp: "2 alignment sticks & balls. Two sticks in the ground just wider than your clubhead about 2' away",
        howToPlay: 'ten chip through the gate. Repeat until you hit the target',
    },
    {
        category: 'chipping',
        label: 'Hoop',
        iconName: 'adjust',
        target: '8 / 10',
        objective: 'improve ability to control landing spot',
        setUp: '8 tees & 2 golf balls. Create a circle with tees about 5 yards away',
        howToPlay: 'aim to land inside the circle. Repeat until you hit the target',
    },
    {
        category: 'chipping',
        label: 'One hand',
        iconName: 'back-hand',
        target: '8 / 10',
        objective: 'improve touch and feel around the greens',
        setUp: '1 tee & 3 golf balls. Place tee at a reasonable distance',
        howToPlay: 'chip one-handed. Repeat until you hit the target',
    },
    // Pitching
    {
        category: 'pitching',
        label: 'Three ball',
        iconName: 'track-changes',
        target: '3 / 3',
        objective: 'improve accuracy and distance control',
        setUp: 'select a target between 50 - 100 yards away',
        howToPlay: 'hit 3 shots at the same target. Success is +/- 5 yards',
    },
    {
        category: 'pitching',
        label: 'Wedge',
        iconName: 'av-timer',
        target: '3 / 3',
        objective: 'improve ability to control landing spot',
        setUp: "hit 3 balls swinging to 9 o'clock, 10 o'clock & full",
        howToPlay: 'monitor landing spot. Success is +/- 5 yards',
    },
    {
        category: 'pitching',
        label: 'Ladder',
        iconName: 'sort',
        target: '10 / 12',
        objective: 'improve touch and feel',
        setUp: 'place markers at 20, 30, 40, and 50 yards',
        howToPlay: 'hit 3 balls to each target, focusing on consistent carry distance. Repeat until you hit the target',
    },
    // Bunker
    {
        category: 'bunker',
        label: 'Line',
        iconName: 'linear-scale',
        target: '8 / 10',
        objective: 'improve low-point control',
        setUp: 'draw straight line in sand',
        howToPlay: 'make 10 swings and hit the sand from the line forward',
    },
    {
        category: 'bunker',
        label: 'Dollar bill',
        iconName: 'money',
        target: '8 / 10',
        objective: 'proper sand entry and clubface control',
        setUp: 'imagine ball sitting on a dollar bill',
        howToPlay: 'goal is to splash the entire "bill" out of the bunker, not just the ball',
    },
    {
        category: 'bunker',
        label: 'No ball',
        iconName: 'sports-golf',
        target: '10 / 12',
        objective: 'improve your understanding of bunker play',
        setUp: 'hit the sand without a ball, focusing on splashing the sand onto the green',
        howToPlay: 'splash sand onto the green. Repeat until you hit the target',
    },
];
