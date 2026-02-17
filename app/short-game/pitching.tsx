import ShortGameScreen from "@/components/ShortGameScreen";
import { getPitchingConfig } from "@/data/shortGameData";

export default function Pitching() {
    return <ShortGameScreen config={getPitchingConfig()} />;
}
