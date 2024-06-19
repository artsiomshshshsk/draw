import React from 'react';
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import {FaSquare, FaMinus, FaCircle, FaArrowPointer} from 'react-icons/fa6';
import {DrawElementType} from "@/domain.ts";

interface ToolbarProps {
    tool: DrawElementType;
    setTool: (tool: DrawElementType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({tool, setTool}) => {

    const handleToolChange = (tool: DrawElementType) => {
        setTool(tool);
    }

    return (
        <ToggleGroup className="flex flex-row fixed inset-x-2/4 z-10 p-2 m-2" type="single" value={tool} aria-label="Drawing-tools" onValueChange={handleToolChange}>
            <ToggleGroupItem value="TRANSFORM" aria-label="Transform">
                <FaArrowPointer/>
            </ToggleGroupItem>
            <ToggleGroupItem value="RECTANGLE" aria-label="Rectangle">
                <FaSquare/>
            </ToggleGroupItem>
            <ToggleGroupItem value="LINE" aria-label="Line">
                <FaMinus/>
            </ToggleGroupItem>
            <ToggleGroupItem value="CIRCLE" aria-label="Circle">
                <FaCircle/>
            </ToggleGroupItem>
        </ToggleGroup>
    );
};

export default Toolbar;
