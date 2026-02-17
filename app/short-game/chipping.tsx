import ShortGameScreen from "@/components/ShortGameScreen";
import { getChippingConfig } from "@/data/shortGameData";

export default function Chipping() {
    return <ShortGameScreen config={getChippingConfig()} />;
}
