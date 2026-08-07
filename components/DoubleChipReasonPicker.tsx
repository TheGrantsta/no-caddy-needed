import { DOUBLE_CHIP_REASONS } from '@/service/DbService';
import Dropdown from './Dropdown';

type Props = {
    selectedReason?: string;
    onSelectReason: (reason: string) => void;
    showError?: boolean;
};

const DoubleChipReasonPicker = ({
    selectedReason,
    onSelectReason,
    showError = false,
}: Props) => {
    return (
        <Dropdown
            options={Array.from(DOUBLE_CHIP_REASONS)}
            selectedOption={selectedReason}
            onSelectOption={onSelectReason}
            placeholder="Select reason"
            showError={showError}
            errorText="Required"
            testIDPrefix="double-chip-reason-picker"
        />
    );
};

export default DoubleChipReasonPicker;
