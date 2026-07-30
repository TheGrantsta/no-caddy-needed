import { PENALTY_TYPES } from '@/service/DbService';
import Dropdown from './Dropdown';

type Props = {
    selectedPenaltyType?: string;
    onSelectPenaltyType: (type: string) => void;
    showError?: boolean;
};

const PenaltyTypePicker = ({
    selectedPenaltyType,
    onSelectPenaltyType,
    showError = false,
}: Props) => {
    return (
        <Dropdown
            options={Array.from(PENALTY_TYPES)}
            selectedOption={selectedPenaltyType}
            onSelectOption={onSelectPenaltyType}
            placeholder="Select penalty type"
            showError={showError}
            errorText="Required"
            testIDPrefix="penalty-type-picker"
        />
    );
};

export default PenaltyTypePicker;
