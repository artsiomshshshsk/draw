import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {FaMinus, FaPlus} from 'react-icons/fa6';

interface ActionBarProps {
    scale: number;
    setScale: (scale: number) => void;
    onZoom: (delta: number) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({scale, setScale, onZoom}) => {

    const handleZoomIn = () => {
        onZoom(0.1);
    }

    const handleZoomOut = () => {
        onZoom(-0.1);
    }

    return (
        <div className="flex z-10 fixed bottom-1 left-1">
            <Button variant="ghost" onClick={handleZoomIn}>
                <FaPlus/>
            </Button>
            <Input disabled className="border-none w-16 text-center p-0 m-0" onClick={() => setScale(1)}
                   value={new Intl.NumberFormat("en-GB", {style: "percent"}).format(scale)}/>
            <Button variant="ghost" onClick={handleZoomOut}>
                <FaMinus/>
            </Button>
        </div>
    );

}

export default ActionBar;