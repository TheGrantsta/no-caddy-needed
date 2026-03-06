export type GameSeedRecord = {
    category: string;
    header: string;
    objective: string;
    setUp: string;
    howToPlay: string;
};

export const gameSeedData: GameSeedRecord[] = [
    // Putting
    {
        category: 'putting',
        header: 'Around the world!',
        objective: 'make putts from various distances from the hole',
        setUp: 'place tees in a circle around the hole, at distances of 3, 5, 7 & 9 feet',
        howToPlay: 'start at one tee and move to the next when the putt is made; if you miss, restart at 3 feet. Play until you complete the challenge',
    },
    {
        category: 'putting',
        header: 'Ladder challenge!',
        objective: 'make 9 consecutive putts from a fixed distances',
        setUp: 'place tees at 3, 5 & 7 feet and 3 balls',
        howToPlay: 'make 3 putts from each tee; if you miss, restart at 3 feet. Play until you complete the challenge',
    },
    {
        category: 'putting',
        header: 'Par 18!',
        objective: 'treat each hole as a par-2 and aim to finish below par',
        setUp: 'create 9 different putting "holes" on the practice green, with different slopes and breaks',
        howToPlay: 'complete the "course" by holing out on each hole. Play until you break "par"',
    },
    // Chipping
    {
        category: 'chipping',
        header: 'Up & down challenge!',
        objective: 'simulate real on-course pressure situations',
        setUp: 'select a variety of chipping spots around the green (easy, moderate, difficult)',
        howToPlay: 'try to hole out in 2 shots or fewer. Track your personal best and aim to beat it',
    },
    {
        category: 'chipping',
        header: 'Ladder challenge!',
        objective: 'make 9 consecutive chips from a fixed distances',
        setUp: 'place tees at 6, 9 & 12 feet',
        howToPlay: 'make 3 chips to each tee; if you miss, restart at 6 feet. Play until you complete the challenge',
    },
    {
        category: 'chipping',
        header: 'Par 18!',
        objective: 'treat each hole as a par-2 and aim to finish below par',
        setUp: 'create 9 different putting "holes" on the practice green, with different slopes and breaks',
        howToPlay: 'complete the "course" by holing out on each hole. Play until you break "par"',
    },
    // Pitching
    {
        category: 'pitching',
        header: 'Three club!',
        objective: 'develop feel and understand how each club performs',
        setUp: 'choose three different wedges (e.g., lob wedge, sand wedge, and gap wedge)',
        howToPlay: 'hit to the same target with each club and compare results',
    },
    {
        category: 'pitching',
        header: 'Target challenge!',
        objective: 'control distance',
        setUp: "create a circle with tees at 3' feet from the pin",
        howToPlay: 'hit 10 pitches to finish inside the target area. 2 points for inside, 1 point outside but on the green',
    },
    {
        category: 'pitching',
        header: '5-ball game!',
        objective: 'goal is to land all 5 on the green in a row, adding pressure',
        setUp: 'hit 5 balls to a target from 30 - 50 yards',
        howToPlay: 'if you miss the green with one, restart the game',
    },
    // Bunker
    {
        category: 'bunker',
        header: 'Up and down challenge!',
        objective: 'get up and down in 2 shots or fewer',
        setUp: 'drop ball in bunker and choose target hole',
        howToPlay: 'try to get up and down 50% time of the time',
    },
    {
        category: 'bunker',
        header: 'Worst lie challenge!',
        objective: 'deal with adversity away from the course',
        setUp: 'drop balls in difficult spots: buried, plugged, on a slope, or with an awkward stance',
        howToPlay: 'get the ball on the green. Close is better, but on is the minimum',
    },
    {
        category: 'bunker',
        header: '10-Point game!',
        objective: 'improve distance control and have fun',
        setUp: "place markers at 10' (1 point), 6' (3 points) & 3' (5 points)",
        howToPlay: "hit 10 bunker shots & count your score. Try to beat your best score",
    },
];
