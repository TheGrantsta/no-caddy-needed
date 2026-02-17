import ShortGameScreen from "@/components/ShortGameScreen";
import { getPuttingConfig } from "@/data/shortGameData";

export default function Putting() {
    return <ShortGameScreen config={getPuttingConfig()} />;
}
