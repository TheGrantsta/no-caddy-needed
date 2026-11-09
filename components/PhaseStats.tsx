import React from 'react';
import DeadlySinsTally from './DeadlySinsTally';
import SinDetailsInput from './SinDetailsInput';
import { DeadlySinsValues, RoundPlayer, ClubDistance } from '../service/DbService';

interface Props {
    holeNumber: number;
    holePar: number;
    sins: DeadlySinsValues;
    onSinsChange: (sins: DeadlySinsValues) => void;
    players?: RoundPlayer[];
    userScore?: number;
    clubDistances: ClubDistance[];
    selectedOffTeeClub?: string;
    sinDetailsClubError: boolean;
    onOffTeeClubChange: (club: string) => void;
    selectedPenaltyType?: string;
    sinDetailsPenaltyError: boolean;
    onPenaltyTypeChange: (type: string) => void;
    selectedBogeysClub?: string;
    sinDetailsBogeysClubError: boolean;
    onBogeysClubChange: (club: string) => void;
    selectedDoubleChipReason?: string;
    sinDetailsDoubleChipReasonError: boolean;
    onDoubleChipReasonChange: (reason: string) => void;
}

// The deadly sins card, with each marked sin's follow-up (club, penalty, reason) shown directly under its row
export default function PhaseStats({
    holePar,
    sins,
    onSinsChange,
    userScore,
    clubDistances,
    selectedOffTeeClub,
    sinDetailsClubError,
    onOffTeeClubChange,
    selectedPenaltyType,
    sinDetailsPenaltyError,
    onPenaltyTypeChange,
    selectedBogeysClub,
    sinDetailsBogeysClubError,
    onBogeysClubChange,
    selectedDoubleChipReason,
    sinDetailsDoubleChipReasonError,
    onDoubleChipReasonChange,
}: Props) {
    const renderFollowUp = (slug: string) => {
        const followUpSin = {
            'trouble-off-tee': 'troubleOffTee',
            'penalties': 'penalties',
            'bogeys-inside-9iron': 'bogeysInside9Iron',
            'double-chips': 'doubleChips',
        }[slug] as 'troubleOffTee' | 'penalties' | 'bogeysInside9Iron' | 'doubleChips' | undefined;
        if (!followUpSin) return null;
        return (
            <SinDetailsInput
                sins={sins}
                only={followUpSin}
                clubs={clubDistances}
                selectedOffTeeClub={selectedOffTeeClub}
                onOffTeeClubChange={onOffTeeClubChange}
                showOffTeeClubError={sinDetailsClubError}
                selectedPenaltyType={selectedPenaltyType}
                onPenaltyTypeChange={onPenaltyTypeChange}
                showPenaltyTypeError={sinDetailsPenaltyError}
                selectedBogeysClub={selectedBogeysClub}
                onBogeysClubChange={onBogeysClubChange}
                showBogeysClubError={sinDetailsBogeysClubError}
                selectedDoubleChipReason={selectedDoubleChipReason}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
                showDoubleChipReasonError={sinDetailsDoubleChipReasonError}
            />
        );
    };

    return (
        <DeadlySinsTally
            holePar={holePar}
            deadlySinsValues={sins}
            onDeadlySinsChange={onSinsChange}
            onEndRound={() => { }}
            roundControlled={true}
            onValuesChange={onSinsChange}
            initialValues={sins}
            userScore={userScore}
            renderFollowUp={renderFollowUp}
        />
    );
}
