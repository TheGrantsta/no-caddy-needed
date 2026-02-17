import ShortGameScreen from "@/components/ShortGameScreen";
import { getBunkerConfig } from "@/data/shortGameData";

export default function Bunker() {
    return <ShortGameScreen config={getBunkerConfig()} />;
}
