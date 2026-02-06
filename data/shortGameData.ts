import { ShortGameConfig } from '../types/ShortGame';

export const puttingConfig: ShortGameConfig = {
    category: 'putting',
    drills: [
        {
            label: 'Gate',
            iconName: 'data-array',
            target: '8 / 10',
            objective: 'improve accuracy and stroke path',
            setup: 'place two tees just wider than your putter head & practice putting from 3\' through the "gate" without hitting the tees',
            howToPlay: 'ten putts in total. Repeat until you hit the target'
        },
        {
            label: 'Clock',
            iconName: 'schedule',
            target: '8 / 10',
            objective: 'work your putting stroke and get better at 4\' putts',
            setup: '5 tees & 1 golf ball. Create a 4\' circle around the hole',
            howToPlay: 'go around twice. Ten putts in total. Repeat until you hit the target'
        },
        {
            label: 'Ladder',
            iconName: 'sort',
            target: '10 / 12',
            objective: 'improve lag putting distance control',
            setup: '5 tees & 3 golf balls. Place one tee at start, and then at 20\', 25\', 30\' & 40\'',
            howToPlay: 'putt to finish within 10% of distance. Repeat until you hit the target'
        },
    ],
    games: [
        {
            header: 'Around the world!',
            objective: 'make putts from various distances from the hole',
            setup: 'place tees in a circle around the hole, at distances of 3, 5, 7 & 9 feet',
            howToPlay: 'start at one tee and move to the next when the putt is made; if you miss, restart at 3 feet. Play until you complete the challenge'
        },
        {
            header: 'Ladder challenge!',
            objective: 'make 9 consecutive putts from a fixed distances',
            setup: 'place tees at 3, 5 & 7 feet and 3 balls',
            howToPlay: 'make 3 putts from each tee; if you miss, restart at 3 feet. Play until you complete the challenge'
        },
        {
            header: 'Par 18!',
            objective: 'treat each hole as a par-2 and aim to finish below par',
            setup: 'create 9 different putting "holes" on the practice green, with different slopes and breaks',
            howToPlay: 'complete the "course" by holing out on each hole. Play until you break "par"'
        },
    ],
    drillsFooter: 'Practicing different techniques & improving your feel will increase your confidence & reduce missed opportunities',
    gamesFooter: 'The games are designed to replicate the pressure of game situations, so only use ONE ball',
};

export const chippingConfig: ShortGameConfig = {
    category: 'chipping',
    drills: [
        {
            label: 'Gate',
            iconName: 'horizontal-distribute',
            target: '10 / 10',
            objective: 'improve accuracy and stroke path',
            setup: '2 alignment sticks & balls. Two sticks in the ground just wider than your clubhead about 2\' away',
            howToPlay: 'ten chip through the gate. Repeat until you hit the target'
        },
        {
            label: 'Hoop',
            iconName: 'adjust',
            target: '8 / 10',
            objective: 'improve ability to control landing spot',
            setup: '8 tees & 2 golf balls. Create a circle with tees about 5 yards away',
            howToPlay: 'aim to land inside the circle. Repeat until you hit the target'
        },
        {
            label: 'One hand',
            iconName: 'back-hand',
            target: '8 / 10',
            objective: 'improve touch and feel around the greens',
            setup: '1 tee & 3 golf balls. Place tee at a reasonable distance',
            howToPlay: 'chip one-handed. Repeat until you hit the target'
        },
    ],
    games: [
        {
            header: 'Up & down challenge!',
            objective: 'simulate real on-course pressure situations',
            setup: 'select a variety of chipping spots around the green (easy, moderate, difficult)',
            howToPlay: 'try to hole out in 2 shots or fewer. Track your personal best and aim to beat it'
        },
        {
            header: 'Ladder challenge!',
            objective: 'make 9 consecutive chips from a fixed distances',
            setup: 'place tees at 6, 9 & 12 feet',
            howToPlay: 'make 3 chips to each tee; if you miss, restart at 6 feet. Play until you complete the challenge'
        },
        {
            header: 'Par 18!',
            objective: 'treat each hole as a par-2 and aim to finish below par',
            setup: 'create 9 different putting "holes" on the practice green, with different slopes and breaks',
            howToPlay: 'complete the "course" by holing out on each hole. Play until you break "par"'
        },
    ],
    drillsFooter: 'Practicing different techniques & improving your feel will increase your confidence & reduce missed opportunities',
    gamesFooter: 'The games are designed to replicate the pressure of game situations, so only use ONE ball',
};

export const pitchingConfig: ShortGameConfig = {
    category: 'pitching',
    drills: [
        {
            label: 'Three ball',
            iconName: 'track-changes',
            target: '3 / 3',
            objective: 'improve accuracy and distance control',
            setup: 'select a target between 50 - 100 yards away',
            howToPlay: 'hit 3 shots at the same target. Success is +/- 5 yards'
        },
        {
            label: 'Wedge',
            iconName: 'av-timer',
            target: '3 / 3',
            objective: 'improve ability to control landing spot',
            setup: 'hit 3 balls swinging to 9 o\'clock, 10 o\'clock & full',
            howToPlay: 'monitor landing spot. Success is +/- 5 yards'
        },
        {
            label: 'Ladder',
            iconName: 'sort',
            target: '10 / 12',
            objective: 'improve touch and feel',
            setup: 'place markers at 20, 30, 40, and 50 yards',
            howToPlay: 'hit 3 balls to each target, focusing on consistent carry distance. Repeat until you hit the target'
        },
    ],
    games: [
        {
            header: 'Three club!',
            objective: 'develop feel and understand how each club performs',
            setup: 'choose three different wedges (e.g., lob wedge, sand wedge, and gap wedge)',
            howToPlay: 'hit to the same target with each club and compare results'
        },
        {
            header: 'Target challenge!',
            objective: 'control distance',
            setup: 'create a circle with tees at 3\' feet from the pin',
            howToPlay: 'hit 10 pitches to finish inside the target area. 2 points for inside, 1 point outside but on the green'
        },
        {
            header: '5-ball game!',
            objective: 'goal is to land all 5 on the green in a row, adding pressure',
            setup: 'hit 5 balls to a target from 30 - 50 yards',
            howToPlay: 'if you miss the green with one, restart the game'
        },
    ],
    drillsFooter: 'Practicing different techniques & improving your feel will increase your confidence & reduce missed opportunities',
    gamesFooter: 'The games are designed to replicate the pressure of game situations',
};

export const bunkerConfig: ShortGameConfig = {
    category: 'bunker',
    drills: [
        {
            label: 'Line',
            iconName: 'linear-scale',
            target: '8 / 10',
            objective: 'improve low-point control',
            setup: 'draw straight line in sand',
            howToPlay: 'make 10 swings and hit the sand from the line forward'
        },
        {
            label: 'Dollar bill',
            iconName: 'money',
            target: '8 / 10',
            objective: 'proper sand entry and clubface control',
            setup: 'imagine ball sitting on a dollar bill',
            howToPlay: 'goal is to splash the entire "bill" out of the bunker, not just the ball'
        },
        {
            label: 'No ball',
            iconName: 'sports-golf',
            target: '10 / 12',
            objective: 'improve your understanding of bunker play',
            setup: 'hit the sand without a ball, focusing on splashing the sand onto the green',
            howToPlay: 'splash sand onto the green. Repeat until you hit the target'
        },
    ],
    games: [
        {
            header: 'Up and down challenge!',
            objective: 'get up and down in 2 shots or fewer',
            setup: 'drop ball in bunker and choose target hole',
            howToPlay: 'try to get up and down 50% time of the time'
        },
        {
            header: 'Worst lie challenge!',
            objective: 'deal with adversity away from the course',
            setup: 'drop balls in difficult spots: buried, plugged, on a slope, or with an awkward stance',
            howToPlay: 'get the ball on the green. Close is better, but on is the minimum'
        },
        {
            header: '10-Point game!',
            objective: 'improve distance control and have fun',
            setup: 'place markers at 10\' (1 point), 6\' (3 points) & 3\' (5 points)',
            howToPlay: 'hit 10 bunker shots & count your score. Try to beat your best score'
        },
    ],
    drillsFooter: 'Practicing different techniques & improving your feel will increase your confidence & reduce missed opportunities',
    gamesFooter: 'The games are designed to replicate the pressure of game situations',
};
