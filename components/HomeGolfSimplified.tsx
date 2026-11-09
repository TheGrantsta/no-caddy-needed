import React from 'react';
import ExpandableInfoCard from './ExpandableInfoCard';

const POINTS = ['Enjoyment: golf is a game', 'Method: hit it, find it, hit it again', 'Objective: get the ball in the hole with the fewest shots'];

// Collapsible card with the three simple ideas behind the game
export default function HomeGolfSimplified() {
    return (
        <ExpandableInfoCard icon="menu-book" title="Golf, simplified" points={POINTS} testIDPrefix="golf-simplified" />
    );
}
